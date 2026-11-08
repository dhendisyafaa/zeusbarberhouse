import { z } from 'zod';

export const createServiceSchema = z.object({
  name: z.string().min(1, 'Nama layanan wajib diisi').max(100),
  description: z.string().max(500).optional(),
  priceRupiah: z.number().int('Harga harus bilangan bulat').min(0, 'Harga tidak boleh negatif'),
  durationMinutes: z.number().int().min(1, 'Durasi minimal 1 menit'),
  sortOrder: z.number().int().default(0),
});

export const updateServiceSchema = createServiceSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;
