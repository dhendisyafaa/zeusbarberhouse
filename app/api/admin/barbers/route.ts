import type { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/api/auth';
import { notFound } from '@/lib/api/errors';
import { parsePagination } from '@/lib/api/pagination';
import { parseUuid } from '@/lib/api/request';
import { created, handleError, ok } from '@/lib/api/response';
import { attachBarberPhotoUrls, getBarberPhotoStorage } from '@/lib/supabase/barber-photos';
import { readBarberUpload } from '@/lib/uploads/barber-photo';
import { db } from '@/src/prisma/db';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    const params = request.nextUrl.searchParams;
    const rawBranchId = params.get('branchId');
    const branchId = rawBranchId ? parseUuid(rawBranchId, 'ID cabang') : null;
    const { page, limit, skip } = parsePagination(request);

    const barbersQuery = branchId
      ? db.orm.public.Barber.where({ branchId })
      : db.orm.public.Barber;

    const [barbers, total] = await Promise.all([
      barbersQuery
        .orderBy((barber) => barber.name.asc())
        .offset(skip)
        .limit(limit)
        .include('branch', (branch) => branch.select('id', 'name'))
        .include('schedules')
        .all(),
      (branchId ? db.orm.public.Barber.where({ branchId }) : db.orm.public.Barber)
        .aggregate((aggregate) => ({ total: aggregate.count() })),
    ]);

    return ok(await attachBarberPhotoUrls(barbers), { page, limit, total: total.total });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: NextRequest) {
  let storage: Awaited<ReturnType<typeof getBarberPhotoStorage>> | null = null;
  let storagePath: string | null = null;
  let uploaded = false;

  try {
    await requireAdmin(request);
    const { input, file, bytes } = await readBarberUpload(request, { requirePhoto: true });
    if (!file || !bytes) throw new Error('Required barber photo was not parsed');

    const branch = await db.orm.public.Branch.first({ id: input.branchId });
    if (!branch || !branch.isActive) throw notFound('Cabang');

    storage = await getBarberPhotoStorage();
    const extension = file.type === 'image/jpeg' ? 'jpg' : file.type.split('/')[1];
    const uploadedPath = `${crypto.randomUUID()}.${extension}`;
    storagePath = uploadedPath;

    const { error: uploadError } = await storage.upload(uploadedPath, bytes, {
      contentType: file.type,
      upsert: false,
    });
    if (uploadError) throw uploadError;
    uploaded = true;

    const barber = await db.transaction(async (tx) =>
      tx.orm.public.Barber
        .include('branch', (relatedBranch) => relatedBranch.select('id', 'name'))
        .create({
          branchId: input.branchId,
          name: input.name,
          bio: input.bio ?? null,
          photoPath: uploadedPath,
        }),
    );

    return created(barber);
  } catch (error) {
    if (uploaded && storage && storagePath) {
      const { error: cleanupError } = await storage.remove([storagePath]);
      if (cleanupError) console.error('[Barber photo cleanup failed]', cleanupError);
    }
    return handleError(error);
  }
}
