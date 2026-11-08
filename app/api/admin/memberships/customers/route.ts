import type { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/api/auth';
import { handleError, ok } from '@/lib/api/response';
import { parsePagination } from '@/lib/api/pagination';
import { db } from '@/src/prisma/db';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    const { page, limit, skip } = parsePagination(request);
    const [customers, total] = await Promise.all([
      db.orm.public.Customer
        .orderBy((customer) => customer.name.asc())
        .offset(skip)
        .limit(limit)
        .select('id', 'name', 'email', 'phone')
        .include('membership', (membership) => membership.select('id', 'status'))
        .all(),
      db.orm.public.Customer.aggregate((aggregate) => ({ total: aggregate.count() })),
    ]);

    return ok(customers, { page, limit, total: total.total });
  } catch (error) {
    return handleError(error);
  }
}
