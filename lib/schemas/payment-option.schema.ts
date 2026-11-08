import { z } from 'zod';

const optionalText = z.string().trim().max(500).transform((value) => value || null);

export const paymentOptionInputSchema = z.object({
  method: z.enum(['BANK_TRANSFER', 'QRIS']),
  label: z.string().trim().min(1).max(100),
  bankName: optionalText,
  accountNumber: z.string().trim().max(50).transform((value) => value || null),
  accountHolder: optionalText,
  instructions: optionalText,
  sortOrder: z.coerce.number().int().min(0).max(10000),
  isActive: z.enum(['true', 'false']).transform((value) => value === 'true'),
}).strict().superRefine((input, context) => {
  if (input.method === 'BANK_TRANSFER') {
    for (const [field, value] of [
      ['bankName', input.bankName],
      ['accountNumber', input.accountNumber],
      ['accountHolder', input.accountHolder],
    ] as const) {
      if (!value) {
        context.addIssue({
          code: 'custom',
          path: [field],
          message: 'Wajib diisi untuk metode transfer bank',
        });
      }
    }
  }
});

export type PaymentOptionInput = z.infer<typeof paymentOptionInputSchema>;
