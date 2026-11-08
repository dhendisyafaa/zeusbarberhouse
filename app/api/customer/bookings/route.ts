import type { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api/auth';
import { db } from '@/src/prisma/db';
import { ok, handleError } from '@/lib/api/response';
import { notFound } from '@/lib/api/errors';
import { parsePagination } from '@/lib/api/pagination';

export async function GET(request: NextRequest) {
  try {
    const profile = await requireAuth(request);

    const customer = await db.orm.public.Customer.first({ profileId: profile.id });
    if (!customer) throw notFound('Pelanggan');

    const { page, limit, skip } = parsePagination(request);

    const [bookings, total] = await Promise.all([
      db.orm.public.Booking
        .where({ customerId: customer.id })
        .orderBy((booking) => booking.createdAt.desc())
        .offset(skip)
        .limit(limit)
        .include('branch', (branch) => branch.select('id', 'name'))
        .include('barber', (barber) => barber.select('id', 'name'))
        .include('items', (items) =>
          items.select(
            'id',
            'serviceNameSnapshot',
            'unitPriceRupiahSnapshot',
            'durationMinutesSnapshot',
          ),
        )
        .all(),
      db.orm.public.Booking
        .where({ customerId: customer.id })
        .aggregate((aggregate) => ({ total: aggregate.count() })),
    ]);

    return ok(bookings, { page, limit, total: total.total });
  } catch (error) {
    return handleError(error);
  }
}
