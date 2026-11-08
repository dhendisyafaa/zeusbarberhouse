import { z } from 'zod';

export const createTransactionSchema = z.object({
  branchId: z.string().uuid(),
  customerId: z.string().uuid().optional(),
  bookingId: z.string().uuid().optional(),
  totalAmountRupiah: z.number().int().min(0),
  note: z.string().max(500).optional(),
  items: z
    .array(
      z.object({
        serviceId: z.string().uuid().optional(),
        nameSnapshot: z.string().min(1),
        quantity: z.number().int().min(1).default(1),
        unitPriceRupiahSnapshot: z.number().int().min(0),
      }),
    )
    .min(1, 'Minimal satu item transaksi'),
});

export const updatePaymentSchema = z.object({
  paymentId: z.string().uuid('paymentId tidak valid'),
  status: z.enum(['VERIFIED', 'REJECTED']),
  note: z.string().max(500).optional(),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdatePaymentInput = z.infer<typeof updatePaymentSchema>;
