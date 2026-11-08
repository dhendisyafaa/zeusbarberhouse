import { z } from 'zod';
import { forbidden, payloadTooLarge, unsupportedMediaType, validationError } from './errors';

const DEFAULT_JSON_LIMIT = 64 * 1024;

export async function readJson(request: Request, maxBytes = DEFAULT_JSON_LIMIT): Promise<unknown> {
  const contentType = request.headers.get('content-type')?.split(';', 1)[0].trim().toLowerCase();
  if (contentType !== 'application/json') throw unsupportedMediaType();

  const contentLength = request.headers.get('content-length');
  if (contentLength) {
    if (!/^\d+$/.test(contentLength)) throw validationError('Content-Length tidak valid');
    if (Number(contentLength) > maxBytes) throw payloadTooLarge();
  }

  if (!request.body) throw validationError('Request body wajib diisi');

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      totalBytes += value.byteLength;
      if (totalBytes > maxBytes) {
        await reader.cancel();
        throw payloadTooLarge();
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const body = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }

  try {
    return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(body)) as unknown;
  } catch {
    throw validationError('JSON request tidak valid');
  }
}

export function assertSameOrigin(request: Request) {
  const origin = request.headers.get('origin');
  let requestOrigin: string;

  try {
    requestOrigin = new URL(request.url).origin;
  } catch {
    throw validationError('Origin request tidak valid');
  }

  if (!origin || origin !== requestOrigin) {
    throw forbidden('Request lintas-origin tidak diizinkan');
  }
}

export function parseUuid(value: string, fieldName = 'ID') {
  const parsed = z.string().uuid().safeParse(value);
  if (!parsed.success) throw validationError(`${fieldName} tidak valid`);
  return parsed.data;
}
