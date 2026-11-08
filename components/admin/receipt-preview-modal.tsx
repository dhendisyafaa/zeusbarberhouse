"use client";

import Image from "next/image";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { X, CheckCircle, XCircle, FileText, User, CreditCard, Clock } from "lucide-react";
import type { AdminBookingItem } from "./admin-types";
import { adminQueryKeys, fetchAdminPaymentProof } from "@/lib/admin/queries";

interface ReceiptPreviewModalProps {
  booking: AdminBookingItem | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (bookingId: string) => Promise<boolean>;
  onReject: (bookingId: string) => Promise<boolean>;
}

export function ReceiptPreviewModal({
  booking,
  isOpen,
  onClose,
  onApprove,
  onReject,
}: ReceiptPreviewModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const bookingId = booking?.id;
  const hasProofPath = Boolean(
    booking?.transaction?.payments?.some((payment) => payment.proofStoragePath),
  );
  const proofQuery = useQuery({
    queryKey: adminQueryKeys.paymentProof(bookingId || ""),
    queryFn: () => {
      if (!bookingId) throw new Error("Booking ID is required to load payment proof.");
      return fetchAdminPaymentProof(bookingId);
    },
    enabled: Boolean(isOpen && bookingId && hasProofPath),
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: "always",
  });
  const proofUrl = proofQuery.data?.url ?? null;
  const proofError = proofQuery.error instanceof Error ? proofQuery.error.message : "";
  const isLoadingProof = Boolean(
    isOpen && hasProofPath && (proofQuery.isPending || proofQuery.isFetching),
  );

  if (!isOpen || !booking) return null;

  const totalAmount =
    booking.transaction?.totalAmountRupiah ??
    booking.items.reduce(
      (sum, it) => sum + (it.unitPriceRupiahSnapshot || 0),
      0,
    );

  const payment = booking.transaction?.payments?.[0];
  const customerName = booking.customer?.name || booking.guestName || "Pelanggan tamu";
  const customerPhone = booking.customer?.phone || booking.guestPhone || "—";
  const paymentMethod = payment?.method || "Tidak tersedia";

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID").format(val);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-[#1A1A1D] border-2 border-[#0033A0] shadow-[8px_8px_0px_0px_#09090B] flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#09090B] border-b border-[#27272A] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 bg-[#0033A0]" />
            <div className="flex flex-col">
              <span className="text-[10px] text-[#A1A1AA] uppercase tracking-wider font-bold">
                AUDIT DOKUMEN PEMBAYARAN MANUAL
              </span>
              <span className="font-heading text-lg font-bold text-[#FAFAFA] uppercase">
                Verifikasi Bukti Transfer #{booking.id.slice(0, 8).toUpperCase()}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup dialog"
            className="w-8 h-8 flex items-center justify-center border border-[#27272A] bg-[#1A1A1D] text-[#A1A1AA] hover:text-[#FAFAFA] hover:border-[#FF2A2A] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Column: Booking & Transfer Data */}
          <div className="md:col-span-5 flex flex-col gap-4">
            <div className="p-4 bg-[#09090B] border border-[#27272A] flex flex-col gap-3">
              <span className="text-[11px] uppercase text-[#A1A1AA] font-bold tracking-wider border-b border-[#27272A] pb-2">
                DETAIL TRANSAKSI
              </span>

              <div className="flex items-start gap-2.5">
                <User className="w-4 h-4 text-[#A1A1AA] shrink-0 mt-0.5" />
                <div className="flex flex-col">
                  <span className="text-[10px] text-[#A1A1AA] uppercase">Nama Pelanggan</span>
                  <span className="text-sm font-bold text-[#FAFAFA]">{customerName}</span>
                  <span className="text-xs text-[#A1A1AA]">{customerPhone}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <CreditCard className="w-4 h-4 text-[#0033A0] shrink-0 mt-0.5" />
                <div className="flex flex-col">
                  <span className="text-[10px] text-[#A1A1AA] uppercase">Nominal Ditransfer</span>
                  <span className="text-base font-bold text-[#B6C4FF] font-mono">
                    Rp {formatRupiah(totalAmount)}
                  </span>
                  <span className="text-[11px] text-[#A1A1AA] font-medium">{paymentMethod}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-[#A1A1AA] shrink-0 mt-0.5" />
                <div className="flex flex-col">
                  <span className="text-[10px] text-[#A1A1AA] uppercase">Waktu Pengajuan</span>
                  <span className="text-xs text-[#FAFAFA] font-mono">
                    {new Date(booking.createdAt).toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    WIB
                  </span>
                </div>
              </div>
            </div>

            {/* Services in this booking */}
            <div className="p-4 bg-[#09090B] border border-[#27272A] flex flex-col gap-2">
              <span className="text-[11px] uppercase text-[#A1A1AA] font-bold tracking-wider">
                LAYANAN DIPILIH
              </span>
              <div className="flex flex-col gap-1.5">
                {booking.items.map((it, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <span className="text-[#FAFAFA]">{it.serviceNameSnapshot}</span>
                    <span className="text-[#A1A1AA] font-mono font-bold">
                      Rp {formatRupiah(it.unitPriceRupiahSnapshot)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Receipt Image Preview */}
          <div className="md:col-span-7 flex flex-col">
            <span className="text-[11px] uppercase text-[#A1A1AA] font-bold tracking-wider mb-2">
              PRATINJAU BUKTI PEMBAYARAN ASLI
            </span>
            <div className="w-full h-80 bg-[#09090B] border-2 border-dashed border-[#27272A] p-4 flex flex-col items-center justify-center relative overflow-hidden group">
              {proofUrl ? (
                <Image
                  src={proofUrl}
                  alt="Bukti pembayaran yang diunggah"
                  fill
                  unoptimized
                  className="object-contain p-3"
                />
              ) : (
                <div className="flex max-w-sm flex-col items-center gap-2 text-center">
                  <FileText className="h-8 w-8 text-[#A1A1AA]" />
                  <span className="text-sm font-semibold text-[#FAFAFA]">
                    {isLoadingProof ? "Memuat bukti pembayaran..." : "Bukti pembayaran tidak tersedia"}
                  </span>
                  {proofError ? <span role="alert" className="text-xs text-red-300">{proofError}</span> : null}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="px-6 py-4 bg-[#09090B] border-t border-[#27272A] flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-[#A1A1AA] font-medium">
            Memverifikasi akan memperbarui status booking menjadi <b className="text-[#FAFAFA]">CONFIRMED</b> dan membuka transaksi sebagai <b className="text-[#FAFAFA]">PAID</b>.
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={async () => {
                setIsSubmitting(true);
                const succeeded = await onReject(booking.id);
                setIsSubmitting(false);
                if (succeeded) onClose();
              }}
              disabled={isSubmitting}
              className="px-4 py-2 bg-[#09090B] hover:bg-[#FF2A2A] text-[#FF2A2A] hover:text-[#FAFAFA] text-xs font-bold uppercase tracking-wider transition-all border border-[#FF2A2A] flex items-center gap-1.5"
            >
              <XCircle className="w-4 h-4" />
              TOLAK BUKTI
            </button>
            <button
              type="button"
              onClick={async () => {
                setIsSubmitting(true);
                const succeeded = await onApprove(booking.id);
                setIsSubmitting(false);
                if (succeeded) onClose();
              }}
              disabled={isSubmitting || !proofUrl || isLoadingProof}
              className="px-5 py-2 bg-[#0033A0] hover:bg-[#00277F] text-[#FAFAFA] text-xs font-bold uppercase tracking-wider transition-all border border-[#0033A0] flex items-center gap-1.5 hover:shadow-[3px_3px_0px_0px_#FAFAFA]"
            >
              <CheckCircle className="w-4 h-4" />
              SETUJUI PEMBAYARAN
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
