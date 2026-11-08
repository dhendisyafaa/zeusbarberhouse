import { db } from '@/src/prisma/db';
import { and, or } from '@prisma/orm-postgres/orm-client';
import { conflict, notFound, unprocessable } from '@/lib/api/errors';
import type { CreateBookingInput } from '@/lib/schemas/booking.schema';
import { getAvailableTimeSlots, getBandungDateTimeParts } from './availability.service';

/**
 * Checks if a time range [startsAt, endsAt) overlaps any active booking for the given barber.
 * Uses lazy evaluation for soft-lock expiry.
 */
export async function checkBarberConflict(
  barberId: string,
  startsAt: Date,
  endsAt: Date,
  excludeBookingId?: string,
): Promise<boolean> {
  const now = new Date();

  const conflicting = await db.orm.public.Booking
    .where({ barberId })
    .where((booking) =>
      excludeBookingId ? booking.id.neq(excludeBookingId) : booking.id.isNotNull(),
    )
    .where((booking) =>
      or(
        booking.status.eq('AWAITING_CONFIRMATION'),
        booking.status.eq('CONFIRMED'),
        and(
          booking.status.eq('PENDING_PAYMENT'),
          booking.holdExpiresAt.gt(now),
        ),
      ),
    )
    .where((booking) => and(
      booking.startsAt.lt(endsAt),
      booking.endsAt.gt(startsAt),
    ))
    .first();

  return conflicting !== null;
}

/**
 * Creates a new booking with PENDING_PAYMENT status and soft-lock.
 * Validates availability, branch/barber active state, and schedules.
 */
export async function createBooking(
  input: CreateBookingInput,
  customerId: string | null,
) {
  // 1. Load policy
  const policy = await db.orm.public.BookingPolicy.first({ id: 'default' });
  const bufferMinutes = policy?.bufferMinutes ?? 0;
  const softLockMinutes = policy?.softLockMinutes ?? 15;

  // 2. Validate branch
  const branch = await db.orm.public.Branch.first({ id: input.branchId });
  if (!branch || !branch.isActive) throw notFound('Cabang');

  // 3. Validate barber belongs to branch and is active
  const barber = await db.orm.public.Barber.first({ id: input.barberId });
  if (!barber || !barber.isActive) throw notFound('Capster');
  if (barber.branchId !== input.branchId)
    throw unprocessable('Capster tidak berada di cabang yang dipilih');

  // 4. Load services
  const services = await db.orm.public.Service
    .where((service) => service.id.in(input.serviceIds))
    .where({ isActive: true })
    .all();

  if (services.length !== input.serviceIds.length) {
    throw unprocessable('Satu atau lebih layanan tidak ditemukan atau tidak aktif');
  }

  // 5. Calculate time range
  const totalDuration = services.reduce((acc, service) => acc + service.durationMinutes, 0);
  const startsAt = new Date(input.startsAt);
  const endsAt = new Date(startsAt.getTime() + totalDuration * 60 * 1000);
  const holdExpiry = new Date(Date.now() + softLockMinutes * 60 * 1000);
  const localStart = getBandungDateTimeParts(startsAt);
  const availableSlots = await getAvailableTimeSlots({
    branchId: input.branchId,
    barberId: input.barberId,
    date: localStart.date,
    durationMinutes: totalDuration,
  });
  if (!availableSlots.includes(localStart.time)) {
    throw unprocessable('Jadwal capster tidak tersedia pada waktu tersebut');
  }

  // 6. Guest validation
  if (!customerId && (!input.guestName || !input.guestPhone)) {
    throw unprocessable('Nama dan nomor telepon wajib diisi untuk booking tamu');
  }

  // 7. Check for an existing overlapping booking.
  const hasConflict = await checkBarberConflict(
    input.barberId,
    startsAt,
    endsAt,
  );
  if (hasConflict) throw conflict('Jadwal capster tidak tersedia pada waktu tersebut');

  // 8. Create booking with items in a transaction
  const booking = await db.transaction(async (tx) => {
    // Re-check conflict inside transaction for race-condition safety
    const conflicting = await tx.orm.public.Booking
      .where({ barberId: input.barberId })
      .where((booking) =>
        or(
          booking.status.eq('AWAITING_CONFIRMATION'),
          booking.status.eq('CONFIRMED'),
          and(
            booking.status.eq('PENDING_PAYMENT'),
            booking.holdExpiresAt.gt(new Date()),
          ),
        ),
      )
      .where((booking) => and(
        booking.startsAt.lt(endsAt),
        booking.endsAt.gt(startsAt),
      ))
      .first();
    if (conflicting) throw conflict('Jadwal capster tidak tersedia pada waktu tersebut');

    if (customerId && (input.guestName || input.guestPhone)) {
      await tx.orm.public.Customer.where({ id: customerId }).update({
        ...(input.guestName ? { name: input.guestName.trim() } : {}),
        ...(input.guestPhone ? { phone: input.guestPhone.trim() } : {}),
      });
    }

    const newBooking = await tx.orm.public.Booking
      .include('items')
      .include('branch')
      .include('barber')
      .include('customer')
      .create({
        customerId,
        branchId: input.branchId,
        barberId: input.barberId,
        guestName: customerId ? null : (input.guestName ?? null),
        guestPhone: customerId ? null : (input.guestPhone ?? null),
        startsAt,
        endsAt,
        bufferMinutesSnapshot: bufferMinutes,
        status: 'PENDING_PAYMENT',
        holdExpiresAt: holdExpiry,
        note: input.note ?? null,
        items: (items) => items.create(
          input.serviceIds.map((serviceId, index) => {
            const svc = services.find((service) => service.id === serviceId)!;
            return {
              serviceId,
              serviceNameSnapshot: svc.name,
              unitPriceRupiahSnapshot: svc.priceRupiah,
              durationMinutesSnapshot: svc.durationMinutes,
              sortOrder: index,
            };
          }),
        ),
        statusEvents: (events) => events.create({
            fromStatus: null,
            toStatus: 'PENDING_PAYMENT',
          }),
      });

    return newBooking;
  });

  return booking;
}

