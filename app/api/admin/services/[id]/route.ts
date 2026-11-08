import type { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/api/auth';
import { db } from '@/src/prisma/db';
import { ok, noContent, handleError } from '@/lib/api/response';
import { notFound } from '@/lib/api/errors';
import { updateServiceSchema } from '@/lib/schemas/service.schema';
import { parseUuid, readJson } from '@/lib/api/request';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin(request);
    const { id: rawId } = await params;
    const id = parseUuid(rawId, 'ID layanan');
    const body = await readJson(request);
    const input = updateServiceSchema.parse(body);

    const existing = await db.orm.public.Service.first({ id });
    if (!existing) throw notFound('Layanan');

    const updated = await db.orm.public.Service.where({ id }).update(input);
    if (!updated) throw notFound('Layanan');
    return ok(updated);
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin(_request);
    const { id: rawId } = await params;
    const id = parseUuid(rawId, 'ID layanan');

    const existing = await db.orm.public.Service.first({ id });
    if (!existing) throw notFound('Layanan');

    // Soft delete — archive
    await db.orm.public.Service.where({ id }).update({ isActive: false });
    return noContent();
  } catch (error) {
    return handleError(error);
  }
}
