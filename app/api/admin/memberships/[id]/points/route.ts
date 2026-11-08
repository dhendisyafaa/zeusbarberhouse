import type { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/api/auth';
import { conflict, notFound } from '@/lib/api/errors';
import { created, handleError, ok } from '@/lib/api/response';
import { parsePagination, type PaginationParams } from '@/lib/api/pagination';
import { parseUuid, readJson } from '@/lib/api/request';
import { adjustPointsSchema } from '@/lib/schemas/membership.schema';
import { db } from '@/src/prisma/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin(request);
    const { id: rawId } = await params;
    const membershipId = parseUuid(rawId, 'ID membership');
    const membership = await db.orm.public.Membership.first({ id: membershipId });
    if (!membership) throw notFound('Membership');

    const { page, limit, skip }: PaginationParams = parsePagination(request);
    const [entries, total, allEntries] = await Promise.all([
      db.orm.public.MembershipPointTransaction
        .where({ membershipId })
        .orderBy((entry) => entry.createdAt.desc())
        .offset(skip)
        .limit(limit)
        .select('id', 'deltaPoints', 'reason', 'bookingId', 'transactionId', 'expiresAt', 'createdAt')
        .all(),
      db.orm.public.MembershipPointTransaction.where({ membershipId })
        .aggregate((aggregate) => ({ total: aggregate.count() })),
      db.orm.public.MembershipPointTransaction
        .where({ membershipId })
        .select('deltaPoints')
        .all(),
    ]);

    return ok({
      entries,
      pointBalance: allEntries.reduce((sum, entry) => sum + entry.deltaPoints, 0),
    }, { page, limit, total: total.total });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await requireAdmin(request);
    const { id: rawId } = await params;
    const membershipId = parseUuid(rawId, 'ID membership');
    const input = adjustPointsSchema.parse(await readJson(request));
    const membership = await db.orm.public.Membership.first({ id: membershipId });
    if (!membership) throw notFound('Membership');

    if (input.idempotencyKey) {
      const previous = await db.orm.public.MembershipPointTransaction
        .first({ idempotencyKey: input.idempotencyKey });
      if (previous) {
        if (
          previous.membershipId !== membershipId ||
          previous.deltaPoints !== input.deltaPoints ||
          previous.reason !== input.reason
        ) {
          throw conflict('idempotencyKey sudah digunakan untuk transaksi yang berbeda');
        }
        return ok(previous);
      }
    }

    const entry = await db.orm.public.MembershipPointTransaction.create({
      membershipId,
      actorProfileId: admin.id,
      deltaPoints: input.deltaPoints,
      reason: input.reason,
      idempotencyKey: input.idempotencyKey ?? null,
    });

    return created(entry);
  } catch (error) {
    return handleError(error);
  }
}
