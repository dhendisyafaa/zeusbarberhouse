import type { NextRequest } from 'next/server';
import { validationError } from './errors';

export type PaginationParams = {
  page: number;
  limit: number;
  skip: number;
};

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export function parsePagination(request: NextRequest): PaginationParams {
  const params = request.nextUrl.searchParams;
  const rawPage = params.get('page') ?? '1';
  const rawLimit = params.get('limit') ?? String(DEFAULT_LIMIT);

  if (!/^[1-9]\d*$/.test(rawPage) || !/^[1-9]\d*$/.test(rawLimit)) {
    throw validationError('page dan limit harus berupa bilangan bulat positif');
  }

  const page = Number(rawPage);
  const requestedLimit = Number(rawLimit);
  if (!Number.isSafeInteger(page) || !Number.isSafeInteger(requestedLimit)) {
    throw validationError('page atau limit terlalu besar');
  }
  if (requestedLimit > MAX_LIMIT) {
    throw validationError(`limit maksimal ${MAX_LIMIT}`);
  }

  const limit = requestedLimit;
  const skip = (page - 1) * limit;
  if (!Number.isSafeInteger(skip)) {
    throw validationError('page terlalu besar');
  }

  return { page, limit, skip };
}
