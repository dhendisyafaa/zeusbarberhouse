import type { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/api/auth';
import { notFound, validationError } from '@/lib/api/errors';
import { assertSameOrigin, parseUuid } from '@/lib/api/request';
import { handleError, ok } from '@/lib/api/response';
import { readPaymentOptionUpload } from '@/lib/uploads/payment-option-image';
import {
  createPaymentOptionImageSignedUrl,
  getPaymentOptionImageStorage,
} from '@/lib/supabase/payment-options';
import { db } from '@/src/prisma/db';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  let storage: Awaited<ReturnType<typeof getPaymentOptionImageStorage>> | null = null;
  let newPath: string | null = null;
  let uploaded = false;
  let committed = false;

  try {
    assertSameOrigin(request);
    await requireAdmin(request);
    const { id: rawId } = await params;
    const id = parseUuid(rawId, 'ID opsi pembayaran');
    const existing = await db.orm.public.PaymentOption.first({ id });
    if (!existing) throw notFound('Opsi pembayaran');

    const { input, file, bytes } = await readPaymentOptionUpload(request);
    if (input.method === 'BANK_TRANSFER' && file) {
      throw validationError('Gambar hanya dapat digunakan untuk metode QRIS');
    }
    if (input.method === 'QRIS' && !file && !existing.qrImagePath) {
      throw validationError('Gambar QRIS wajib diunggah');
    }

    if (file && bytes) {
      storage = await getPaymentOptionImageStorage();
      const extension = file.type === 'image/jpeg' ? 'jpg' : file.type.split('/')[1];
      newPath = `${crypto.randomUUID()}.${extension}`;
      const { error } = await storage.upload(newPath, bytes, {
        contentType: file.type,
        upsert: false,
      });
      if (error) throw error;
      uploaded = true;
    }

    const qrImagePath = input.method === 'BANK_TRANSFER'
      ? null
      : newPath ?? existing.qrImagePath;
    const updated = await db.transaction(async (tx) =>
      tx.orm.public.PaymentOption
        .where({ id })
        .update({ ...input, qrImagePath }),
    );
    if (!updated) throw notFound('Opsi pembayaran');
    committed = true;

    // Keep replaced QR files so payment destination snapshots remain auditable.
    return ok({
      ...updated,
      qrImageUrl: qrImagePath
        ? await createPaymentOptionImageSignedUrl(qrImagePath)
        : null,
      qrImagePath: undefined,
    });
  } catch (error) {
    if (uploaded && !committed && storage && newPath) {
      const { error: cleanupError } = await storage.remove([newPath]);
      if (cleanupError) console.error('[Payment option rollback cleanup failed]', cleanupError);
    }
    return handleError(error);
  }
}
