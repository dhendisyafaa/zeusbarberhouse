import type { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/api/auth';
import { notFound, validationError } from '@/lib/api/errors';
import { parseUuid } from '@/lib/api/request';
import { handleError, noContent, ok } from '@/lib/api/response';
import { updateHaircutModelSchema } from '@/lib/schemas/content.schema';
import { getHaircutImageStorage } from '@/lib/supabase/haircut-images';
import { readHaircutModelUpload } from '@/lib/uploads/haircut-image';
import { db } from '@/src/prisma/db';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  let storage: Awaited<ReturnType<typeof getHaircutImageStorage>> | null = null;
  let newPath: string | null = null;
  let oldPath: string | null = null;
  let uploaded = false;

  try {
    await requireAdmin(request);
    const { id: rawId } = await params;
    const id = parseUuid(rawId, 'ID model rambut');
    const existing = await db.orm.public.HaircutModel.first({ id });
    if (!existing) throw notFound('Model rambut');

    const { input, file, bytes } = await readHaircutModelUpload(request, { requireImage: false });
    const update = updateHaircutModelSchema.parse(input);
    if (Object.keys(update).length === 0 && !file) {
      throw validationError('Tidak ada perubahan untuk disimpan');
    }

    if (file && bytes) {
      storage = await getHaircutImageStorage();
      const extension = file.type === 'image/jpeg' ? 'jpg' : file.type.split('/')[1];
      newPath = `${crypto.randomUUID()}.${extension}`;
      const { error } = await storage.upload(newPath, bytes, {
        contentType: file.type,
        upsert: false,
      });
      if (error) throw error;
      uploaded = true;
      oldPath = existing.imagePath;
    }

    const updated = await db.transaction(async (tx) =>
      tx.orm.public.HaircutModel
        .where({ id })
        .update({
          ...update,
          ...(newPath ? { imagePath: newPath } : {}),
          isPublished: true,
        }),
    );
    if (!updated) throw notFound('Model rambut');

    if (storage && oldPath) {
      const { error: cleanupError } = await storage.remove([oldPath]);
      if (cleanupError) console.error('[Replaced haircut image cleanup failed]', cleanupError);
    }
    return ok(updated);
  } catch (error) {
    if (uploaded && storage && newPath) {
      const { error: cleanupError } = await storage.remove([newPath]);
      if (cleanupError) console.error('[Haircut image rollback cleanup failed]', cleanupError);
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
    const id = parseUuid(rawId, 'ID model rambut');
    const existing = await db.orm.public.HaircutModel.first({ id });
    if (!existing) throw notFound('Model rambut');

    const storage = await getHaircutImageStorage();
    await db.transaction(async (tx) => {
      await tx.orm.public.HaircutModel.where({ id }).delete();
    });

    const { error } = await storage.remove([existing.imagePath]);
    if (error) console.error('[Deleted haircut image cleanup failed]', error);
    return noContent();
  } catch (error) {
    return handleError(error);
  }
}
