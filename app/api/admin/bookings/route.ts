import type { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/api/auth';
import { db } from '@/src/prisma/db';
import { ok, handleError } from '@/lib/api/response';
import { parsePagination } from '@/lib/api/pagination';
import { parseUuid } from '@/lib/api/request';
import { validationError } from '@/lib/api/errors';

const BOOKING_STATUSES = [
  'PENDING_PAYMENT',
  'AWAITING_CONFIRMATION',
  'CONFIRMED',
  'REJECTED',
  'COMPLETED',
  'CANCELLED',
] as const;

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);

    const params = request.nextUrl.searchParams;
    const rawStatus = params.get('status');
    const status = BOOKING_STATUSES.find((candidate) => candidate === rawStatus);
    if (rawStatus && !status) {
      throw validationError('status booking tidak valid');
    }
    const rawBranchId = params.get('branchId');
    const branchId = rawBranchId && rawBranchId !== 'all'
      ? parseUuid(rawBranchId, 'ID cabang')
      : rawBranchId;
    const rawBarberId = params.get('barberId');
    const barberId = rawBarberId ? parseUuid(rawBarberId, 'ID capster') : null;
    const { page, limit, skip } = parsePagination(request);

    const bookingsQuery = db.orm.public.Booking
      .where((booking) => status ? booking.status.eq(status) : booking.id.isNotNull())
      .where((booking) => branchId && branchId !== 'all'
        ? booking.branchId.eq(branchId)
        : booking.id.isNotNull())
      .where((booking) => barberId ? booking.barberId.eq(barberId) : booking.id.isNotNull());

    const [bookings, total] = await Promise.all([
      bookingsQuery
        .orderBy((booking) => booking.createdAt.desc())
        .offset(skip)
        .limit(limit)
        .include('branch', (branch) => branch.select('id', 'name', 'slug'))
        .include('barber', (barber) => barber.select('id', 'name'))
        .include('customer', (customer) => customer.select('id', 'name', 'phone'))
        .include('items', (items) =>
          items.select(
            'id',
            'serviceNameSnapshot',
            'unitPriceRupiahSnapshot',
            'durationMinutesSnapshot',
          ),
        )
        .include('transaction', (transaction) =>
          transaction.include('payments', (payments) =>
            payments.orderBy((payment) => payment.createdAt.desc()),
          ),
        )
        .all(),
      db.orm.public.Booking
        .where((booking) => status ? booking.status.eq(status) : booking.id.isNotNull())
        .where((booking) => branchId && branchId !== 'all'
          ? booking.branchId.eq(branchId)
          : booking.id.isNotNull())
        .where((booking) => barberId ? booking.barberId.eq(barberId) : booking.id.isNotNull())
        .aggregate((aggregate) => ({ total: aggregate.count() })),
    ]);

    return ok(bookings, { page, limit, total: total.total });
  } catch (error) {
    return handleError(error);
  }
}
