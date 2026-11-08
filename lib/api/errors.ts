export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'UNPROCESSABLE'
  | 'PAYLOAD_TOO_LARGE'
  | 'UNSUPPORTED_MEDIA_TYPE'
  | 'INTERNAL_ERROR';

export class AppError extends Error {
  constructor(
    public readonly code: ErrorCode,
    message: string,
    public readonly status: number,
    public readonly details?: unknown[],
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function unauthorized(message = 'Autentikasi diperlukan') {
  return new AppError('UNAUTHORIZED', message, 401);
}

export function forbidden(message = 'Akses ditolak') {
  return new AppError('FORBIDDEN', message, 403);
}

export function notFound(resource = 'Resource') {
  return new AppError('NOT_FOUND', `${resource} tidak ditemukan`, 404);
}

export function conflict(message: string) {
  return new AppError('CONFLICT', message, 409);
}

export function unprocessable(message: string, details?: unknown[]) {
  return new AppError('UNPROCESSABLE', message, 422, details);
}

export function validationError(message: string, details?: unknown[]) {
  return new AppError('VALIDATION_ERROR', message, 400, details);
}

export function payloadTooLarge() {
  return new AppError('PAYLOAD_TOO_LARGE', 'Ukuran request melebihi batas maksimum', 413);
}

export function unsupportedMediaType() {
  return new AppError('UNSUPPORTED_MEDIA_TYPE', 'Content-Type request tidak didukung', 415);
}
