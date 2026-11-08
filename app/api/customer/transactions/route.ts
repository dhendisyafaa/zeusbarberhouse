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

    const [transactions, total] = await Promise.all([
      db.orm.public.Transaction
        .where({ customerId: customer.id })
        .orderBy((transaction) => transaction.createdAt.desc())
        .offset(skip)
        .limit(limit)
        .select('id', 'status', 'totalAmountRupiah', 'createdAt')
        .include('branch', (branch) => branch.select('id', 'name'))
        .include('items', (items) =>
          items.select('nameSnapshot', 'quantity', 'unitPriceRupiahSnapshot'),
        )
        .include('payments', (payments) => payments.select('method', 'status', 'amountRupiah'))
        .all(),
      db.orm.public.Transaction
        .where({ customerId: customer.id })
        .aggregate((aggregate) => ({ total: aggregate.count() })),
    ]);

    return ok(transactions, { page, limit, total: total.total });
  } catch (error) {
    return handleError(error);
  }
}
