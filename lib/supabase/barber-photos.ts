import 'server-only';
import { getPrivateStorageBucket } from './private-storage';

export const BARBER_PHOTO_BUCKET = 'barber-photos';
export const BARBER_PHOTO_MAX_BYTES = 5 * 1024 * 1024;
export const BARBER_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

export async function getBarberPhotoStorage() {
  return getPrivateStorageBucket(BARBER_PHOTO_BUCKET, {
    fileSizeLimit: '5MB',
    allowedMimeTypes: [...BARBER_PHOTO_TYPES],
  });
}

function isMissingStorageObject(error: unknown) {
  if (!error || typeof error !== 'object') return false;

  const storageError = error as {
    code?: unknown;
    namespace?: unknown;
    statusCode?: unknown;
  };

  return storageError.namespace === 'storage' &&
    (storageError.statusCode === '404' || storageError.code === 'NoSuchKey');
}

export async function createBarberPhotoSignedUrl(
  storage: Awaited<ReturnType<typeof getBarberPhotoStorage>>,
  photoPath: string,
) {
  try {
    const { data, error } = await storage.createSignedUrl(photoPath, 3600);
    if (error) {
      if (isMissingStorageObject(error)) return null;
      throw error;
    }

    return data.signedUrl;
  } catch (error) {
    if (isMissingStorageObject(error)) return null;
    throw error;
  }
}

export async function attachBarberPhotoUrls<T extends { photoPath: string | null }>(rows: T[]) {
  const needsStorage = rows.some((row) => row.photoPath);
  if (!needsStorage) {
    return rows.map((row) => ({ ...row, photoUrl: null as string | null }));
  }

  const storage = await getBarberPhotoStorage();
  return Promise.all(rows.map(async (row) => ({
    ...row,
    photoUrl: row.photoPath
      ? await createBarberPhotoSignedUrl(storage, row.photoPath)
      : null,
  })));
}
