import { z } from 'zod';

export const createHaircutModelSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
}).strict();

export const updateHaircutModelSchema = createHaircutModelSchema.partial();

export const createSiteContentSchema = z.object({
  key: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9_-]+$/, 'Key hanya boleh berisi huruf kecil, angka, underscore, dan tanda hubung'),
  title: z.string().min(1).max(200),
  body: z.string().min(1),
  isPublished: z.boolean().default(false),
});

export const updateSiteContentSchema = createSiteContentSchema.omit({ key: true }).partial();

export type CreateHaircutModelInput = z.infer<typeof createHaircutModelSchema>;
export type UpdateHaircutModelInput = z.infer<typeof updateHaircutModelSchema>;
export type CreateSiteContentInput = z.infer<typeof createSiteContentSchema>;
export type UpdateSiteContentInput = z.infer<typeof updateSiteContentSchema>;
