"use client";

import type { ServiceDistributionItem } from "./admin-types";

interface ServiceDistributionChartProps {
  totalOrders?: number;
  distribution?: ServiceDistributionItem[];
}

export function ServiceDistributionChart({
  totalOrders = 0,
  distribution = [],
}: ServiceDistributionChartProps) {
  const circumference = 2 * Math.PI * 38;
  const segments = distribution.reduce<{
    item: ServiceDistributionItem;
    length: number;
    offset: number;
  }[]>((current, item) => {
    const previous = current[current.length - 1];
    const length = circumference * (item.percentage / 100);
    return [
      ...current,
      { item, length, offset: previous ? previous.offset + previous.length : 0 },
    ];
  }, []);
  const formatPrice = (val: number) => {
    return `Rp ${Math.round(val / 1000)}K`;
  };

  return (
    <div className="bg-card border border-border p-5 flex flex-col justify-between">
      {/* Header */}
      <div className="pb-3 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-destructive" />
          <span className="text-[11px] uppercase text-muted-foreground tracking-wider font-bold">
            PORSI PENJUALAN
          </span>
        </div>
        <span className="font-heading text-lg text-foreground uppercase font-bold">
          Distribusi Paket Layanan (Minggu Ini)
        </span>
      </div>

      {/* SVG Donut Chart */}
      <div className="py-4 flex items-center justify-center">
        <div className="relative w-44 h-44">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            {/* Background Ring */}
            <circle
              cx="50"
              cy="50"
              fill="transparent"
              r="38"
              stroke="var(--border)"
              strokeWidth="12"
            />
            {segments.map(({ item, length, offset }) => (
                <circle
                  key={item.id}
                  cx="50"
                  cy="50"
                  fill="transparent"
                  r="38"
                  stroke={item.color}
                  strokeDasharray={`${length} ${circumference - length}`}
                  strokeDashoffset={-offset}
                  strokeWidth="12"
                />
              ))}
          </svg>

          {/* Center Metric */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="font-heading text-2xl font-bold text-foreground leading-none">
              {totalOrders}
            </span>
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mt-1">
              TOTAL ORDER
            </span>
          </div>
        </div>
      </div>

      {/* Legend Breakdown List */}
      <div className="space-y-2 border-t border-border pt-3">
        {distribution.length === 0 ? (
          <p className="text-center text-xs text-muted-foreground">Belum ada data layanan.</p>
        ) : distribution.map((item) => (
          <div key={item.id} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 truncate">
              <span
                className="w-3 h-3 shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-foreground font-medium truncate">
                {item.name}
              </span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-muted-foreground font-mono">{item.percentage}%</span>
              <span className="text-foreground font-bold">
                {formatPrice(item.priceRupiah)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
