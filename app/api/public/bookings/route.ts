import type { NextRequest } from 'next/server';
import { createBookingSchema } from '@/lib/schemas/booking.schema';
import { createBooking } from '@/lib/services/booking.service';
import { getSession } from '@/lib/api/auth';
import { unauthorized } from '@/lib/api/errors';
import { assertSameOrigin, readJson } from '@/lib/api/request';
import { created, handleError } from '@/lib/api/response';
import { db } from '@/src/prisma/db';
import { createGuestBookingAccessToken } from '@/lib/api/guest-booking-access';

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);
    const body = await readJson(request, 16 * 1024);
    const input = createBookingSchema.parse(body);

    let customerId: string | null = null;
    const user = await getSession();
    if (user) {
      const profile = await db.orm.public.Profile.first({ authUserId: user.id });
      if (!profile) throw unauthorized('Profil tidak ditemukan');
      const customer = await db.orm.public.Customer.first({ profileId: profile.id });
      customerId = customer?.id ?? null;
    }

    const booking = await createBooking(input, customerId);
    return created({
      id: booking.id,
      status: booking.status,
      holdExpiresAt: booking.holdExpiresAt,
      startsAt: booking.startsAt,
      endsAt: booking.endsAt,
      branchId: booking.branchId,
      barberId: booking.barberId,
      items: booking.items,
      ...(customerId === null && booking.holdExpiresAt
        ? { guestAccessToken: createGuestBookingAccessToken(booking.id, booking.holdExpiresAt) }
        : {}),
    });
  } catch (error) {
    return handleError(error);
  }
}
