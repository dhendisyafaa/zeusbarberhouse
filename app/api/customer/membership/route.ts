import type { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api/auth';
import { db } from '@/src/prisma/db';
import { ok, handleError } from '@/lib/api/response';
import { notFound } from '@/lib/api/errors';
import { expireDueMemberships } from '@/lib/services/customer-account.service';

export async function GET(request: NextRequest) {
  try {
    const profile = await requireAuth(request);
    await expireDueMemberships();

    const customer = await db.orm.public.Customer.first({ profileId: profile.id });
    if (!customer) throw notFound('Pelanggan');

    const membership = await db.orm.public.Membership
      .where({ customerId: customer.id })
      .include('pointTransactions', (transactions) =>
        transactions
          .orderBy((transaction) => transaction.createdAt.desc())
          .limit(20)
          .select('id', 'deltaPoints', 'reason', 'createdAt'),
      )
      .first();

    if (!membership) {
      return ok(null);
    }

    // Calculate current balance from ledger
    const allTransactions = await db.orm.public.MembershipPointTransaction
      .where({ membershipId: membership.id })
      .select('deltaPoints')
      .all();
    const pointBalance = allTransactions.reduce(
      (acc, transaction) => acc + transaction.deltaPoints,
      0,
    );

    return ok({
      id: membership.id,
      status: membership.status,
      activatedAt: membership.activatedAt,
      expiresAt: membership.expiresAt,
      pointBalance,
      recentTransactions: membership.pointTransactions,
    });
  } catch (error) {
    return handleError(error);
  }
}
