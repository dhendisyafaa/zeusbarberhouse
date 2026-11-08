"use client";

import type { WeeklyTrendItem } from "./admin-types";

interface RevenueTrendChartProps {
  trends?: WeeklyTrendItem[];
}

export function RevenueTrendChart({ trends = [] }: RevenueTrendChartProps) {
  const maxRevenue = Math.max(0, ...trends.map((trend) => trend.revenue));

  return (
    <div className="flex flex-col justify-between border border-[#27272A] bg-[#1A1A1D] p-5">
      <div className="flex flex-col gap-2 border-b border-[#27272A] pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 bg-[#0033A0]" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#A1A1AA]">
              Diagnostik mingguan
            </span>
          </div>
          <h2 className="font-heading text-lg font-bold uppercase text-[#FAFAFA]">
            Tren reservasi dan revenue harian
          </h2>
        </div>
        <span className="text-xs font-semibold text-[#A1A1AA]">
          7 hari terakhir · revenue dan jumlah booking
        </span>
      </div>

      {trends.length === 0 ? (
        <p className="py-12 text-center text-sm text-[#A1A1AA]">
          Belum ada data tren untuk periode ini.
        </p>
      ) : (
        <div
          className="grid min-h-64 grid-cols-2 items-end gap-3 pt-5 sm:grid-cols-4 lg:grid-cols-7"
          role="img"
          aria-label="Grafik revenue dan jumlah booking selama tujuh hari terakhir"
        >
          {trends.map((trend) => {
            const height = maxRevenue > 0
              ? Math.max(4, (trend.revenue / maxRevenue) * 100)
              : 4;

            return (
              <div key={trend.day} className="flex h-full min-w-0 flex-col items-center justify-end gap-2">
                <div className="flex h-40 w-full items-end justify-center border-b border-[#444653]">
                  <div
                    className="w-5/6 border-t-2 border-[#B6C4FF] bg-[#0033A0]"
                    style={{ height: `${height}%` }}
                    title={`${trend.day}: Rp ${trend.revenue.toLocaleString("id-ID")}`}
                  />
                </div>
                <span className="text-center text-[10px] font-bold uppercase text-[#D4D4D8]">
                  {trend.day}
                </span>
                <span className="text-center text-[10px] text-[#A1A1AA]">
                  {trend.bookings} booking
                </span>
                <span className="text-center text-[10px] text-[#A1A1AA]">
                  Rp {trend.revenue.toLocaleString("id-ID")}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
