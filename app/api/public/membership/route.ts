import { db } from '@/src/prisma/db';
import { ok, handleError } from '@/lib/api/response';

export async function GET() {
  try {
    const policy = await db.orm.public.MembershipPointPolicy
      .select('pointsPerCompletedBooking', 'updatedAt')
      .first({ id: 'default' });
    return ok(policy ?? { pointsPerCompletedBooking: 0 });
  } catch (error) {
    return handleError(error);
  }
}
