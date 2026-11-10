import { z } from 'zod';

export const createBarberSchema = z.object({
  branchId: z.string().uuid('branchId harus berupa UUID valid'),
  name: z.string().trim().min(1, 'Nama capster wajib diisi').max(100),
  bio: z.string().max(500).nullable().optional(),
});

export const updateBarberSchema = createBarberSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export type CreateBarberInput = z.infer<typeof createBarberSchema>;
export type UpdateBarberInput = z.infer<typeof updateBarberSchema>;
