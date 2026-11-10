"use client";

import { CreditCard, Armchair, Award } from "lucide-react";
import type { OperationalMetrics } from "./admin-types";

interface MetricCardsProps {
  metrics: OperationalMetrics;
}

export function MetricCards({ metrics }: MetricCardsProps) {
  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID").format(val);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {/* Card 1: Total Booking Hari Ini */}
      <div className="bg-card border border-border p-5 flex flex-col justify-between hover:border-primary hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_var(--primary)] transition-all">
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold">
              TOTAL BOOKING HARI INI
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-heading text-4xl sm:text-5xl font-bold text-foreground">
                {metrics.totalBookingsToday}
              </span>
              <span className="text-xs uppercase text-foreground/80 font-bold">
                RESERVASI
              </span>
            </div>
          </div>
          <span className="px-2 py-0.5 bg-primary/20 border border-primary text-info text-[11px] font-bold">
            +{metrics.growthPercentage}% D-1
          </span>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3 text-xs font-semibold">
          <span className="flex items-center gap-1.5 text-foreground">
            <span className="w-2 h-2 bg-info" /> {metrics.completedCount} Selesai
          </span>
          <span className="flex items-center gap-1.5 text-foreground">
            <span className="w-2 h-2 bg-primary" /> {metrics.inProgressCount} Berjalan
          </span>
          <span className="flex items-center gap-1.5 text-destructive font-bold">
            <span className="w-2 h-2 bg-destructive animate-pulse" /> {metrics.queueCount} Antrean
          </span>
        </div>
      </div>

      {/* Card 2: Estimasi Revenue Hari Ini */}
      <div className="bg-card border border-border p-5 flex flex-col justify-between hover:border-primary hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_var(--primary)] transition-all">
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold">
              ESTIMASI REVENUE HARI INI
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xs text-muted-foreground font-bold">RP</span>
              <span className="font-heading text-3xl sm:text-4xl xl:text-4xl font-bold text-foreground tracking-tight">
                {formatRupiah(metrics.revenueToday)}
              </span>
            </div>
          </div>
          <CreditCard className="w-5 h-5 text-muted-foreground" />
        </div>
        <div className="mt-4 pt-3 border-t border-border flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[11px] font-semibold">
            <span className="text-muted-foreground">
              Target Rp {formatRupiah(metrics.revenueTarget)}
            </span>
            <span className="text-foreground font-bold">
              {metrics.targetAchievedPercent}% TERCAPAI
            </span>
          </div>
          <div className="w-full bg-background h-2 border border-border p-0.5">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${Math.min(100, metrics.targetAchievedPercent)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Card 3: Utilisasi Kursi Real-Time */}
      <div className="bg-card border border-border p-5 flex flex-col justify-between hover:border-primary hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_var(--primary)] transition-all">
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold">
              RATA-RATA UTILISASI KURSI
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="font-heading text-4xl sm:text-5xl font-bold text-foreground">
                {metrics.chairUtilizationPercent}
              </span>
              <span className="font-heading text-xl text-muted-foreground">%</span>
            </div>
          </div>
          <Armchair className="w-5 h-5 text-primary" />
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3 text-[11px] font-semibold">
          <span className="text-muted-foreground">3 CABANG BDG</span>
          <span className="text-foreground font-bold">
            {metrics.activeChairs} DARI {metrics.totalChairs} KURSI AKTIF
          </span>
        </div>
      </div>

      {/* Card 4: VIP & Loyalty Metric */}
      <div className="bg-card border border-border p-5 flex flex-col justify-between hover:border-primary hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_var(--primary)] transition-all">
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold">
              LOYALITAS & VIP AKTIF
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-heading text-4xl sm:text-5xl font-bold text-foreground">
                {metrics.vipVisitsToday}
              </span>
              <span className="text-xs uppercase text-foreground/80 font-bold">
                KUNJUNGAN MEMBER
              </span>
            </div>
          </div>
          <Award className="w-5 h-5 text-destructive" />
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3 text-[11px] font-semibold">
          <span className="text-muted-foreground">POIN TERBIT HARI INI</span>
          <span className="text-info font-bold">
            +{metrics.pointsIssuedToday} PTS KELUAR
          </span>
        </div>
      </div>
    </div>
  );
}
