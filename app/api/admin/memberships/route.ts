import type { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/api/auth';
import { validationError } from '@/lib/api/errors';
import { handleError, ok } from '@/lib/api/response';
import { parsePagination } from '@/lib/api/pagination';
import { db } from '@/src/prisma/db';
import { expireDueMemberships } from '@/lib/services/customer-account.service';

const MEMBERSHIP_STATUSES = ['ACTIVE', 'INACTIVE', 'EXPIRED'] as const;

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    await expireDueMemberships();
    const rawStatus = request.nextUrl.searchParams.get('status');
    const status = MEMBERSHIP_STATUSES.find((candidate) => candidate === rawStatus);
    if (rawStatus && !status) throw validationError('Status membership tidak valid');
    const { page, limit, skip } = parsePagination(request);
    const membershipQuery = status
      ? db.orm.public.Membership.where({ status })
      : db.orm.public.Membership;

    const [memberships, total] = await Promise.all([
      membershipQuery
        .orderBy((membership) => membership.createdAt.desc())
        .offset(skip)
        .limit(limit)
        .include('customer', (customer) =>
          customer.select('id', 'name', 'email', 'phone'),
        )
        .all(),
      (status
        ? db.orm.public.Membership.where({ status })
        : db.orm.public.Membership
      ).aggregate((aggregate) => ({ total: aggregate.count() })),
    ]);

    return ok(memberships, { page, limit, total: total.total });
  } catch (error) {
    return handleError(error);
  }
}
