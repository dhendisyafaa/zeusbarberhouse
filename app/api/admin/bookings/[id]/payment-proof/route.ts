import type { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/api/auth';
import { notFound, validationError } from '@/lib/api/errors';
import { handleError, ok } from '@/lib/api/response';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { db } from '@/src/prisma/db';
import { z } from 'zod';

const BUCKET_NAME = 'payment-proofs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin(request);
    const { id } = await params;
    const parsedId = z.string().uuid().safeParse(id);
    if (!parsedId.success) throw validationError('ID booking tidak valid');

    const transaction = await db.orm.public.Transaction
      .where({ bookingId: parsedId.data })
      .include('payments', (payments) =>
        payments
          .where((payment) => payment.proofStoragePath.isNotNull())
          .orderBy((payment) => payment.createdAt.desc())
          .limit(1)
          .select('proofStoragePath'),
      )
      .first();
    const proofStoragePath = transaction?.payments[0]?.proofStoragePath;
    if (!proofStoragePath) throw notFound('Bukti pembayaran');

    const { data, error } = await createSupabaseAdminClient()
      .storage
      .from(BUCKET_NAME)
      .createSignedUrl(proofStoragePath, 60);
    if (error) throw error;

    return ok({ url: data.signedUrl, expiresIn: 60 });
  } catch (error) {
    return handleError(error);
  }
}