/**
 * Marks a PENDING_PAYMENT booking as AWAITING_CONFIRMATION after proof upload.
 * Validates that the booking is not expired.
 */
export async function markBookingAwaitingConfirmation(
  bookingId: string,
  proofStoragePath: string,
  paymentOptionId: string,
) {
  const booking = await db.orm.public.Booking.first({ id: bookingId });
  if (!booking) throw notFound('Booking');

  if (booking.status !== 'PENDING_PAYMENT') {
    throw unprocessable(
      `Bukti pembayaran hanya dapat diunggah saat status booking adalah PENDING_PAYMENT. Status saat ini: ${booking.status}`,
    );
  }

  if (booking.holdExpiresAt && booking.holdExpiresAt < new Date()) {
    const now = new Date();
    await db.transaction(async (tx) => {
      const expired = await tx.orm.public.Booking
        .where({ id: bookingId, status: 'PENDING_PAYMENT' })
        .where((row) => row.holdExpiresAt.lte(now))
        .updateAndCount({ status: 'CANCELLED' });
      if (expired > 0) {
        await tx.orm.public.BookingStatusEvent.create({
            bookingId,
            fromStatus: 'PENDING_PAYMENT',
            toStatus: 'CANCELLED',
            note: 'Soft-lock kedaluwarsa secara otomatis',
        });
      }
    });
    throw unprocessable('Waktu pembayaran telah habis. Booking dibatalkan secara otomatis');
  }

  const updated = await db.transaction(async (tx) => {
    const paymentOption = await tx.orm.public.PaymentOption.first({
      id: paymentOptionId,
      isActive: true,
    });
    if (!paymentOption || !['BANK_TRANSFER', 'QRIS'].includes(paymentOption.method)) {
      throw unprocessable('Metode pembayaran tidak tersedia. Muat ulang pilihan pembayaran.');
    }
    if (
      paymentOption.method === 'BANK_TRANSFER' &&
      (!paymentOption.bankName || !paymentOption.accountNumber || !paymentOption.accountHolder)
    ) {
      throw unprocessable('Detail rekening untuk metode pembayaran ini belum lengkap');
    }
    if (paymentOption.method === 'QRIS' && !paymentOption.qrImagePath) {
      throw unprocessable('QRIS belum memiliki gambar pembayaran yang valid');
    }

    const now = new Date();
    const claimed = await tx.orm.public.Booking
      .where({ id: bookingId, status: 'PENDING_PAYMENT' })
      .where((row, { fns }) =>
        fns.or(row.holdExpiresAt.isNull(), row.holdExpiresAt.gt(now)),
      )
      .updateAndCount({ status: 'AWAITING_CONFIRMATION' });
    if (claimed !== 1) {
      throw conflict('Booking sudah diproses atau waktu pembayaran telah habis');
    }

    await tx.orm.public.BookingStatusEvent.create({
        bookingId,
        fromStatus: 'PENDING_PAYMENT',
        toStatus: 'AWAITING_CONFIRMATION',
        note: 'Bukti pembayaran diunggah',
    });

    // Find or create transaction for this booking
    let transaction = await tx.orm.public.Transaction.first({ bookingId });

    if (!transaction) {
      // Calculate total from booking items
      const items = await tx.orm.public.BookingItem.where({ bookingId }).all();
      const totalAmountRupiah = items.reduce(
        (acc, item) => acc + item.unitPriceRupiahSnapshot,
        0,
      );

      transaction = await tx.orm.public.Transaction.create({
          bookingId,
          branchId: booking.branchId,
          customerId: booking.customerId,
          totalAmountRupiah,
          status: 'PENDING',
          items: (transactionItems) => transactionItems.create(
            items.map((item) => ({
              serviceId: item.serviceId,
              nameSnapshot: item.serviceNameSnapshot,
              quantity: 1,
              unitPriceRupiahSnapshot: item.unitPriceRupiahSnapshot,
            })),
          ),
      });
    }

    const destinationSnapshot = paymentOption.method === 'BANK_TRANSFER'
      ? `${paymentOption.bankName} · ${paymentOption.accountNumber} · a.n. ${paymentOption.accountHolder}`
      : `QRIS · ${paymentOption.qrImagePath}`;
    const payment = await tx.orm.public.Payment.create({
        transactionId: transaction.id,
        paymentOptionId: paymentOption.id,
        method: paymentOption.method,
        methodLabelSnapshot: paymentOption.label,
        destinationSnapshot,
        status: 'PROOF_SUBMITTED',
        amountRupiah: transaction.totalAmountRupiah,
        proofStoragePath,
        proofUploadedAt: new Date(),
        statusEvents: (events) => events.create({
            fromStatus: 'PENDING',
            toStatus: 'PROOF_SUBMITTED',
          }),
    });

    return { payment, transaction };
  });

  return updated;
}

