"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { BranchOption } from "./step-branch";
import { CapsterOption } from "./step-capster";
import { BookingServiceItem } from "./step-services";

interface BookingSummarySlipProps {
  branch?: BranchOption;
  capster?: CapsterOption;
  dateLabel: string;
  timeSlot: string;
  selectedServices: BookingServiceItem[];
  totalDurationMinutes: number;
  onSubmit: () => void;
  isValidToSubmit: boolean;
}

export function BookingSummarySlip({
  branch,
  capster,
  dateLabel,
  timeSlot,
  selectedServices,
  totalDurationMinutes,
  onSubmit,
  isValidToSubmit,
}: BookingSummarySlipProps) {
  const totalPrice = selectedServices.reduce((sum, s) => sum + s.price, 0);

  return (
    <aside className="lg:col-span-4 sticky top-24 flex flex-col gap-4">
      {/* Mechanical Ticket Box */}
      <div className="bg-card border-2 border-primary p-6 flex flex-col gap-4 relative shadow-[4px_4px_0px_0px_var(--primary)]">
        {/* Ticket Header */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <span className="font-heading text-lg font-bold uppercase text-foreground tracking-wide">
              RINGKASAN BOOKING
            </span>
          </div>
        </div>

        {/* Breakdown Items */}
        <div className="flex flex-col gap-3 text-xs">
          {/* Branch */}
          <div className="flex justify-between items-start">
            <span className="text-muted-foreground uppercase font-semibold">
              Cabang:
            </span>
            <span className="text-foreground text-right font-bold uppercase">
              {branch ? `${branch.name} (${branch.city})` : "-"}
            </span>
          </div>

          {/* Capster */}
          <div className="flex justify-between items-start border-t border-border/60 pt-2.5">
            <span className="text-muted-foreground uppercase font-semibold">
              Capster:
            </span>
            <span className="text-foreground text-right font-bold uppercase">
              {capster ? capster.nickname : "-"}
            </span>
          </div>

          {/* Schedule */}
          <div className="flex justify-between items-start border-t border-border/60 pt-2.5">
            <span className="text-muted-foreground uppercase font-semibold">
              Tanggal booking:
            </span>
            <div className="text-right">
              <span className="text-foreground font-bold uppercase block">
                {dateLabel}
              </span>
            </div>
          </div>

          {/* Booking time */}
          <div className="flex justify-between items-start border-t border-border/60 pt-2.5">
            <span className="text-muted-foreground uppercase font-semibold">
              Jam booking:
            </span>
            <div className="text-right">
              <span className="text-foreground font-bold uppercase block">
                {timeSlot}
              </span>
            </div>
          </div>

          {/* Services List */}
          <div className="border-t border-border/60 pt-2.5 flex flex-col gap-1.5">
            <span className="text-muted-foreground uppercase font-semibold">
              Item Layanan ({selectedServices.length}):
            </span>
            <div className="flex flex-col gap-1">
              {selectedServices.length === 0 ? (
                <span className="text-destructive italic">
                  Belum ada layanan dipilih
                </span>
              ) : (
                selectedServices.map((srv) => (
                  <div
                    key={srv.id}
                    className="flex justify-between items-center text-foreground"
                  >
                    <span className="truncate pr-2">• {srv.title}</span>
                    <span className="font-heading font-bold shrink-0">
                      Rp {srv.price.toLocaleString("id-ID")}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Duration */}
          <div className="flex justify-between items-center border-t border-border/60 pt-2.5">
            <span className="text-muted-foreground uppercase font-semibold">
              Estimasi Durasi:
            </span>
            <span className="text-foreground font-bold uppercase">
              {totalDurationMinutes} menit ({selectedServices.length} layanan)
            </span>
          </div>

          {/* Grand Total */}
          <div className="bg-background border border-border p-3.5 flex justify-between items-center mt-1">
            <span className="text-xs uppercase font-bold tracking-wider text-foreground">
              TOTAL BIAYA:
            </span>
            <span className="font-heading text-2xl font-bold text-foreground">
              Rp {totalPrice.toLocaleString("id-ID")}
            </span>
          </div>
        </div>

        {/* Primary CTA Submit Button */}
        <button
          type="button"
          onClick={onSubmit}
          disabled={!isValidToSubmit}
          className="w-full bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider py-4 border border-primary transition-all duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_var(--foreground)] active:translate-x-0.5 active:translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-none flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>KUNCI SLOT & LANJUT PEMBAYARAN</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        {/* Zero Double Booking Guarantee */}
        <div className="flex items-center justify-center gap-2 text-muted-foreground text-[11px] uppercase tracking-wider">
          <span>
            Setelah tombol di klik, lu punya waktu 15 menit buat selesain
            transfer dan upload bukti sebelum slot otomatis dilepas kembali.
          </span>
        </div>
      </div>

      <div className="p-4 bg-card border border-border flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-xs uppercase font-bold text-foreground">
            Butuh Bantuan Booking?
          </span>
          <span className="text-[11px] text-muted-foreground">
            Hubungi WhatsApp admin
          </span>
        </div>
        <Link
          href="https://wa.me/083125271804?text=%27Halo%20min,%20saya%20[nama%20kamu]%20izin%20bertanya%27"
          className="border border-border bg-background px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-foreground transition-colors hover:border-primary"
        >
          Hubungi admin
        </Link>
      </div>
    </aside>
  );
}
