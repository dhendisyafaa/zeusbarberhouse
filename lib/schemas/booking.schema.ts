import { z } from 'zod';

export const createBookingSchema = z.object({
  branchId: z.string().uuid('branchId tidak valid'),
  barberId: z.string().uuid('barberId tidak valid'),
  serviceIds: z
    .array(z.string().uuid())
    .min(1, 'Minimal satu layanan harus dipilih'),
  startsAt: z.string().datetime({ message: 'Format tanggal/waktu tidak valid (ISO 8601)' }),
  note: z.string().max(500).optional(),
  // Guest fields — required if no authenticated customer
  guestName: z.string().min(1).max(100).optional(),
  guestPhone: z.string().min(5).max(20).optional(),
});

export const updateBookingStatusSchema = z.object({
  status: z.enum(['CONFIRMED', 'REJECTED', 'COMPLETED']),
  note: z.string().max(500).optional(),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type UpdateBookingStatusInput = z.infer<typeof updateBookingStatusSchema>;
