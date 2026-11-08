import type { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/api/auth';
import { db } from '@/src/prisma/db';
import { ok, noContent, handleError } from '@/lib/api/response';
import { notFound } from '@/lib/api/errors';
import { updateBarberSchema } from '@/lib/schemas/barber.schema';
import { parseUuid, readJson } from '@/lib/api/request';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin(request);
    const { id: rawId } = await params;
    const id = parseUuid(rawId, 'ID capster');
    const body = await readJson(request);
    const input = updateBarberSchema.parse(body);

    const existing = await db.orm.public.Barber.first({ id });
    if (!existing) throw notFound('Capster');

    if (input.branchId) {
      const branch = await db.orm.public.Branch.first({ id: input.branchId });
      if (!branch || !branch.isActive) throw notFound('Cabang');
    }

    const updated = await db.orm.public.Barber
      .where({ id })
      .include('branch', (branch) => branch.select('id', 'name'))
      .update(input);
    if (!updated) throw notFound('Capster');

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
    const id = parseUuid(rawId, 'ID capster');

    const existing = await db.orm.public.Barber.first({ id });
    if (!existing) throw notFound('Capster');

    // Soft delete
    await db.orm.public.Barber.where({ id }).update({ isActive: false });
    return noContent();
  } catch (error) {
    return handleError(error);
  }
}
