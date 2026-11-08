import { z } from 'zod';

export const updateMembershipSchema = z.object({
  expiresAt: z.string().datetime().nullable().optional(),
}).refine((value) => Object.keys(value).length > 0, {
  message: 'Minimal satu field membership harus diperbarui',
});

export const adjustPointsSchema = z.object({
  deltaPoints: z
    .number()
    .int('Delta poin harus bilangan bulat')
    .refine((v) => v !== 0, { message: 'Delta poin tidak boleh 0' }),
  reason: z.string().min(1, 'Alasan wajib diisi').max(200),
  idempotencyKey: z.string().max(100).optional(),
});

export const updateMembershipPointPolicySchema = z.object({
  pointsPerCompletedBooking: z
    .number()
    .int()
    .min(0, 'Poin tidak boleh negatif'),
});

export type UpdateMembershipInput = z.infer<typeof updateMembershipSchema>;
export type AdjustPointsInput = z.infer<typeof adjustPointsSchema>;
export type UpdateMembershipPointPolicyInput = z.infer<typeof updateMembershipPointPolicySchema>;
