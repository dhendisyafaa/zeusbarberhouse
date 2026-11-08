import type { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/api/auth';
import { db } from '@/src/prisma/db';
import { ok, handleError } from '@/lib/api/response';
import { notFound } from '@/lib/api/errors';
import { updateBookingStatusSchema } from '@/lib/schemas/booking.schema';
import { adminUpdateBookingStatus } from '@/lib/services/booking.service';
import { parseUuid, readJson } from '@/lib/api/request';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin(_request);
    const { id: rawId } = await params;
    const id = parseUuid(rawId, 'ID booking');

    const booking = await db.orm.public.Booking
      .where({ id })
      .include('branch')
      .include('barber')
      .include('customer')
      .include('items')
      .include('statusEvents', (events) =>
        events.orderBy((event) => event.createdAt.asc()),
      )
      .include('transaction', (transaction) =>
        transaction
          .include('payments', (payments) =>
            payments.include('statusEvents', (events) =>
              events.orderBy((event) => event.createdAt.asc()),
            ),
          )
          .include('items'),
      )
      .first();

    if (!booking) throw notFound('Booking');
    return ok(booking);
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await requireAdmin(request);
    const { id: rawId } = await params;
    const id = parseUuid(rawId, 'ID booking');
    const body = await readJson(request);
    const input = updateBookingStatusSchema.parse(body);

    const updated = await adminUpdateBookingStatus(id, input.status, admin.id, input.note);
    return ok(updated);
  } catch (error) {
    return handleError(error);
  }
}
