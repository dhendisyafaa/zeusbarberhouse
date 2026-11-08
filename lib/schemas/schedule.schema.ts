import { z } from 'zod';

const minuteRange = z
  .number()
  .int()
  .min(0, 'Menit harus >= 0')
  .max(1439, 'Menit harus <= 1439');

const rawBranchScheduleObject = z.object({
  branchId: z.string().uuid(),
  dayOfWeek: z.number().int().min(0).max(6),
  openMinute: minuteRange,
  closeMinute: minuteRange,
});

export const createBranchScheduleSchema = rawBranchScheduleObject.refine(
  (d) => d.closeMinute > d.openMinute,
  {
    message: 'closeMinute harus lebih besar dari openMinute',
    path: ['closeMinute'],
  },
);

const rawBarberScheduleObject = z.object({
  barberId: z.string().uuid(),
  dayOfWeek: z.number().int().min(0).max(6),
  startMinute: minuteRange,
  endMinute: minuteRange,
  breakStartMinute: minuteRange.optional(),
  breakEndMinute: minuteRange.optional(),
});

export const createBarberScheduleSchema = rawBarberScheduleObject.refine(
  (d) => d.endMinute > d.startMinute,
  {
    message: 'endMinute harus lebih besar dari startMinute',
    path: ['endMinute'],
  },
);

export const updateBranchScheduleSchema = rawBranchScheduleObject
  .omit({ branchId: true, dayOfWeek: true })
  .partial();

export const updateBarberScheduleSchema = rawBarberScheduleObject
  .omit({ barberId: true, dayOfWeek: true })
  .partial();

export type CreateBranchScheduleInput = z.infer<typeof createBranchScheduleSchema>;
export type CreateBarberScheduleInput = z.infer<typeof createBarberScheduleSchema>;
export type UpdateBranchScheduleInput = z.infer<typeof updateBranchScheduleSchema>;
export type UpdateBarberScheduleInput = z.infer<typeof updateBarberScheduleSchema>;
