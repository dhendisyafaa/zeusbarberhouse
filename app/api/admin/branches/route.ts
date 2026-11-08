import type { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/api/auth';
import { db } from '@/src/prisma/db';
import { ok, created, handleError } from '@/lib/api/response';
import { parsePagination } from '@/lib/api/pagination';
import { createBranchSchema } from '@/lib/schemas/branch.schema';
import { conflict } from '@/lib/api/errors';
import { readJson } from '@/lib/api/request';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    const { page, limit, skip } = parsePagination(request);

    const [branchRows, total] = await Promise.all([
      db.orm.public.Branch
        .orderBy((branch) => branch.name.asc())
        .offset(skip)
        .limit(limit)
        .include('schedules')
        .include('barbers', (barbers) => barbers.count())
        .all(),
      db.orm.public.Branch.aggregate((aggregate) => ({ total: aggregate.count() })),
    ]);
    const branches = branchRows.map(({ barbers, ...branch }) => ({
      ...branch,
      _count: { barbers },
    }));

    return ok(branches, { page, limit, total: total.total });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);
    const body = await readJson(request);
    const input = createBranchSchema.parse(body);

    const existing = await db.orm.public.Branch.first({ slug: input.slug });
    if (existing) throw conflict('Slug cabang sudah digunakan');

    const branch = await db.orm.public.Branch.create({
        name: input.name,
        slug: input.slug,
        address: input.address,
        city: input.city,
        phone: input.phone ?? null,
        mapsUrl: input.mapsUrl || null,
    });

    return created(branch);
  } catch (error) {
    return handleError(error);
  }
}
