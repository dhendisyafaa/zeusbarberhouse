import type { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/api/auth';
import { db } from '@/src/prisma/db';
import { ok, created, handleError } from '@/lib/api/response';
import { notFound, conflict, validationError } from '@/lib/api/errors';
import {
  createBranchScheduleSchema,
  createBarberScheduleSchema,
} from '@/lib/schemas/schedule.schema';
import { parseUuid, readJson } from '@/lib/api/request';

/**
 * GET /api/admin/schedules
 * Query params: type=branch|barber, entityId=<branchId|barberId>
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    const params = request.nextUrl.searchParams;
    const type = params.get('type'); // 'branch' | 'barber'
    const rawEntityId = params.get('entityId');
    const entityId = rawEntityId ? parseUuid(rawEntityId, 'entityId') : null;
    if (type && type !== 'branch' && type !== 'barber') {
      throw validationError('type harus branch atau barber');
    }

    if (type === 'branch') {
      const schedules = await (entityId
        ? db.orm.public.BranchSchedule.where({ branchId: entityId })
        : db.orm.public.BranchSchedule)
        .orderBy([(schedule) => schedule.branchId.asc(), (schedule) => schedule.dayOfWeek.asc()])
        .include('branch', (branch) => branch.select('id', 'name'))
        .all();
      return ok(schedules);
    }

    if (type === 'barber') {
      const schedules = await (entityId
        ? db.orm.public.BarberSchedule.where({ barberId: entityId })
        : db.orm.public.BarberSchedule)
        .orderBy([(schedule) => schedule.barberId.asc(), (schedule) => schedule.dayOfWeek.asc()])
        .include('barber', (barber) => barber.select('id', 'name'))
        .all();
      return ok(schedules);
    }

    // Return both if no type specified
    const [branchSchedules, barberSchedules] = await Promise.all([
      db.orm.public.BranchSchedule.orderBy((schedule) => schedule.dayOfWeek.asc()).all(),
      db.orm.public.BarberSchedule.orderBy((schedule) => schedule.dayOfWeek.asc()).all(),
    ]);
    return ok({ branchSchedules, barberSchedules });
  } catch (error) {
    return handleError(error);
  }
}

/**
 * POST /api/admin/schedules
 * Body must include `scheduleType: 'branch' | 'barber'`
 */
export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);
    const body = await readJson(request);
    const { scheduleType, ...rest } = body as { scheduleType?: string; [key: string]: unknown };

    if (scheduleType === 'branch') {
      const input = createBranchScheduleSchema.parse(rest);

      const branch = await db.orm.public.Branch.first({ id: input.branchId });
      if (!branch) throw notFound('Cabang');

      const existing = await db.orm.public.BranchSchedule.first({
        branchId: input.branchId,
        dayOfWeek: input.dayOfWeek,
      });
      if (existing) throw conflict('Jadwal untuk cabang dan hari tersebut sudah ada');

      const schedule = await db.orm.public.BranchSchedule.create(input);
      return created(schedule);
    }

    if (scheduleType === 'barber') {
      const input = createBarberScheduleSchema.parse(rest);

      const barber = await db.orm.public.Barber.first({ id: input.barberId });
      if (!barber) throw notFound('Capster');

      const existing = await db.orm.public.BarberSchedule.first({
        barberId: input.barberId,
        dayOfWeek: input.dayOfWeek,
      });
      if (existing) throw conflict('Jadwal untuk capster dan hari tersebut sudah ada');

      const schedule = await db.orm.public.BarberSchedule.create(input);
      return created(schedule);
    }

    throw validationError('scheduleType harus "branch" atau "barber"');
  } catch (error) {
    return handleError(error);
  }
}
