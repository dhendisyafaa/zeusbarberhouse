import type { NextRequest } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/api/auth";
import { forbidden, notFound, unprocessable } from "@/lib/api/errors";
import { ok, handleError } from "@/lib/api/response";
import { verifyGuestBookingAccessToken } from "@/lib/api/guest-booking-access";
import { markBookingAwaitingConfirmation } from "@/lib/services/booking.service";
import { payloadTooLarge, validationError } from "@/lib/api/errors";
import { assertSameOrigin } from "@/lib/api/request";
import { getPrivateStorageBucket } from "@/lib/supabase/private-storage";
import { db } from "@/src/prisma/db";

const MAX_FILE_SIZE_BYTES = 3 * 1024 * 1024; // 5 MB
const MAX_REQUEST_SIZE_BYTES = MAX_FILE_SIZE_BYTES + 64 * 1024;
const BUCKET_NAME = "payment-proofs";
const FILE_TYPES = {
  "image/jpeg": {
    extension: "jpg",
    matches: (bytes: Uint8Array) =>
      bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff,
  },
  "image/png": {
    extension: "png",
    matches: (bytes: Uint8Array) =>
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47 &&
      bytes[4] === 0x0d &&
      bytes[5] === 0x0a &&
      bytes[6] === 0x1a &&
      bytes[7] === 0x0a,
  },
  "image/webp": {
    extension: "webp",
    matches: (bytes: Uint8Array) =>
      bytes[0] === 0x52 &&
      bytes[1] === 0x49 &&
      bytes[2] === 0x46 &&
      bytes[3] === 0x46 &&
      bytes[8] === 0x57 &&
      bytes[9] === 0x45 &&
      bytes[10] === 0x42 &&
      bytes[11] === 0x50,
  },
};

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    assertSameOrigin(request);
    const { id } = await params;
    z.string().uuid().parse(id);

    const booking = await db.orm.public.Booking.first({ id });
    if (!booking) throw notFound("Booking");

    const user = await getSession();
    let isOwner = false;
    if (user) {
      const profile = await db.orm.public.Profile.first({
        authUserId: user.id,
      });
      if (profile?.role === "CUSTOMER") {
        const customer = await db.orm.public.Customer.first({
          profileId: profile.id,
        });
        isOwner = customer?.id === booking.customerId;
      }
    }

    const guestToken = request.headers.get("x-booking-access-token") ?? "";
    if (!isOwner && !verifyGuestBookingAccessToken(guestToken, booking.id)) {
      throw forbidden(
        "Anda tidak memiliki akses untuk mengirim bukti booking ini",
      );
    }
    if (booking.status !== "PENDING_PAYMENT") {
      throw unprocessable("Booking ini tidak lagi menunggu pembayaran");
    }
    if (booking.holdExpiresAt && booking.holdExpiresAt <= new Date()) {
      throw unprocessable(
        "Waktu pembayaran telah habis. Silakan buat booking baru",
      );
    }

    const contentType =
      request.headers.get("content-type")?.toLowerCase() ?? "";
    if (
      !contentType.startsWith("multipart/form-data;") ||
      !contentType.includes("boundary=")
    ) {
      throw validationError("Request harus berupa multipart/form-data");
    }

    const contentLength = Number(request.headers.get("content-length"));
    if (!Number.isSafeInteger(contentLength) || contentLength <= 0) {
      throw validationError("Content-Length upload tidak valid");
    }
    if (contentLength > MAX_REQUEST_SIZE_BYTES) {
      throw payloadTooLarge();
    }

    const formData = await request.formData();
    const file = formData.get("proof");
    const paymentOptionId = z
      .string()
      .uuid()
      .parse(formData.get("paymentOptionId"));

    if (!file || !(file instanceof File)) {
      throw validationError(
        'File bukti transfer wajib diunggah dengan field "proof"',
      );
    }

    if (file.size <= 0 || file.size > MAX_FILE_SIZE_BYTES) {
      throw unprocessable("Ukuran file harus lebih dari 0 dan maksimal 5 MB");
    }

    const fileType = Object.entries(FILE_TYPES).find(
      ([mimeType]) => mimeType === file.type,
    )?.[1];
    if (!fileType) throw validationError("Gunakan file JPEG, PNG, atau WebP");

    const bytes = new Uint8Array(await file.arrayBuffer());
    if (!fileType.matches(bytes)) {
      throw validationError(
        "Isi file tidak sesuai dengan tipe gambar yang diizinkan",
      );
    }

    const storagePath = `${id}/${crypto.randomUUID()}.${fileType.extension}`;
    const storage = await getPrivateStorageBucket(BUCKET_NAME, {
      fileSizeLimit: "5MB",
      allowedMimeTypes: Object.keys(FILE_TYPES),
    });
    const { error: uploadError } = await storage.upload(storagePath, bytes, {
      contentType: file.type,
      upsert: false,
    });
    if (uploadError) throw uploadError;

    let result;
    try {
      result = await markBookingAwaitingConfirmation(
        id,
        storagePath,
        paymentOptionId,
      );
    } catch (error) {
      const { error: cleanupError } = await storage.remove([storagePath]);
      if (cleanupError)
        console.error("[Payment proof cleanup failed]", cleanupError);
      throw error;
    }

    return ok({
      bookingId: id,
      bookingStatus: "AWAITING_CONFIRMATION",
      paymentId: result.payment.id,
      proofStoragePath: storagePath,
    });
  } catch (error) {
    return handleError(error);
  }
}
