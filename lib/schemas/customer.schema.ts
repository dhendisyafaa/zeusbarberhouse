import { z } from 'zod';

export const updateCustomerProfileSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  email: z.union([z.string().trim().email().max(254), z.literal('')]).optional(),
  phone: z.union([z.string().trim().min(5).max(20), z.literal('')]).optional(),
}).strict().refine((value) => Object.keys(value).length > 0, {
  message: 'Minimal satu kolom profil harus diisi',
});

export const provisionCustomerAccountSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  phone: z.union([z.string().trim().min(5).max(20), z.literal('')]).optional(),
}).strict();

export type UpdateCustomerProfileInput = z.infer<typeof updateCustomerProfileSchema>;
export type ProvisionCustomerAccountInput = z.infer<typeof provisionCustomerAccountSchema>;
