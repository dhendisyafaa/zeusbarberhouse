import 'server-only';
import { createSupabaseAdminClient } from './admin';

export async function getPrivateStorageBucket(
  bucketName: string,
  {
    fileSizeLimit,
    allowedMimeTypes,
  }: {
    fileSizeLimit: string;
    allowedMimeTypes: string[];
  },
) {
  const storage = createSupabaseAdminClient().storage;
  const existing = await storage.getBucket(bucketName);

  if (existing.error) {
    const created = await storage.createBucket(bucketName, {
      public: false,
      fileSizeLimit,
      allowedMimeTypes,
    });

    if (created.error) {
      const verified = await storage.getBucket(bucketName);
      if (verified.error) throw created.error;
      if (verified.data.public) {
        throw new Error(`Storage bucket "${bucketName}" must be private`);
      }
    }
  } else if (existing.data.public) {
    throw new Error(`Storage bucket "${bucketName}" must be private`);
  }

  return storage.from(bucketName);
}
