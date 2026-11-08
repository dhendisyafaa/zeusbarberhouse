import type { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/api/auth';
import { assertSameOrigin } from '@/lib/api/request';
import { created, handleError, ok } from '@/lib/api/response';
import { validationError } from '@/lib/api/errors';
import { readPaymentOptionUpload } from '@/lib/uploads/payment-option-image';
import {
  createPaymentOptionImageSignedUrl,
  getPaymentOptionImageStorage,
} from '@/lib/supabase/payment-options';
import { db } from '@/src/prisma/db';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    const options = await db.orm.public.PaymentOption
      .orderBy((option) => option.sortOrder.asc())
      .orderBy((option) => option.createdAt.asc())
      .all();

    return ok(await Promise.all(options.map(async (option) => ({
      id: option.id,
      method: option.method,
      label: option.label,
      bankName: option.bankName,
      accountNumber: option.accountNumber,
      accountHolder: option.accountHolder,
      instructions: option.instructions,
      qrImageUrl: option.qrImagePath
        ? await createPaymentOptionImageSignedUrl(option.qrImagePath)
        : null,
      isActive: option.isActive,
      sortOrder: option.sortOrder,
    }))));
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: NextRequest) {
  let storage: Awaited<ReturnType<typeof getPaymentOptionImageStorage>> | null = null;
  let uploadedPath: string | null = null;

  try {
    assertSameOrigin(request);
    await requireAdmin(request);
    const { input, file, bytes } = await readPaymentOptionUpload(request);
    if (input.method === 'QRIS' && (!file || !bytes)) {
      throw validationError('Gambar QRIS wajib diunggah');
    }
    if (input.method === 'BANK_TRANSFER' && file) {
      throw validationError('Gambar hanya dapat digunakan untuk metode QRIS');
    }

    if (file && bytes) {
      storage = await getPaymentOptionImageStorage();
      const extension = file.type === 'image/jpeg' ? 'jpg' : file.type.split('/')[1];
      uploadedPath = `${crypto.randomUUID()}.${extension}`;
      const { error } = await storage.upload(uploadedPath, bytes, {
        contentType: file.type,
        upsert: false,
      });
      if (error) throw error;
    }

    let option;
    try {
      option = await db.transaction(async (tx) =>
        tx.orm.public.PaymentOption.create({
          ...input,
          qrImagePath: uploadedPath,
        }),
      );
    } catch (error) {
      if (uploadedPath && storage) {
        const { error: cleanupError } = await storage.remove([uploadedPath]);
        if (cleanupError) console.error('[Payment option upload cleanup failed]', cleanupError);
      }
      throw error;
    }

    return created({
      ...option,
      qrImageUrl: uploadedPath
        ? await createPaymentOptionImageSignedUrl(uploadedPath)
        : null,
      qrImagePath: undefined,
    });
  } catch (error) {
    return handleError(error);
  }
}
