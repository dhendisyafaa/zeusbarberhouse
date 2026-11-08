import type { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/api/auth';
import { notFound } from '@/lib/api/errors';
import { handleError, ok } from '@/lib/api/response';
import { parseUuid, readJson } from '@/lib/api/request';
import { updateMembershipSchema } from '@/lib/schemas/membership.schema';
import { db } from '@/src/prisma/db';
import { expireDueMemberships } from '@/lib/services/customer-account.service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin(request);
    await expireDueMemberships();
    const { id: rawId } = await params;
    const id = parseUuid(rawId, 'ID membership');
    const membership = await db.orm.public.Membership
      .where({ id })
      .include('customer', (customer) =>
        customer.select('id', 'name', 'email', 'phone'),
      )
      .include('pointTransactions', (transactions) =>
        transactions
          .orderBy((transaction) => transaction.createdAt.desc())
          .limit(20)
          .select('id', 'deltaPoints', 'reason', 'createdAt'),
      )
      .first();
    if (!membership) throw notFound('Membership');

    const ledger = await db.orm.public.MembershipPointTransaction
      .where({ membershipId: id })
      .select('deltaPoints')
      .all();
    const pointBalance = ledger.reduce((sum, entry) => sum + entry.deltaPoints, 0);

    return ok({ ...membership, pointBalance });
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin(request);
    const { id: rawId } = await params;
    const id = parseUuid(rawId, 'ID membership');
    const input = updateMembershipSchema.parse(await readJson(request));
    const membership = await db.orm.public.Membership.first({ id });
    if (!membership) throw notFound('Membership');

    const update: {
      status?: 'ACTIVE' | 'INACTIVE' | 'EXPIRED';
      expiresAt?: Date | null;
    } = {};
    if (input.expiresAt !== undefined) {
      const expiresAt = input.expiresAt ? new Date(input.expiresAt) : null;
      update.expiresAt = expiresAt;
      if (membership.status !== 'INACTIVE') {
        update.status = expiresAt && expiresAt <= new Date() ? 'EXPIRED' : 'ACTIVE';
      }
    }

    const updated = await db.orm.public.Membership.where({ id }).update(update);
    if (!updated) throw notFound('Membership');
    return ok(updated);
  } catch (error) {
    return handleError(error);
  }
}
