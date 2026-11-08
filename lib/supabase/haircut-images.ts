import 'server-only';
import { getPrivateStorageBucket } from './private-storage';

export const HAIRCUT_IMAGE_BUCKET = 'haircut-models';
export const HAIRCUT_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
export const HAIRCUT_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

export async function getHaircutImageStorage() {
  return getPrivateStorageBucket(HAIRCUT_IMAGE_BUCKET, {
    fileSizeLimit: '5MB',
    allowedMimeTypes: [...HAIRCUT_IMAGE_TYPES],
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

export async function createHaircutImageSignedUrl(
  storage: Awaited<ReturnType<typeof getHaircutImageStorage>>,
  imagePath: string,
) {
  try {
    const { data, error } = await storage.createSignedUrl(imagePath, 3600);
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
