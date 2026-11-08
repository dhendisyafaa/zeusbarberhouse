import type { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/api/auth';
import { parsePagination } from '@/lib/api/pagination';
import { created, handleError, ok } from '@/lib/api/response';
import {
  createHaircutImageSignedUrl,
  getHaircutImageStorage,
} from '@/lib/supabase/haircut-images';
import { readHaircutModelUpload } from '@/lib/uploads/haircut-image';
import { db } from '@/src/prisma/db';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    const { page, limit, skip } = parsePagination(request);
    const [models, total] = await Promise.all([
      db.orm.public.HaircutModel
        .orderBy((model) => model.createdAt.desc())
        .offset(skip)
        .limit(limit)
        .all(),
      db.orm.public.HaircutModel.aggregate((aggregate) => ({ total: aggregate.count() })),
    ]);

    const imageStorage = await getHaircutImageStorage();
    const data = await Promise.all(models.map(async (model) => {
      return {
        ...model,
        imageUrl: await createHaircutImageSignedUrl(imageStorage, model.imagePath),
      };
    }));

    return ok(data, { page, limit, total: total.total });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: NextRequest) {
  let storage: Awaited<ReturnType<typeof getHaircutImageStorage>> | null = null;
  let storagePath: string | null = null;
  let uploaded = false;

  try {
    await requireAdmin(request);
    const { input, file, bytes } = await readHaircutModelUpload(request, { requireImage: true });
    if (!file || !bytes) throw new Error('Required haircut image was not parsed');
    storage = await getHaircutImageStorage();
    const extension = file.type === 'image/jpeg' ? 'jpg' : file.type.split('/')[1];
    const uploadedPath = `${crypto.randomUUID()}.${extension}`;
    storagePath = uploadedPath;

    const { error: uploadError } = await storage.upload(uploadedPath, bytes, {
      contentType: file.type,
      upsert: false,
    });
    if (uploadError) throw uploadError;
    uploaded = true;

    const model = await db.transaction(async (tx) =>
      tx.orm.public.HaircutModel
        .select('id', 'title', 'description', 'createdAt')
        .create({
          title: input.title,
          description: input.description ?? null,
          imagePath: uploadedPath,
          isPublished: true,
          sortOrder: 0,
        }),
    );

    return created(model);
  } catch (error) {
    if (uploaded && storage && storagePath) {
      const { error: cleanupError } = await storage.remove([storagePath]);
      if (cleanupError) console.error('[Haircut image cleanup failed]', cleanupError);
    }
    return handleError(error);
  }
}
