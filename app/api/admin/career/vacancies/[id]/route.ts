import type { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/api/auth';
import { notFound, validationError } from '@/lib/api/errors';
import { handleError, ok } from '@/lib/api/response';
import { parseUuid, readJson } from '@/lib/api/request';
import { updateVacancySchema } from '@/lib/schemas/career.schema';
import { db } from '@/src/prisma/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin(request);
    const { id: rawId } = await params;
    const id = parseUuid(rawId, 'ID lowongan');
    const vacancy = await db.orm.public.CareerVacancy
      .where({ id })
      .include('applications', (applications) =>
        applications
          .orderBy((application) => application.createdAt.desc())
          .select('id', 'name', 'email', 'phone', 'status', 'createdAt'),
      )
      .first();
    if (!vacancy) throw notFound('Lowongan');
    return ok(vacancy);
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
    const id = parseUuid(rawId, 'ID lowongan');
    const input = updateVacancySchema.parse(await readJson(request));
    const existing = await db.orm.public.CareerVacancy.first({ id });
    if (!existing) throw notFound('Lowongan');

    const update: {
      title?: string;
      description?: string;
      isPublished: true;
      publishedAt: Date;
      closesAt?: Date | null;
    } = { isPublished: true, publishedAt: existing.publishedAt ?? new Date() };
    if (input.title !== undefined) update.title = input.title;
    if (input.description !== undefined) update.description = input.description;
    if (input.closesAt !== undefined) {
      update.closesAt = input.closesAt ? new Date(input.closesAt) : null;
    }
    if (
      input.title === undefined &&
      input.description === undefined &&
      input.closesAt === undefined
    ) {
      throw validationError('Minimal satu field lowongan harus diperbarui');
    }

    const updated = await db.orm.public.CareerVacancy.where({ id }).update(update);
    if (!updated) throw notFound('Lowongan');
    return ok(updated);
  } catch (error) {
    return handleError(error);
  }
}
