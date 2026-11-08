import type { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/api/auth';
import { created, handleError, ok } from '@/lib/api/response';
import { parsePagination } from '@/lib/api/pagination';
import { readJson } from '@/lib/api/request';
import { validationError } from '@/lib/api/errors';
import { createVacancySchema } from '@/lib/schemas/career.schema';
import { db } from '@/src/prisma/db';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    const rawPublished = request.nextUrl.searchParams.get('isPublished');
    if (rawPublished !== null && !['true', 'false'].includes(rawPublished)) {
      throw validationError('isPublished harus true atau false');
    }

    const { page, limit, skip } = parsePagination(request);
    const query = rawPublished === null
      ? db.orm.public.CareerVacancy
      : db.orm.public.CareerVacancy.where({ isPublished: rawPublished === 'true' });
    const [vacancies, total] = await Promise.all([
      query
        .orderBy((vacancy) => vacancy.createdAt.desc())
        .offset(skip)
        .limit(limit)
        .include('applications', (applications) => applications.count())
        .all(),
      (rawPublished === null
        ? db.orm.public.CareerVacancy
        : db.orm.public.CareerVacancy.where({ isPublished: rawPublished === 'true' })
      ).aggregate((aggregate) => ({ total: aggregate.count() })),
    ]);

    return ok(vacancies, { page, limit, total: total.total });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);
    const input = createVacancySchema.parse(await readJson(request));
    const vacancy = await db.orm.public.CareerVacancy.create({
      title: input.title,
      description: input.description,
      isPublished: true,
      publishedAt: new Date(),
      closesAt: input.closesAt ? new Date(input.closesAt) : null,
    });

    return created(vacancy);
  } catch (error) {
    return handleError(error);
  }
}
