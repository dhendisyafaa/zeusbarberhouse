import { handleError, ok } from '@/lib/api/response';
import { createPaymentOptionImageSignedUrl } from '@/lib/supabase/payment-options';
import { db } from '@/src/prisma/db';

export async function GET() {
  try {
    const options = await db.orm.public.PaymentOption
      .where({ isActive: true })
      .orderBy((option) => option.sortOrder.asc())
      .orderBy((option) => option.createdAt.asc())
      .all();

    const result = await Promise.all(options.map(async (option) => ({
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
    })));

    return ok(result.filter((option) => option.method !== 'QRIS' || option.qrImageUrl));
  } catch (error) {
    return handleError(error);
  }
}
