import type { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/api/auth';
import { notFound } from '@/lib/api/errors';
import { handleError, ok } from '@/lib/api/response';
import { parseUuid } from '@/lib/api/request';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { db } from '@/src/prisma/db';

const BUCKET_NAME = 'career-applications';
const SIGNED_URL_TTL_SECONDS = 60;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; documentId: string }> },
) {
  try {
    await requireAdmin(request);
    const { id: rawApplicationId, documentId: rawDocumentId } = await params;
    const applicationId = parseUuid(rawApplicationId, 'ID lamaran');
    const documentId = parseUuid(rawDocumentId, 'ID dokumen');
    const document = await db.orm.public.ApplicationDocument
      .where({ id: documentId, applicationId })
      .first();
    if (!document) throw notFound('Dokumen lamaran');

    const { data, error } = await createSupabaseAdminClient()
      .storage
      .from(BUCKET_NAME)
      .createSignedUrl(document.storagePath, SIGNED_URL_TTL_SECONDS, {
        download: document.originalFileName,
      });
    if (error) throw error;

    return ok({ url: data.signedUrl, expiresIn: SIGNED_URL_TTL_SECONDS });
  } catch (error) {
    return handleError(error);
  }
}
