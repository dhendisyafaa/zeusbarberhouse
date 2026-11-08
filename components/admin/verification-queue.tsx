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
    <div className="min-w-0 bg-[#1A1A1D] border border-[#27272A] p-3 sm:p-5 flex flex-col justify-between">
      <div>
        {actionError ? <p role="alert" className="mb-3 text-sm text-red-300">{actionError}</p> : null}
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#27272A] gap-2">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-[#FF2A2A] animate-pulse" />
              <span className="text-[11px] uppercase text-[#A1A1AA] tracking-wider font-bold">
                KONSOL PEMBAYARAN MANUAL
              </span>
            </div>
            <span className="break-words font-heading text-base text-[#FAFAFA] uppercase font-bold sm:text-lg">
              Antrean Verifikasi Bukti Transfer
            </span>
          </div>
          <span className="px-2 py-1 bg-[#09090B] border border-[#27272A] text-[#FF2A2A] text-xs font-bold uppercase tracking-wider self-start sm:self-auto">
            {bookings.length} Menunggu Tindakan
          </span>
        </div>

        {/* Verification Cards Queue */}
        <div className="mt-4 flex flex-col gap-3">
          {bookings.length === 0 ? (
            <div className="p-8 text-center border border-[#27272A] bg-[#09090B] flex flex-col items-center justify-center">
              <CheckCircle className="w-8 h-8 text-[#B6C4FF] mb-2" />
              <span className="text-sm font-semibold text-[#FAFAFA] uppercase">
                Semua Antrean Telah Bersih
              </span>
              <span className="text-xs text-[#A1A1AA] mt-1">
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
                  className={`p-4 bg-[#09090B] border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-[#0033A0] ${
                    isUrgent ? "border-2 border-[#FF2A2A]/80 shadow-[0_0_12px_rgba(255,42,42,0.15)]" : "border-[#27272A]"
                  }`}
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="w-10 h-10 bg-[#1A1A1D] border border-[#27272A] flex items-center justify-center shrink-0">
                      {isBca ? (
                        <Landmark className="w-5 h-5 text-[#0033A0]" />
                      ) : isQris ? (
                        <QrCode className="w-5 h-5 text-[#B6C4FF]" />
                      ) : (
                        <Clock className="w-5 h-5 text-[#FF2A2A]" />
                      )}
                    </div>

                    <div className="flex min-w-0 flex-col">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-[#FAFAFA]">
                          #ZEUS-BKG-{booking.id.slice(0, 6).toUpperCase()}
                        </span>
                        <span className="px-1.5 py-0.5 bg-[#0033A0] text-[#FAFAFA] text-[10px] font-bold uppercase">
                          {booking.branch?.name || "Cabang tidak tersedia"}
                        </span>
                        <span className="text-[#A1A1AA] text-xs">
                          Capster: {booking.barber?.name || "Tidak ditentukan"}
                        </span>
                      </div>

                      <div className="mt-1 flex flex-wrap items-baseline gap-2">
                        <span className="font-heading text-base font-bold text-[#FAFAFA]">
                          {booking.customer?.name || booking.guestName || "Pelanggan tamu"}
                        </span>
                        <span className="text-xs text-[#B6C4FF] font-bold font-mono">
                          Rp {formatRupiah(totalAmount)}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 mt-1.5 text-xs text-[#A1A1AA]">
                        <button
                          type="button"
                          onClick={() => onOpenReceipt(booking)}
                          className="text-[#B6C4FF] hover:underline flex items-center gap-1 font-semibold"
                        >
                          <Paperclip className="w-3.5 h-3.5" />
                          {latestPayment?.proofStoragePath
                            ? latestPayment.proofStoragePath.split("/").pop()
                            : "Bukti belum tersedia"}
                        </button>
                        <span className="text-[#52525B]">|</span>
                        <span
                          className={`flex items-center gap-1 font-mono font-bold ${
                            isUrgent ? "text-[#FF2A2A] animate-pulse" : "text-[#A1A1AA]"
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
                      className="px-3.5 py-2 bg-[#0033A0] hover:bg-[#00277F] disabled:opacity-50 text-[#FAFAFA] text-xs font-bold uppercase tracking-wider transition-all border border-[#0033A0] flex items-center gap-1.5"
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
                      className="px-3.5 py-2 bg-[#09090B] hover:bg-[#FF2A2A] hover:text-[#FAFAFA] disabled:opacity-50 text-[#FF2A2A] text-xs font-bold uppercase tracking-wider transition-all border border-[#FF2A2A] flex items-center gap-1.5"
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
