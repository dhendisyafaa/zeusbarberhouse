import type { NextRequest } from 'next/server';
import { validationError } from '@/lib/api/errors';
import { parseUuid } from '@/lib/api/request';
import { handleError, ok } from '@/lib/api/response';
import { getAvailableTimeSlots } from '@/lib/services/availability.service';

export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;
    const branchId = parseUuid(params.get('branchId') ?? '', 'ID cabang');
    const barberId = parseUuid(params.get('barberId') ?? '', 'ID capster');
    const date = params.get('date') ?? '';
    const durationMinutes = Number(params.get('durationMinutes'));
    const parsedDate = new Date(`${date}T00:00:00.000Z`);

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(parsedDate.getTime()) ||
        parsedDate.toISOString().slice(0, 10) !== date) {
      throw validationError('Tanggal harus berformat YYYY-MM-DD');
    }
    if (!Number.isInteger(durationMinutes) || durationMinutes < 1 || durationMinutes > 600) {
      throw validationError('Durasi booking tidak valid');
    }

    const slots = await getAvailableTimeSlots({ branchId, barberId, date, durationMinutes });
    return ok({ date, slots });
  } catch (error) {
    return handleError(error);
  }
}
