import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/api/auth';
import { validationError } from '@/lib/api/errors';
import { handleError, ok } from '@/lib/api/response';
import { db } from '@/src/prisma/db';

const branchIdSchema = z.string().uuid();

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    const rawBranchId = request.nextUrl.searchParams.get('branchId');
    const branchId = rawBranchId && rawBranchId !== 'all'
      ? branchIdSchema.parse(rawBranchId)
      : undefined;
    const now = new Date();
    const localNow = new Date(now.getTime() + 7 * 60 * 60 * 1000);
    localNow.setUTCHours(0, 0, 0, 0);
    const dayStart = new Date(localNow.getTime() - 7 * 60 * 60 * 1000);
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

    const barbers = await db.orm.public.Barber
      .where({ isActive: true, ...(branchId ? { branchId } : {}) })
      .include('branch', (branch) => branch.select('id', 'name', 'slug'))
      .include('bookings', (bookings) =>
        bookings
          .where((booking) => booking.startsAt.gte(dayStart))
          .where((booking) => booking.startsAt.lt(dayEnd))
          .select('id', 'status', 'startsAt', 'endsAt')
          .include('customer', (customer) => customer.select('name'))
          .include('items', (items) => items.select('serviceNameSnapshot')),
      )
      .orderBy((barber) => barber.name.asc())
      .all();

    const roster = barbers.map((barber) => {
      const currentBooking = barber.bookings.find(
        (booking) => booking.status === 'CONFIRMED' &&
          booking.startsAt <= now &&
          booking.endsAt > now,
      );
      const nextBooking = barber.bookings
        .filter((booking) => booking.startsAt > now)
        .sort((left, right) => left.startsAt.getTime() - right.startsAt.getTime())[0];
      const booking = currentBooking ?? nextBooking;
      const duration = booking
        ? Math.max(0, Math.round((booking.endsAt.getTime() - booking.startsAt.getTime()) / 60_000))
        : 0;
      const elapsed = currentBooking
        ? Math.max(0, Math.round((now.getTime() - currentBooking.startsAt.getTime()) / 60_000))
        : 0;

      return {
        id: barber.id,
        name: barber.name,
        nickname: barber.name.toUpperCase().slice(0, 12),
        branch: barber.branch?.name ?? '',
        branchCode: barber.branch?.slug.toUpperCase() ?? '',
        chairNo: 'CAPSTER',
        status: currentBooking ? 'IN_SERVICE' : 'AVAILABLE',
        statusText: currentBooking ? 'SEDANG MELAYANI' : 'SIAP MELAYANI',
        customerName: currentBooking?.customer?.name ?? '-',
        serviceName: booking?.items.map((item) => item.serviceNameSnapshot).join(' + ') ??
          (nextBooking ? 'PESANAN BERIKUTNYA' : 'BELUM ADA PESANAN'),
        startTime: booking?.startsAt.toLocaleTimeString('id-ID', {
          timeZone: 'Asia/Jakarta',
          hour: '2-digit',
          minute: '2-digit',
        }) ?? '-',
        estimatedFinish: booking?.endsAt.toLocaleTimeString('id-ID', {
          timeZone: 'Asia/Jakarta',
          hour: '2-digit',
          minute: '2-digit',
        }) ?? '-',
        elapsedMinutes: elapsed,
        totalMinutes: duration,
        progressPercent: duration ? Math.min(100, Math.round((elapsed / duration) * 100)) : 0,
        todayCuts: barber.bookings.filter((item) => item.status === 'COMPLETED').length,
      };
    });

    return ok({
      barbers,
      roster,
      totalOnDuty: roster.filter((item) => item.status === 'IN_SERVICE').length,
      totalChairs: roster.length,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return handleError(validationError('branchId tidak valid'));
    }
    return handleError(error);
  }
}
