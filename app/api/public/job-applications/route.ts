import type { NextRequest } from 'next/server';
import { submitJobApplicationSchema } from '@/lib/schemas/career.schema';
import { db } from '@/src/prisma/db';
import { created, handleError } from '@/lib/api/response';
import { notFound, payloadTooLarge, unprocessable, validationError } from '@/lib/api/errors';
import { assertSameOrigin } from '@/lib/api/request';
import { getPrivateStorageBucket } from '@/lib/supabase/private-storage';

const MAX_RESUME_BYTES = 5 * 1024 * 1024;
const MAX_REQUEST_BYTES = MAX_RESUME_BYTES + 64 * 1024;
const BUCKET_NAME = 'career-applications';

function isPdf(bytes: Uint8Array) {
  return bytes.length >= 5 &&
    bytes[0] === 0x25 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x44 &&
    bytes[3] === 0x46 &&
    bytes[4] === 0x2d;
}

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);
    const contentType = request.headers.get('content-type')?.split(';', 1)[0].trim().toLowerCase();
    if (contentType !== 'multipart/form-data') {
      throw validationError('Request harus menggunakan multipart/form-data karena CV/resume wajib diunggah');
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
      throw validationError('Multipart request tidak valid');
    }
    const resumeEntry = formData.get('resume');
    if (!(resumeEntry instanceof File) || !resumeEntry.name) {
      throw validationError('CV/resume wajib diunggah dalam format PDF');
    }
    if (resumeEntry.size <= 0 || resumeEntry.size > MAX_RESUME_BYTES) {
      throw unprocessable('Ukuran CV/resume harus lebih dari 0 dan maksimal 5 MB');
    }
    if (resumeEntry.type !== 'application/pdf') {
      throw validationError('CV/resume harus berupa file PDF');
    }
    const resume = resumeEntry;
    const input = submitJobApplicationSchema.parse({
      vacancyId: formData.get('vacancyId'),
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      experience: formData.get('experience'),
    });

    const now = new Date();
    const vacancy = await db.orm.public.CareerVacancy.first({ id: input.vacancyId });

    if (!vacancy || !vacancy.isPublished) throw notFound('Lowongan');
    if (vacancy.closesAt && vacancy.closesAt < now) {
      throw unprocessable('Lowongan ini sudah ditutup');
    }

    const resumeBytes = new Uint8Array(await resume.arrayBuffer());
    if (!isPdf(resumeBytes)) throw validationError('Isi file tidak sesuai dengan format PDF');
    const storagePath = `${crypto.randomUUID()}/resume.pdf`;
    const baseFileName = (resume.name.split(/[\\/]/).pop() || 'resume')
      .replace(/[\u0000-\u001f\u007f]/g, '')
      .replace(/\.pdf$/i, '')
      .replace(/[. ]+$/g, '')
      .slice(0, 251);
    const originalFileName = `${baseFileName || 'resume'}.pdf`;
    const storage = await getPrivateStorageBucket(BUCKET_NAME, {
      fileSizeLimit: '5MB',
      allowedMimeTypes: ['application/pdf'],
    });
    const { error: uploadError } = await storage.upload(storagePath, resumeBytes, {
      contentType: 'application/pdf',
      upsert: false,
    });
    if (uploadError) throw uploadError;

    try {
      const application = await db.transaction(async (tx) =>
        tx.orm.public.JobApplication
          .select('id', 'name', 'status', 'createdAt')
          .create({
          vacancyId: input.vacancyId,
          name: input.name,
          email: input.email,
          phone: input.phone,
          message: input.experience,
          status: 'SUBMITTED',
          statusEvents: (events) =>
            events.create({
              fromStatus: null,
              toStatus: 'SUBMITTED',
            }),
          documents: (documents) => documents.create({
            storagePath,
            originalFileName,
            mimeType: 'application/pdf',
            sizeBytes: resumeBytes.byteLength,
          }),
        }),
      );
      return created(application);
    } catch (error) {
      const { error: cleanupError } = await storage.remove([storagePath]);
      if (cleanupError) console.error('[Career document cleanup failed]', cleanupError);
      throw error;
    }
  } catch (error) {
    return handleError(error);
  }
}
