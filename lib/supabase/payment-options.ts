import 'server-only';
import { getPrivateStorageBucket } from './private-storage';

export const PAYMENT_OPTION_IMAGE_BUCKET = 'payment-options';
export const PAYMENT_OPTION_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
export const PAYMENT_OPTION_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

export async function getPaymentOptionImageStorage() {
  return getPrivateStorageBucket(PAYMENT_OPTION_IMAGE_BUCKET, {
    fileSizeLimit: '5MB',
    allowedMimeTypes: [...PAYMENT_OPTION_IMAGE_TYPES],
  });
}

export async function createPaymentOptionImageSignedUrl(imagePath: string) {
  const storage = await getPaymentOptionImageStorage();
  const { data, error } = await storage.createSignedUrl(imagePath, 600);
  if (error) {
    const storageError = error as { status?: number; statusCode?: string; code?: string };
    if (storageError.status === 404 || storageError.statusCode === '404' || storageError.code === 'NoSuchKey') {
      return null;
    }
    throw error;
  }
  return data.signedUrl;
}
