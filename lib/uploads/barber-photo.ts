import { payloadTooLarge, unprocessable, validationError } from '@/lib/api/errors';
import {
  createBarberSchema,
  updateBarberSchema,
  type CreateBarberInput,
  type UpdateBarberInput,
} from '@/lib/schemas/barber.schema';
import {
  BARBER_PHOTO_MAX_BYTES,
  BARBER_PHOTO_TYPES,
} from '@/lib/supabase/barber-photos';

const MAX_REQUEST_BYTES = BARBER_PHOTO_MAX_BYTES + 64 * 1024;
const FILE_SIGNATURES: Record<string, (bytes: Uint8Array) => boolean> = {
  'image/jpeg': (bytes) => bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff,
  'image/png': (bytes) =>
    bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 &&
    bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a,
  'image/webp': (bytes) =>
    bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
    bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50,
};

function stringField(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === 'string' ? value.trim() : undefined;
}

function bioField(formData: FormData) {
  const value = stringField(formData, 'bio');
  return value ? value : null;
}

function activeField(formData: FormData) {
  const value = formData.get('isActive');
  if (value === null || value === '') return undefined;
  if (value === 'true') return true;
  if (value === 'false') return false;
  throw validationError('Status aktif tidak valid');
}

type BarberUpload<TInput> = {
  input: TInput;
  file: File | null;
  bytes: Uint8Array | null;
};

export async function readBarberUpload(
  request: Request,
  options: { requirePhoto: true },
): Promise<BarberUpload<CreateBarberInput>>;
export async function readBarberUpload(
  request: Request,
  options: { requirePhoto: false },
): Promise<BarberUpload<UpdateBarberInput>>;
export async function readBarberUpload(
  request: Request,
  { requirePhoto }: { requirePhoto: boolean },
): Promise<BarberUpload<CreateBarberInput | UpdateBarberInput>> {
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

  const fileEntry = formData.get('photo');
  if (fileEntry !== null && !(fileEntry instanceof File)) {
    throw validationError('File foto tidak valid');
  }
  const file = fileEntry instanceof File ? fileEntry : null;
  if (requirePhoto && (!file || file.size === 0)) {
    throw unprocessable('Foto capster wajib diunggah');
  }
  if (file && (file.size <= 0 || file.size > BARBER_PHOTO_MAX_BYTES)) {
    throw unprocessable('Ukuran foto harus lebih dari 0 dan maksimal 5 MB');
  }
  if (file && !(BARBER_PHOTO_TYPES as readonly string[]).includes(file.type)) {
    throw validationError('Foto harus berformat JPEG, PNG, atau WebP');
  }

  const fields = {
    branchId: stringField(formData, 'branchId'),
    name: stringField(formData, 'name'),
    bio: bioField(formData),
  };
  const isActive = activeField(formData);
  const input = requirePhoto
    ? createBarberSchema.parse(fields)
    : updateBarberSchema.parse({
        ...fields,
        ...(isActive === undefined ? {} : { isActive }),
      });

  const bytes = file ? new Uint8Array(await file.arrayBuffer()) : null;
  if (file && bytes && !FILE_SIGNATURES[file.type]?.(bytes)) {
    throw validationError('Isi file tidak sesuai dengan tipe gambar yang diizinkan');
  }

  return { input, file, bytes };
}
