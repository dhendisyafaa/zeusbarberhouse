import type { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/api/auth';
import { handleError, ok } from '@/lib/api/response';
import { readJson } from '@/lib/api/request';
import { updateMembershipPointPolicySchema } from '@/lib/schemas/membership.schema';
import { db } from '@/src/prisma/db';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    const policy = await db.orm.public.MembershipPointPolicy
      .select('id', 'pointsPerCompletedBooking', 'updatedAt', 'updatedByProfileId')
      .first({ id: 'default' });
    return ok(policy ?? { id: 'default', pointsPerCompletedBooking: 0 });
  } catch (error) {
    return handleError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);
    const input = updateMembershipPointPolicySchema.parse(await readJson(request));
    const existing = await db.orm.public.MembershipPointPolicy.first({ id: 'default' });
    const policy = existing
      ? await db.orm.public.MembershipPointPolicy.where({ id: 'default' }).update({
          pointsPerCompletedBooking: input.pointsPerCompletedBooking,
          updatedByProfileId: admin.id,
        })
      : await db.orm.public.MembershipPointPolicy.create({
          id: 'default',
          pointsPerCompletedBooking: input.pointsPerCompletedBooking,
          updatedByProfileId: admin.id,
        });

    return ok(policy);
  } catch (error) {
    return handleError(error);
  }
}
