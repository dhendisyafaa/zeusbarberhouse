import type { NextRequest } from 'next/server';
import { db } from '@/src/prisma/db';
import { ok, handleError } from '@/lib/api/response';
import { parseUuid } from '@/lib/api/request';

export async function GET(request: NextRequest) {
  try {
    const rawBranchId = request.nextUrl.searchParams.get('branchId');
    const branchId = rawBranchId ? parseUuid(rawBranchId, 'ID cabang') : null;

    const barbers = await db.orm.public.Barber
      .where({ isActive: true, ...(branchId ? { branchId } : {}) })
      .include('branch', (branch) => branch.select('id', 'name', 'slug'))
      .include('schedules')
      .orderBy((barber) => barber.name.asc())
      .all();

    // Strip sensitive fields — photoPath is a storage path, return only public data
    const sanitized = barbers.map((b) => ({
      id: b.id,
      name: b.name,
      bio: b.bio,
      branchId: b.branchId,
      branch: b.branch,
      schedules: b.schedules,
    }));

    return ok(sanitized);
  } catch (error) {
    return handleError(error);
  }
}
