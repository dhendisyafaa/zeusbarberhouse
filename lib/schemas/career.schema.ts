import { z } from 'zod';

export const createVacancySchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1),
  closesAt: z.string().datetime().nullable().optional(),
});

export const updateVacancySchema = createVacancySchema.partial();

export const submitJobApplicationSchema = z.object({
  vacancyId: z.string().uuid('vacancyId tidak valid'),
  name: z.string().min(1).max(100),
  email: z.string().email('Email tidak valid'),
  phone: z.string().min(5).max(20),
  experience: z.string().trim().min(1, 'Pengalaman wajib diisi').max(1000),
});

export const updateJobApplicationSchema = z.object({
  status: z.enum(['ACCEPTED', 'REJECTED']),
  note: z.string().max(500).optional(),
});

export type CreateVacancyInput = z.infer<typeof createVacancySchema>;
export type UpdateVacancyInput = z.infer<typeof updateVacancySchema>;
export type SubmitJobApplicationInput = z.infer<typeof submitJobApplicationSchema>;
export type UpdateJobApplicationInput = z.infer<typeof updateJobApplicationSchema>;