/**
 * Admin updates booking status.
 * On COMPLETED with a member customer, awards points.
 */
export async function adminUpdateBookingStatus(
  bookingId: string,
  newStatus: 'CONFIRMED' | 'REJECTED' | 'COMPLETED',
  actorProfileId: string,
  note?: string,
) {
  const booking = await db.orm.public.Booking
    .where({ id: bookingId })
    .include('customer', (customer) => customer.include('membership'))
    .first();
  if (!booking) throw notFound('Booking');

  const allowedTransitions: Record<string, string[]> = {
    AWAITING_CONFIRMATION: ['CONFIRMED', 'REJECTED'],
    CONFIRMED: ['COMPLETED'],
  };

  const allowed = allowedTransitions[booking.status] ?? [];
  if (!allowed.includes(newStatus)) {
    throw unprocessable(
      `Tidak dapat mengubah status dari ${booking.status} ke ${newStatus}`,
    );
  }

  await db.transaction(async (tx) => {
    const changed = await tx.orm.public.Booking
      .where({ id: bookingId, status: booking.status })
      .updateAndCount({ status: newStatus });
    if (changed !== 1) throw conflict('Status booking sudah berubah. Muat ulang data.');

    await tx.orm.public.BookingStatusEvent.create({
        bookingId,
        fromStatus: booking.status,
        toStatus: newStatus,
        actorProfileId,
        note: note ?? null,
    });

    // Synchronize transaction and payment status
    const transaction = await tx.orm.public.Transaction
      .where({ bookingId })
      .include('payments')
      .first();

    if (
      newStatus === 'CONFIRMED' &&
      (!transaction || !transaction.payments.some(
        (payment) =>
          (payment.status === 'PROOF_SUBMITTED' || payment.status === 'PENDING') &&
          payment.proofStoragePath,
      ))
    ) {
      throw unprocessable('Booking tidak memiliki bukti pembayaran yang dapat diverifikasi');
    }

    if (transaction) {
      if (newStatus === 'CONFIRMED' || newStatus === 'COMPLETED') {
        await tx.orm.public.Transaction
          .where({ id: transaction.id })
          .update({ status: 'PAID' });

        // Update all PROOF_SUBMITTED or PENDING payments to VERIFIED
        for (const payment of transaction.payments) {
          if (payment.status === 'PROOF_SUBMITTED' || payment.status === 'PENDING') {
            await tx.orm.public.Payment.where({ id: payment.id }).update({
                status: 'VERIFIED',
                verifiedAt: new Date(),
                statusEvents: (events) => events.create({
                    fromStatus: payment.status,
                    toStatus: 'VERIFIED',
                    actorProfileId,
                    note: note ?? 'Pembayaran diverifikasi oleh admin',
                  }),
            });
          }
        }
      } else if (newStatus === 'REJECTED') {
        await tx.orm.public.Transaction
          .where({ id: transaction.id })
          .update({ status: 'VOIDED' });

        for (const payment of transaction.payments) {
          if (payment.status === 'PROOF_SUBMITTED' || payment.status === 'PENDING') {
            await tx.orm.public.Payment.where({ id: payment.id }).update({
                status: 'REJECTED',
                statusEvents: (events) => events.create({
                    fromStatus: payment.status,
                    toStatus: 'REJECTED',
                    actorProfileId,
                    note: note ?? 'Bukti pembayaran ditolak oleh admin',
                  }),
            });
          }
        }
      }
    }

    // Award points if COMPLETED and customer is a member
    if (newStatus === 'COMPLETED' && booking.customerId && booking.customer?.membership) {
      const membership = booking.customer.membership;
      if (membership.status === 'ACTIVE') {
        const policy = await tx.orm.public.MembershipPointPolicy.first({ id: 'default' });
        const points = policy?.pointsPerCompletedBooking ?? 0;

        if (points > 0) {
          await tx.orm.public.MembershipPointTransaction.create({
              membershipId: membership.id,
              bookingId,
              actorProfileId,
              deltaPoints: points,
              reason: 'Poin dari booking selesai',
              idempotencyKey: `booking-completed-${bookingId}`,
          });
        }
      }
    }
  });

  return db.orm.public.Booking
    .where({ id: bookingId })
    .include('items')
    .include('barber')
    .include('branch')
    .include('customer')
    .first();
}
