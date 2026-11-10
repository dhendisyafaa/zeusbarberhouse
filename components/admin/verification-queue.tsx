"use client";

import { useState, useEffect } from "react";
import {
  Landmark,
  QrCode,
  Paperclip,
  Timer,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
} from "lucide-react";
import type { AdminBookingItem } from "./admin-types";

interface VerificationQueueProps {
  bookings: AdminBookingItem[];
  onOpenReceipt: (booking: AdminBookingItem) => void;
  onApprove: (bookingId: string) => Promise<boolean>;
  onReject: (bookingId: string) => Promise<boolean>;
  isLoading?: boolean;
}

export function VerificationQueue({
  bookings,
  onOpenReceipt,
  onApprove,
  onReject,
  isLoading = false,
}: VerificationQueueProps) {
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(() => Date.now());
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 30_000);
    return () => clearInterval(interval);
  }, []);

  const formatElapsed = (startedAt?: string | null) => {
    if (!startedAt) return "WAKTU TIDAK TERSEDIA";
    const seconds = Math.max(0, Math.floor((currentTime - new Date(startedAt).getTime()) / 1000));
    const minutes = Math.floor(seconds / 60);
    return `${minutes} MENIT MENUNGGU`;
  };

  const handleApprove = async (id: string) => {
    setActionError("");
    setProcessingId(id);
    try {
      if (!await onApprove(id)) setActionError("Pembayaran gagal diverifikasi. Periksa pesan di dashboard lalu coba lagi.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    setActionError("");
    setProcessingId(id);
    try {
      if (!await onReject(id)) setActionError("Bukti pembayaran gagal ditolak. Periksa pesan di dashboard lalu coba lagi.");
    } finally {
      setProcessingId(null);
    }
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID").format(val);
  };

  return (
    <div className="min-w-0 bg-card border border-border p-3 sm:p-5 flex flex-col justify-between">
      <div>
        {actionError ? <p role="alert" className="mb-3 text-sm text-destructive">{actionError}</p> : null}
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-border gap-2">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-destructive animate-pulse" />
              <span className="text-[11px] uppercase text-muted-foreground tracking-wider font-bold">
                KONSOL PEMBAYARAN MANUAL
              </span>
            </div>
            <span className="break-words font-heading text-base text-foreground uppercase font-bold sm:text-lg">
              Antrean Verifikasi Bukti Transfer
            </span>
          </div>
          <span className="px-2 py-1 bg-background border border-border text-destructive text-xs font-bold uppercase tracking-wider self-start sm:self-auto">
            {bookings.length} Menunggu Tindakan
          </span>
        </div>

        {/* Verification Cards Queue */}
        <div className="mt-4 flex flex-col gap-3">
          {bookings.length === 0 ? (
            <div className="p-8 text-center border border-border bg-background flex flex-col items-center justify-center">
              <CheckCircle className="w-8 h-8 text-info mb-2" />
              <span className="text-sm font-semibold text-foreground uppercase">
                Semua Antrean Telah Bersih
              </span>
              <span className="text-xs text-muted-foreground mt-1">
                Tidak ada bukti transfer manual yang sedang menunggu verifikasi admin.
              </span>
            </div>
          ) : (
            bookings.map((booking) => {
              const totalAmount =
                booking.transaction?.totalAmountRupiah ??
                booking.items.reduce(
                  (sum, it) => sum + (it.unitPriceRupiahSnapshot || 0),
                  0,
                );
              const payments = booking.transaction?.payments || [];
              const latestPayment = payments[0];
              const isBca = latestPayment?.method === "BANK_TRANSFER";
              const isQris = latestPayment?.method === "QRIS";
              const waitingFrom = latestPayment?.proofUploadedAt ?? booking.createdAt;
              const waitingMinutes = Math.max(
                0,
                Math.floor((currentTime - new Date(waitingFrom).getTime()) / 60_000),
              );
              const isUrgent = waitingMinutes >= 10;
              const isBusy = processingId === booking.id || isLoading;

              return (
                <div
                  key={booking.id}
                  className={`p-4 bg-background border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-primary ${
                    isUrgent ? "border-2 border-destructive/80 shadow-[0_0_12px_rgba(255,42,42,0.15)]" : "border-border"
                  }`}
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="w-10 h-10 bg-card border border-border flex items-center justify-center shrink-0">
                      {isBca ? (
                        <Landmark className="w-5 h-5 text-primary" />
                      ) : isQris ? (
                        <QrCode className="w-5 h-5 text-info" />
                      ) : (
                        <Clock className="w-5 h-5 text-destructive" />
                      )}
                    </div>

                    <div className="flex min-w-0 flex-col">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-foreground">
                          #ZEUS-BKG-{booking.id.slice(0, 6).toUpperCase()}
                        </span>
                        <span className="px-1.5 py-0.5 bg-primary text-primary-foreground text-[10px] font-bold uppercase">
                          {booking.branch?.name || "Cabang tidak tersedia"}
                        </span>
                        <span className="text-muted-foreground text-xs">
                          Capster: {booking.barber?.name || "Tidak ditentukan"}
                        </span>
                      </div>

                      <div className="mt-1 flex flex-wrap items-baseline gap-2">
                        <span className="font-heading text-base font-bold text-foreground">
                          {booking.customer?.name || booking.guestName || "Pelanggan tamu"}
                        </span>
                        <span className="text-xs text-info font-bold font-mono">
                          Rp {formatRupiah(totalAmount)}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                        <button
                          type="button"
                          onClick={() => onOpenReceipt(booking)}
                          className="text-info hover:underline flex items-center gap-1 font-semibold"
                        >
                          <Paperclip className="w-3.5 h-3.5" />
                          {latestPayment?.proofStoragePath
                            ? latestPayment.proofStoragePath.split("/").pop()
                            : "Bukti belum tersedia"}
                        </button>
                        <span className="text-subtle">|</span>
                        <span
                          className={`flex items-center gap-1 font-mono font-bold ${
                            isUrgent ? "text-destructive animate-pulse" : "text-muted-foreground"
                          }`}
                        >
                          <Timer className="w-3.5 h-3.5" />
                          {formatElapsed(waitingFrom)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 self-end md:self-center">
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => handleApprove(booking.id)}
                      className="px-3.5 py-2 bg-primary hover:bg-primary-hover disabled:opacity-50 text-primary-foreground text-xs font-bold uppercase tracking-wider transition-all border border-primary flex items-center gap-1.5"
                    >
                      {isBusy ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <CheckCircle className="w-3.5 h-3.5" />
                      )}
                      SETUJUI
                    </button>
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => handleReject(booking.id)}
                      className="px-3.5 py-2 bg-background hover:bg-destructive hover:text-destructive-foreground disabled:opacity-50 text-destructive text-xs font-bold uppercase tracking-wider transition-all border border-destructive flex items-center gap-1.5"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      TOLAK
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
