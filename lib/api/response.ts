import { ZodError } from 'zod';
import { AppError } from './errors';

type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
};

const API_HEADERS = {
  'Cache-Control': 'private, no-store, max-age=0',
  'X-Content-Type-Options': 'nosniff',
};

export function ok<T>(data: T, meta?: PaginationMeta): Response {
  return Response.json({ data, ...(meta ? { meta } : {}) }, { status: 200, headers: API_HEADERS });
}

export function created<T>(data: T): Response {
  return Response.json({ data }, { status: 201, headers: API_HEADERS });
}

export function noContent(): Response {
  return new Response(null, { status: 204, headers: API_HEADERS });
}

export function handleError(error: unknown): Response {
  if (error instanceof AppError) {
    return Response.json(
      {
        error: {
          code: error.code,
          message: error.message,
          ...(error.details ? { details: error.details } : {}),
        },
      },
      { status: error.status, headers: API_HEADERS },
    );
  }

  if (error instanceof ZodError) {
    return Response.json(
      {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Request tidak valid',
          details: error.issues.map(({ code, path, message }) => ({ code, path, message })),
        },
      },
      { status: 400, headers: API_HEADERS },
    );
  }

  if (error instanceof SyntaxError) {
    return Response.json(
      { error: { code: 'VALIDATION_ERROR', message: 'JSON request tidak valid' } },
      { status: 400, headers: API_HEADERS },
    );
  }

  console.error('[Unhandled error]', error);
  return Response.json(
    {
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Terjadi kesalahan pada server',
      },
    },
    { status: 500, headers: API_HEADERS },
  );
}
