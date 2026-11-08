import type { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/api/auth';
import { db } from '@/src/prisma/db';
import { ok, created, handleError } from '@/lib/api/response';
import { parsePagination } from '@/lib/api/pagination';
import { createBarberSchema } from '@/lib/schemas/barber.schema';
import { notFound } from '@/lib/api/errors';
import { parseUuid, readJson } from '@/lib/api/request';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    const params = request.nextUrl.searchParams;
    const rawBranchId = params.get('branchId');
    const branchId = rawBranchId ? parseUuid(rawBranchId, 'ID cabang') : null;
    const { page, limit, skip } = parsePagination(request);

    const barbersQuery = branchId
      ? db.orm.public.Barber.where({ branchId })
      : db.orm.public.Barber;

    const [barbers, total] = await Promise.all([
      barbersQuery
        .orderBy((barber) => barber.name.asc())
        .offset(skip)
        .limit(limit)
        .include('branch', (branch) => branch.select('id', 'name'))
        .include('schedules')
        .all(),
      (branchId ? db.orm.public.Barber.where({ branchId }) : db.orm.public.Barber)
        .aggregate((aggregate) => ({ total: aggregate.count() })),
    ]);

    return ok(barbers, { page, limit, total: total.total });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);
    const body = await readJson(request);
    const input = createBarberSchema.parse(body);

    const branch = await db.orm.public.Branch.first({ id: input.branchId });
    if (!branch || !branch.isActive) throw notFound('Cabang');

    const barber = await db.orm.public.Barber
      .include('branch', (relatedBranch) => relatedBranch.select('id', 'name'))
      .create({
        branchId: input.branchId,
        name: input.name,
        bio: input.bio ?? null,
      });

    return created(barber);
  } catch (error) {
    return handleError(error);
  }
}
