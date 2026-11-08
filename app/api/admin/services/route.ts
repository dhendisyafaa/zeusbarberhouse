import type { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/api/auth';
import { db } from '@/src/prisma/db';
import { ok, created, handleError } from '@/lib/api/response';
import { parsePagination } from '@/lib/api/pagination';
import { createServiceSchema } from '@/lib/schemas/service.schema';
import { readJson } from '@/lib/api/request';
import { validationError } from '@/lib/api/errors';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    const { page, limit, skip } = parsePagination(request);
    const isActive = request.nextUrl.searchParams.get('isActive');

    if (isActive !== null && isActive !== 'true' && isActive !== 'false') {
      throw validationError('isActive harus true atau false');
    }
    const servicesQuery = isActive !== null
      ? db.orm.public.Service.where({ isActive: isActive === 'true' })
      : db.orm.public.Service;

    const [services, total] = await Promise.all([
      servicesQuery
        .orderBy([(service) => service.sortOrder.asc(), (service) => service.name.asc()])
        .offset(skip)
        .limit(limit)
        .all(),
      (isActive !== null
        ? db.orm.public.Service.where({ isActive: isActive === 'true' })
        : db.orm.public.Service
      ).aggregate((aggregate) => ({ total: aggregate.count() })),
    ]);

    return ok(services, { page, limit, total: total.total });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);
    const body = await readJson(request);
    const input = createServiceSchema.parse(body);

    const service = await db.orm.public.Service.create({
        name: input.name,
        description: input.description ?? null,
        priceRupiah: input.priceRupiah,
        durationMinutes: input.durationMinutes,
        sortOrder: input.sortOrder,
    });

    return created(service);
  } catch (error) {
    return handleError(error);
  }
}
