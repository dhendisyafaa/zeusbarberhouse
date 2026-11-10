"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle2, Clock3, Upload, X } from "lucide-react";
import {
  customerQueryKeys,
  fetchApiData,
  publicQueryKeys,
} from "@/lib/queries/api";

interface SoftLockModalProps {
  isOpen: boolean;
  onClose: () => void;
  branchName: string;
  datetimeLabel: string;
  totalPrice: number;
  ticketCode: string;
  bookingId: string;
  holdExpiresAt: string;
  guestAccessToken?: string;
}

type PaymentProofResponse = {
  bookingId: string;
  bookingStatus: string;
  paymentId: string;
};

type PaymentOption = {
  id: string;
  method: "BANK_TRANSFER" | "QRIS";
  label: string;
  bankName: string | null;
  accountNumber: string | null;
  accountHolder: string | null;
  instructions: string | null;
  qrImageUrl: string | null;
};

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

export function SoftLockModal({
  isOpen,
  onClose,
  branchName,
  datetimeLabel,
  totalPrice,
  ticketCode,
  bookingId,
  holdExpiresAt,
  guestAccessToken,
}: SoftLockModalProps) {
  const [selectedFile, setSelectedFile] = useState<{
    bookingId: string;
    file: File;
  } | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [fileError, setFileError] = useState<{
    bookingId: string;
    message: string;
  } | null>(null);
  const [selectedPaymentOption, setSelectedPaymentOption] = useState<{
    bookingId: string;
    id: string;
  } | null>(null);
  const queryClient = useQueryClient();
  const paymentOptionsQuery = useQuery({
    queryKey: publicQueryKeys.paymentOptions,
    queryFn: () => fetchApiData<PaymentOption[]>("/api/public/payment-options"),
    enabled: isOpen,
    staleTime: 5 * 60 * 1000,
  });
  const paymentMutation = useMutation({
    mutationFn: async ({
      bookingId: targetBookingId,
      proof,
      paymentOptionId,
      accessToken,
    }: {
      bookingId: string;
      proof: File;
      paymentOptionId: string;
      accessToken?: string;
    }) => {
      const body = new FormData();
      body.append("proof", proof);
      body.append("paymentOptionId", paymentOptionId);
      return fetchApiData<PaymentProofResponse>(
        `/api/public/bookings/${encodeURIComponent(targetBookingId)}/payment-proof`,
        {
          method: "POST",
          ...(accessToken
            ? { headers: { "X-Booking-Access-Token": accessToken } }
            : {}),
          body,
        },
      );
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: customerQueryKeys.bookings }),
        queryClient.invalidateQueries({
          queryKey: customerQueryKeys.transactions,
        }),
      ]);
    },
    onError: () =>
      queryClient.invalidateQueries({
        queryKey: publicQueryKeys.paymentOptions,
      }),
  });

  useEffect(() => {
    if (!isOpen) return;
    const updateCountdown = () => {
      const remaining = Math.max(
        0,
        Math.ceil((new Date(holdExpiresAt).getTime() - Date.now()) / 1000),
      );
      setSecondsLeft(remaining);
    };
    updateCountdown();
    const intervalId = window.setInterval(updateCountdown, 1000);
    return () => window.clearInterval(intervalId);
  }, [holdExpiresAt, isOpen]);

  if (!isOpen) return null;

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const expired = secondsLeft <= 0;
  const file = selectedFile?.bookingId === bookingId ? selectedFile.file : null;
  const paymentOptionId =
    selectedPaymentOption?.bookingId === bookingId
      ? selectedPaymentOption.id
      : "";
  const paymentOptions = paymentOptionsQuery.data ?? [];
  const selectedOption = paymentOptions.find(
    (option) => option.id === paymentOptionId,
  );
  const validationError =
    fileError?.bookingId === bookingId ? fileError.message : "";
  const mutationForBooking = paymentMutation.variables?.bookingId === bookingId;
  const uploaded = paymentMutation.isSuccess && mutationForBooking;
  const uploadError = mutationForBooking ? paymentMutation.error : null;

  const chooseFile = (selected: File | null) => {
    setFileError(null);
    if (!selected) {
      setSelectedFile(null);
      return;
    }
    if (!allowedTypes.includes(selected.type)) {
      setSelectedFile(null);
      setFileError({ bookingId, message: "Pilih file JPEG, PNG, atau WebP." });
      return;
    }
    if (selected.size <= 0 || selected.size > MAX_FILE_SIZE) {
      setSelectedFile(null);
      setFileError({ bookingId, message: "Ukuran file maksimal 3 MB." });
      return;
    }
    setSelectedFile({ bookingId, file: selected });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-background/90 p-4 backdrop-blur-md">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-payment-title"
        className="my-auto flex w-full max-w-xl flex-col gap-5 border-2 border-primary bg-card p-6 shadow-[6px_6px_0px_0px_var(--primary)] sm:p-8"
      >
        <header className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <span
              className={`h-3 w-3 ${uploaded ? "bg-success" : expired ? "bg-subtle" : "animate-pulse bg-destructive"}`}
            />
            <h2
              id="booking-payment-title"
              className="font-heading text-lg font-bold uppercase sm:text-xl"
            >
              {uploaded
                ? "Bukti menunggu verifikasi"
                : expired
                  ? "Waktu pembayaran habis"
                  : "Slot booking terkunci"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        {uploaded ? (
          <div className="space-y-4 py-4 text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-success" />
            <h3 className="font-heading text-2xl font-bold uppercase">
              Bukti berhasil dikirim
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Booking kamu menunggu verifikasi admin. Simpan kode tiket untuk
              referensi.
            </p>
            <p className="border border-border bg-background p-3 font-mono text-sm">
              {ticketCode}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="w-full bg-primary text-primary-foreground px-4 py-3 text-xs font-bold uppercase"
            >
              Selesai
            </button>
          </div>
        ) : expired ? (
          <div className="space-y-4 py-4 text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
            <h3 className="font-heading text-2xl font-bold uppercase">
              Slot tidak lagi terkunci
            </h3>
            <p className="text-sm text-muted-foreground">
              Waktu pembayaran booking sudah berakhir. Silakan buat booking
              baru.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="w-full bg-primary text-primary-foreground px-4 py-3 text-xs font-bold uppercase"
            >
              Kembali
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between border border-border bg-background p-4">
              <div>
                <span className="block text-[11px] font-bold uppercase text-muted-foreground">
                  Sisa waktu pembayaran
                </span>
                <span className="font-heading font-mono text-3xl font-bold text-destructive">
                  {String(minutes).padStart(2, "0")}:
                  {String(seconds).padStart(2, "0")}
                </span>
              </div>
              <Clock3 className="h-6 w-6 text-primary" />
            </div>
            <div className="space-y-2 border border-border bg-background p-4 text-sm">
              <p>
                <span className="text-muted-foreground">Cabang:</span> {branchName}
              </p>
              <p>
                <span className="text-muted-foreground">Jadwal:</span> {datetimeLabel}
              </p>
              <p>
                <span className="text-muted-foreground">Total:</span> Rp{" "}
                {totalPrice.toLocaleString("id-ID")}
              </p>
              <p>
                <span className="text-muted-foreground">Kode booking:</span>{" "}
                {ticketCode}
              </p>
            </div>
            <section className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Pilih metode pembayaran
              </h3>
              {paymentOptionsQuery.isPending ? (
                <p className="text-sm text-muted-foreground">
                  Memuat metode pembayaran…
                </p>
              ) : paymentOptionsQuery.isError ? (
                <p
                  role="alert"
                  className="border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive"
                >
                  Metode pembayaran gagal dimuat:{" "}
                  {paymentOptionsQuery.error.message}
                </p>
              ) : paymentOptions.length === 0 ? (
                <p
                  role="alert"
                  className="border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive"
                >
                  Belum ada metode pembayaran aktif. Silakan hubungi admin
                  sebelum melanjutkan.
                </p>
              ) : (
                <div className="space-y-2">
                  {paymentOptions.map((option) => (
                    <label
                      key={option.id}
                      className={`block cursor-pointer border p-3 ${
                        paymentOptionId === option.id
                          ? "border-primary bg-primary/15"
                          : "border-border bg-background"
                      }`}
                    >
                      <span className="flex items-center gap-2 text-sm font-semibold">
                        <input
                          type="radio"
                          name="payment-option"
                          value={option.id}
                          checked={paymentOptionId === option.id}
                          onChange={() =>
                            setSelectedPaymentOption({
                              bookingId,
                              id: option.id,
                            })
                          }
                        />
                        {option.label}
                      </span>
                      {paymentOptionId === option.id && (
                        <span className="mt-3 block space-y-2 text-sm">
                          {option.method === "BANK_TRANSFER" ? (
                            <>
                              <span className="block">{option.bankName}</span>
                              <span className="block font-mono text-lg">
                                {option.accountNumber}
                              </span>
                              <span className="block text-muted-foreground">
                                a.n. {option.accountHolder}
                              </span>
                            </>
                          ) : option.qrImageUrl ? (
                            <Image
                              src={option.qrImageUrl}
                              alt={`Kode QR ${option.label}`}
                              width={240}
                              height={240}
                              unoptimized
                              className="mx-auto h-56 w-56 bg-white object-contain p-2"
                            />
                          ) : (
                            <span role="alert" className="block text-destructive">
                              Gambar QRIS tidak tersedia. Pilih metode lain atau
                              hubungi admin.
                            </span>
                          )}
                          {option.instructions && (
                            <span className="block whitespace-pre-wrap text-xs text-muted-foreground">
                              {option.instructions}
                            </span>
                          )}
                        </span>
                      )}
                    </label>
                  ))}
                </div>
              )}
            </section>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Bukti pembayaran (JPEG, PNG, WebP · maks. 5 MB)
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) =>
                  chooseFile(event.target.files?.[0] ?? null)
                }
                className="mt-2 w-full border border-border bg-background px-3 py-3 text-sm text-foreground"
              />
              {file && (
                <span className="mt-2 block normal-case text-foreground">
                  {file.name}
                </span>
              )}
            </label>
            {(validationError || uploadError) && (
              <p
                role="alert"
                className="border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive"
              >
                {validationError || uploadError?.message}
              </p>
            )}
            <button
              type="button"
              onClick={() =>
                file &&
                paymentMutation.mutate({
                  bookingId,
                  proof: file,
                  paymentOptionId,
                  accessToken: guestAccessToken,
                })
              }
              disabled={
                !file || !selectedOption || paymentMutation.isPending || expired
              }
              className="flex w-full items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-4 text-xs font-bold uppercase tracking-wider disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Upload className="h-4 w-4" />
              {paymentMutation.isPending
                ? "Mengirim bukti…"
                : "Kirim bukti pembayaran"}
            </button>
          </>
        )}
      </section>
    </div>
  );
}
