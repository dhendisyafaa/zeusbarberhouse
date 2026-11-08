import type { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/api/auth';
import { db } from '@/src/prisma/db';
import { ok, noContent, handleError } from '@/lib/api/response';
import { notFound, conflict } from '@/lib/api/errors';
import { updateBranchSchema } from '@/lib/schemas/branch.schema';
import { parseUuid, readJson } from '@/lib/api/request';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin(request);
    const { id: rawId } = await params;
    const id = parseUuid(rawId, 'ID cabang');
    const body = await readJson(request);
    const input = updateBranchSchema.parse(body);

    const existing = await db.orm.public.Branch.first({ id });
    if (!existing) throw notFound('Cabang');

    if (input.slug && input.slug !== existing.slug) {
      const slugTaken = await db.orm.public.Branch.first({ slug: input.slug });
      if (slugTaken) throw conflict('Slug cabang sudah digunakan');
    }

    const updated = await db.orm.public.Branch.where({ id }).update(input);
    if (!updated) throw notFound('Cabang');

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
    const id = parseUuid(rawId, 'ID cabang');

    const existing = await db.orm.public.Branch.first({ id });
    if (!existing) throw notFound('Cabang');

    // Soft delete — mark as inactive instead of hard delete
    await db.orm.public.Branch.where({ id }).update({ isActive: false });

    return noContent();
  } catch (error) {
    return handleError(error);
  }
}
