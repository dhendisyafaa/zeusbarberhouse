import type { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/api/auth';
import { notFound, validationError } from '@/lib/api/errors';
import { parseUuid } from '@/lib/api/request';
import { handleError, noContent, ok } from '@/lib/api/response';
import { getBarberPhotoStorage } from '@/lib/supabase/barber-photos';
import { readBarberUpload } from '@/lib/uploads/barber-photo';
import { db } from '@/src/prisma/db';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  let storage: Awaited<ReturnType<typeof getBarberPhotoStorage>> | null = null;
  let newPath: string | null = null;
  let oldPath: string | null = null;
  let uploaded = false;

  try {
    await requireAdmin(request);
    const { id: rawId } = await params;
    const id = parseUuid(rawId, 'ID capster');
    const existing = await db.orm.public.Barber.first({ id });
    if (!existing) throw notFound('Capster');

    const { input, file, bytes } = await readBarberUpload(request, { requirePhoto: false });
    if (Object.keys(input).length === 0 && !file) {
      throw validationError('Tidak ada perubahan untuk disimpan');
    }

    if (input.branchId) {
      const branch = await db.orm.public.Branch.first({ id: input.branchId });
      if (!branch || !branch.isActive) throw notFound('Cabang');
    }

    if (file && bytes) {
      storage = await getBarberPhotoStorage();
      const extension = file.type === 'image/jpeg' ? 'jpg' : file.type.split('/')[1];
      newPath = `${crypto.randomUUID()}.${extension}`;
      const { error } = await storage.upload(newPath, bytes, {
        contentType: file.type,
        upsert: false,
      });
      if (error) throw error;
      uploaded = true;
      oldPath = existing.photoPath;
    }

    const updated = await db.transaction(async (tx) =>
      tx.orm.public.Barber
        .where({ id })
        .include('branch', (branch) => branch.select('id', 'name'))
        .update({
          ...input,
          ...(newPath ? { photoPath: newPath } : {}),
        }),
    );
    if (!updated) throw notFound('Capster');

    if (storage && oldPath) {
      const { error: cleanupError } = await storage.remove([oldPath]);
      if (cleanupError) console.error('[Replaced barber photo cleanup failed]', cleanupError);
    }
    return ok(updated);
  } catch (error) {
    if (uploaded && storage && newPath) {
      const { error: cleanupError } = await storage.remove([newPath]);
      if (cleanupError) console.error('[Barber photo rollback cleanup failed]', cleanupError);
    }
    return handleError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin(request);
    const { id: rawId } = await params;
    const id = parseUuid(rawId, 'ID capster');

    const existing = await db.orm.public.Barber.first({ id });
    if (!existing) throw notFound('Capster');

    await db.orm.public.Barber.where({ id }).update({ isActive: false });
    return noContent();
  } catch (error) {
    return handleError(error);
  }
}
