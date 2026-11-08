import { unprocessable, payloadTooLarge, validationError } from '@/lib/api/errors';
import { createHaircutModelSchema } from '@/lib/schemas/content.schema';
import {
  HAIRCUT_IMAGE_MAX_BYTES,
  HAIRCUT_IMAGE_TYPES,
} from '@/lib/supabase/haircut-images';

const MAX_REQUEST_BYTES = HAIRCUT_IMAGE_MAX_BYTES + 64 * 1024;
const FILE_SIGNATURES: Record<string, (bytes: Uint8Array) => boolean> = {
  'image/jpeg': (bytes) => bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff,
  'image/png': (bytes) =>
    bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 &&
    bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a,
  'image/webp': (bytes) =>
    bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
    bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50,
};

export async function readHaircutModelUpload(
  request: Request,
  { requireImage }: { requireImage: boolean },
) {
  const contentType = request.headers.get('content-type')?.toLowerCase() ?? '';
  if (!contentType.startsWith('multipart/form-data;') || !contentType.includes('boundary=')) {
    throw validationError('Request harus berupa multipart/form-data');
  }

  const contentLength = Number(request.headers.get('content-length'));
  if (!Number.isSafeInteger(contentLength) || contentLength <= 0) {
    throw validationError('Content-Length upload tidak valid');
  }
  if (contentLength > MAX_REQUEST_BYTES) throw payloadTooLarge();

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    throw validationError('Form upload tidak valid');
  }

  const fileEntry = formData.get('image');
  if (fileEntry !== null && !(fileEntry instanceof File)) {
    throw validationError('File gambar tidak valid');
  }
  const file = fileEntry instanceof File ? fileEntry : null;
  if (requireImage && (!file || file.size === 0)) {
    throw unprocessable('Gambar wajib diunggah');
  }
  if (file && (file.size <= 0 || file.size > HAIRCUT_IMAGE_MAX_BYTES)) {
    throw unprocessable('Ukuran gambar harus lebih dari 0 dan maksimal 5 MB');
  }
  if (file && !(HAIRCUT_IMAGE_TYPES as readonly string[]).includes(file.type)) {
    throw validationError('Gambar harus berformat JPEG, PNG, atau WebP');
  }

  const input = createHaircutModelSchema.parse({
    title: formData.get('title'),
    description: formData.get('description') ?? undefined,
  });
  const bytes = file ? new Uint8Array(await file.arrayBuffer()) : null;
  if (file && bytes && !FILE_SIGNATURES[file.type]?.(bytes)) {
    throw validationError('Isi file tidak sesuai dengan tipe gambar yang diizinkan');
  }

  return { input, file, bytes };
}
