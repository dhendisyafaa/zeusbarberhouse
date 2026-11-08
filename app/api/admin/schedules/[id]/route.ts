import type { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/api/auth';
import { db } from '@/src/prisma/db';
import { ok, noContent, handleError } from '@/lib/api/response';
import { notFound, validationError } from '@/lib/api/errors';
import {
  updateBranchScheduleSchema,
  updateBarberScheduleSchema,
} from '@/lib/schemas/schedule.schema';
import { parseUuid, readJson } from '@/lib/api/request';

/**
 * PATCH /api/admin/schedules/[id]
 * Body must include `scheduleType: 'branch' | 'barber'`
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin(request);
    const { id: rawId } = await params;
    const id = parseUuid(rawId, 'ID jadwal');
    const body = await readJson(request);
    const { scheduleType, ...rest } = body as { scheduleType?: string; [key: string]: unknown };

    if (scheduleType === 'branch') {
      const input = updateBranchScheduleSchema.parse(rest);
      const existing = await db.orm.public.BranchSchedule.first({ id });
      if (!existing) throw notFound('Jadwal cabang');
      const updated = await db.orm.public.BranchSchedule.where({ id }).update(input);
      if (!updated) throw notFound('Jadwal cabang');
      return ok(updated);
    }

    if (scheduleType === 'barber') {
      const input = updateBarberScheduleSchema.parse(rest);
      const existing = await db.orm.public.BarberSchedule.first({ id });
      if (!existing) throw notFound('Jadwal capster');
      const updated = await db.orm.public.BarberSchedule.where({ id }).update(input);
      if (!updated) throw notFound('Jadwal capster');
      return ok(updated);
    }

    throw validationError('scheduleType harus "branch" atau "barber"');
  } catch (error) {
    return handleError(error);
  }
}

/**
 * DELETE /api/admin/schedules/[id]
 * Query param: type=branch|barber
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin(request);
    const { id: rawId } = await params;
    const id = parseUuid(rawId, 'ID jadwal');
    const type = request.nextUrl.searchParams.get('type');

    if (type === 'branch') {
      const existing = await db.orm.public.BranchSchedule.first({ id });
      if (!existing) throw notFound('Jadwal cabang');
      await db.orm.public.BranchSchedule.where({ id }).delete();
      return noContent();
    }

    if (type === 'barber') {
      const existing = await db.orm.public.BarberSchedule.first({ id });
      if (!existing) throw notFound('Jadwal capster');
      await db.orm.public.BarberSchedule.where({ id }).delete();
      return noContent();
    }

    throw validationError('Query param "type" harus "branch" atau "barber"');
  } catch (error) {
    return handleError(error);
  }
}
