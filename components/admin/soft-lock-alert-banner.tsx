"use client";

import { AlertTriangle, CheckCircle } from "lucide-react";

interface SoftLockAlertBannerProps {
  unverifiedCount: number;
  onScrollToQueue?: () => void;
}

export function SoftLockAlertBanner({
  unverifiedCount = 0,
  onScrollToQueue,
}: SoftLockAlertBannerProps) {
  if (unverifiedCount < 1) return null;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onScrollToQueue) {
      onScrollToQueue();
    } else {
      const el = document.getElementById("verifikasi-section");
      el?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="w-full bg-card border-l-4 border-destructive border-y border-r border-border p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-destructive/20 border border-destructive flex items-center justify-center shrink-0">
          <AlertTriangle className="w-5 h-5 text-destructive" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-[11px] uppercase text-destructive font-bold tracking-wider">
              ANTREAN VERIFIKASI PEMBAYARAN
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-destructive animate-ping" />
          </div>
          <span className="font-heading text-lg text-foreground uppercase tracking-tight font-bold">
            {unverifiedCount} bukti pembayaran menunggu persetujuan admin
          </span>
          <span className="text-xs text-muted-foreground">
            Tinjau bukti yang benar-benar diunggah sebelum mengonfirmasi booking.
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <a
          href="#verifikasi-section"
          onClick={handleClick}
          className="px-4 py-2 bg-primary hover:bg-primary-hover text-primary-foreground text-xs uppercase font-bold tracking-wider transition-all border border-primary hover:shadow-[3px_3px_0px_0px_var(--foreground)] flex items-center gap-1.5"
        >
          <CheckCircle className="w-4 h-4" />
          Periksa Antrean Sekarang
        </a>
      </div>
    </div>
  );
}
