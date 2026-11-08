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
      <div className="bg-[#1A1A1D] border border-[#27272A] p-5 flex flex-col justify-between hover:border-[#0033A0] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_#0033A0] transition-all">
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <span className="text-[11px] uppercase tracking-wider text-[#A1A1AA] font-bold">
              TOTAL BOOKING HARI INI
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-heading text-4xl sm:text-5xl font-bold text-[#FAFAFA]">
                {metrics.totalBookingsToday}
              </span>
              <span className="text-xs uppercase text-[#FAFAFA]/80 font-bold">
                RESERVASI
              </span>
            </div>
          </div>
          <span className="px-2 py-0.5 bg-[#0033A0]/20 border border-[#0033A0] text-[#B6C4FF] text-[11px] font-bold">
            +{metrics.growthPercentage}% D-1
          </span>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[#27272A] pt-3 text-xs font-semibold">
          <span className="flex items-center gap-1.5 text-[#FAFAFA]">
            <span className="w-2 h-2 bg-[#B6C4FF]" /> {metrics.completedCount} Selesai
          </span>
          <span className="flex items-center gap-1.5 text-[#FAFAFA]">
            <span className="w-2 h-2 bg-[#0033A0]" /> {metrics.inProgressCount} Berjalan
          </span>
          <span className="flex items-center gap-1.5 text-[#FF2A2A] font-bold">
            <span className="w-2 h-2 bg-[#FF2A2A] animate-pulse" /> {metrics.queueCount} Antrean
          </span>
        </div>
      </div>

      {/* Card 2: Estimasi Revenue Hari Ini */}
      <div className="bg-[#1A1A1D] border border-[#27272A] p-5 flex flex-col justify-between hover:border-[#0033A0] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_#0033A0] transition-all">
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <span className="text-[11px] uppercase tracking-wider text-[#A1A1AA] font-bold">
              ESTIMASI REVENUE HARI INI
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xs text-[#A1A1AA] font-bold">RP</span>
              <span className="font-heading text-3xl sm:text-4xl xl:text-4xl font-bold text-[#FAFAFA] tracking-tight">
                {formatRupiah(metrics.revenueToday)}
              </span>
            </div>
          </div>
          <CreditCard className="w-5 h-5 text-[#A1A1AA]" />
        </div>
        <div className="mt-4 pt-3 border-t border-[#27272A] flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[11px] font-semibold">
            <span className="text-[#A1A1AA]">
              Target Rp {formatRupiah(metrics.revenueTarget)}
            </span>
            <span className="text-[#FAFAFA] font-bold">
              {metrics.targetAchievedPercent}% TERCAPAI
            </span>
          </div>
          <div className="w-full bg-[#09090B] h-2 border border-[#27272A] p-0.5">
            <div
              className="h-full bg-[#0033A0] transition-all duration-500"
              style={{ width: `${Math.min(100, metrics.targetAchievedPercent)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Card 3: Utilisasi Kursi Real-Time */}
      <div className="bg-[#1A1A1D] border border-[#27272A] p-5 flex flex-col justify-between hover:border-[#0033A0] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_#0033A0] transition-all">
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <span className="text-[11px] uppercase tracking-wider text-[#A1A1AA] font-bold">
              RATA-RATA UTILISASI KURSI
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="font-heading text-4xl sm:text-5xl font-bold text-[#FAFAFA]">
                {metrics.chairUtilizationPercent}
              </span>
              <span className="font-heading text-xl text-[#A1A1AA]">%</span>
            </div>
          </div>
          <Armchair className="w-5 h-5 text-[#0033A0]" />
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[#27272A] pt-3 text-[11px] font-semibold">
          <span className="text-[#A1A1AA]">3 CABANG BDG</span>
          <span className="text-[#FAFAFA] font-bold">
            {metrics.activeChairs} DARI {metrics.totalChairs} KURSI AKTIF
          </span>
        </div>
      </div>

      {/* Card 4: VIP & Loyalty Metric */}
      <div className="bg-[#1A1A1D] border border-[#27272A] p-5 flex flex-col justify-between hover:border-[#0033A0] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_#0033A0] transition-all">
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <span className="text-[11px] uppercase tracking-wider text-[#A1A1AA] font-bold">
              LOYALITAS & VIP AKTIF
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-heading text-4xl sm:text-5xl font-bold text-[#FAFAFA]">
                {metrics.vipVisitsToday}
              </span>
              <span className="text-xs uppercase text-[#FAFAFA]/80 font-bold">
                KUNJUNGAN MEMBER
              </span>
            </div>
          </div>
          <Award className="w-5 h-5 text-[#FF2A2A]" />
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[#27272A] pt-3 text-[11px] font-semibold">
          <span className="text-[#A1A1AA]">POIN TERBIT HARI INI</span>
          <span className="text-[#B6C4FF] font-bold">
            +{metrics.pointsIssuedToday} PTS KELUAR
          </span>
        </div>
      </div>
    </div>
  );
}
