import { z } from 'zod';

export const createBranchSchema = z.object({
  name: z.string().min(1, 'Nama cabang wajib diisi').max(100),
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/, 'Slug hanya boleh berisi huruf kecil, angka, dan tanda hubung'),
  address: z.string().min(1, 'Alamat wajib diisi'),
  city: z.string().min(1, 'Kota wajib diisi'),
  phone: z.string().max(20).optional(),
  mapsUrl: z.string().url('URL Google Maps tidak valid').optional().or(z.literal('')),
});

export const updateBranchSchema = createBranchSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export type CreateBranchInput = z.infer<typeof createBranchSchema>;
export type UpdateBranchInput = z.infer<typeof updateBranchSchema>;
