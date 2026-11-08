import type { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/api/auth';
import { handleError, ok } from '@/lib/api/response';
import { parsePagination } from '@/lib/api/pagination';
import { parseUuid } from '@/lib/api/request';
import { validationError } from '@/lib/api/errors';
import { db } from '@/src/prisma/db';

const APPLICATION_STATUSES = ['SUBMITTED', 'ACCEPTED', 'REJECTED'] as const;

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    const params = request.nextUrl.searchParams;
    const rawStatus = params.get('status');
    const status = APPLICATION_STATUSES.find((candidate) => candidate === rawStatus);
    if (rawStatus && !status) throw validationError('Status lamaran tidak valid');
    const rawVacancyId = params.get('vacancyId');
    const vacancyId = rawVacancyId ? parseUuid(rawVacancyId, 'ID lowongan') : null;
    const { page, limit, skip } = parsePagination(request);

    const applicationsQuery = db.orm.public.JobApplication
      .where((application) => status ? application.status.eq(status) : application.id.isNotNull())
      .where((application) => vacancyId ? application.vacancyId.eq(vacancyId) : application.id.isNotNull());

    const [applications, total] = await Promise.all([
      applicationsQuery
        .orderBy((application) => application.createdAt.desc())
        .offset(skip)
        .limit(limit)
        .include('vacancy', (vacancy) => vacancy.select('id', 'title'))
        .include('documents', (documents) =>
          documents
            .orderBy((document) => document.createdAt.desc())
            .select('id', 'originalFileName', 'mimeType', 'sizeBytes', 'createdAt'),
        )
        .include('statusEvents', (events) =>
          events.orderBy((event) => event.createdAt.asc())
            .select('id', 'fromStatus', 'toStatus', 'note', 'createdAt'),
        )
        .all(),
      db.orm.public.JobApplication
        .where((application) => status ? application.status.eq(status) : application.id.isNotNull())
        .where((application) => vacancyId ? application.vacancyId.eq(vacancyId) : application.id.isNotNull())
        .aggregate((aggregate) => ({ total: aggregate.count() })),
    ]);

    return ok(applications, { page, limit, total: total.total });
  } catch (error) {
    return handleError(error);
  }
}
