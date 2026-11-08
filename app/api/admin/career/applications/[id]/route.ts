import type { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/api/auth';
import { conflict, notFound, unprocessable } from '@/lib/api/errors';
import { handleError, ok } from '@/lib/api/response';
import { parseUuid, readJson } from '@/lib/api/request';
import { updateJobApplicationSchema } from '@/lib/schemas/career.schema';
import { db } from '@/src/prisma/db';

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  SUBMITTED: ['ACCEPTED', 'REJECTED'],
  // Keep old applications that were already marked REVIEWING actionable.
  REVIEWING: ['ACCEPTED', 'REJECTED'],
  ACCEPTED: [],
  REJECTED: [],
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin(request);
    const { id: rawId } = await params;
    const id = parseUuid(rawId, 'ID lamaran');
    const application = await db.orm.public.JobApplication
      .where({ id })
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
      .first();
    if (!application) throw notFound('Lamaran');
    return ok(application);
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await requireAdmin(request);
    const { id: rawId } = await params;
    const id = parseUuid(rawId, 'ID lamaran');
    const input = updateJobApplicationSchema.parse(await readJson(request));
    const application = await db.orm.public.JobApplication.first({ id });
    if (!application) throw notFound('Lamaran');
    if (!ALLOWED_TRANSITIONS[application.status]?.includes(input.status)) {
      throw unprocessable(`Status lamaran tidak dapat diubah dari ${application.status} menjadi ${input.status}`);
    }

    await db.transaction(async (tx) => {
      const changed = await tx.orm.public.JobApplication
        .where({ id, status: application.status })
        .updateAndCount({ status: input.status });
      if (changed !== 1) throw conflict('Status lamaran sudah berubah. Muat ulang data.');
      await tx.orm.public.JobApplicationStatusEvent.create({
        applicationId: id,
        fromStatus: application.status,
        toStatus: input.status,
        actorProfileId: admin.id,
        note: input.note ?? null,
      });
    });

    const updated = await db.orm.public.JobApplication
      .where({ id })
      .include('vacancy', (vacancy) => vacancy.select('id', 'title'))
      .include('documents', (documents) =>
        documents.select('id', 'originalFileName', 'mimeType', 'sizeBytes', 'createdAt'),
      )
      .include('statusEvents', (events) => events.orderBy((event) => event.createdAt.asc()))
      .first();
    if (!updated) throw notFound('Lamaran');
    return ok(updated);
  } catch (error) {
    return handleError(error);
  }
}
