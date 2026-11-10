"use client";

import { Scissors, Coffee, Check, Clock } from "lucide-react";
import type { CapsterDutyItem } from "./admin-types";

interface CapsterDutyGridProps {
  roster: CapsterDutyItem[];
}

export function CapsterDutyGrid({ roster }: CapsterDutyGridProps) {
  return (
    <div className="flex min-w-0 flex-col justify-between border border-border bg-card p-3 sm:p-5" id="roster-section">
      <div>
        {/* Header */}
        <div className="flex min-w-0 flex-col justify-between gap-3 border-b border-border pb-4 sm:flex-row sm:items-start">
          <div className="flex min-w-0 flex-col gap-1">
            <div className="flex min-w-0 items-start gap-2">
              <span className="mt-1 h-2.5 w-2.5 shrink-0 bg-primary" />
              <span className="break-words text-[10px] font-bold uppercase tracking-wider text-muted-foreground sm:text-[11px]">
                DISTRIBUSI OPERASIONAL CAPSTER
              </span>
            </div>
            <span className="break-words font-heading text-base font-bold uppercase text-foreground sm:text-lg">
              Status Kursi &amp; Capster Real-Time
            </span>
          </div>
          <span className="w-fit max-w-full break-words border border-border bg-background px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-info sm:text-xs">
            {roster.filter((item) => item.status === "IN_SERVICE").length} MELAYANI / {roster.length} CAPSTER
          </span>
        </div>

        {/* Duty Cards Grid */}
        {roster.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Belum ada data capster untuk cabang ini.</p>
        ) : <div className="mt-4 grid min-w-0 grid-cols-1 gap-3 2xl:grid-cols-2">
          {roster.map((capster) => {
            const isInService = capster.status === "IN_SERVICE";
            const isAvailable = capster.status === "AVAILABLE";

            return (
              <div
                key={capster.id}
                className={`flex min-w-0 flex-col justify-between border bg-background p-3 transition-all sm:p-4 ${
                  isInService
                    ? "border-primary shadow-[2px_2px_0px_0px_var(--primary)]"
                    : isAvailable
                    ? "border-border hover:border-foreground"
                    : "border-border opacity-80"
                }`}
              >
                <div>
                  {/* Top line: Name & Chair */}
                  <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex min-w-0 flex-col">
                      <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                        <span className="break-words font-heading text-base font-bold uppercase text-foreground">
                          {capster.name}
                        </span>
                        <span className="w-fit shrink-0 bg-muted px-1 text-[10px] font-mono font-bold text-muted-foreground">
                          {capster.branchCode}
                        </span>
                      </div>
                      <span className="break-words text-xs font-medium text-muted-foreground">
                        {capster.branch} â€¢ {capster.chairNo}
                      </span>
                    </div>

                    {/* Status Badge */}
                    <span
                      className={`flex w-fit max-w-full shrink-0 items-center gap-1 border px-2 py-0.5 text-[10px] font-bold uppercase ${
                        isInService
                          ? "bg-primary/20 border-primary text-info"
                          : isAvailable
                          ? "bg-card border-foreground text-foreground"
                          : "bg-destructive/20 border-destructive text-destructive"
                      }`}
                    >
                      {isInService ? (
                        <>
                          <Scissors className="w-3 h-3 text-info" />
                          IN SERVICE
                        </>
                      ) : isAvailable ? (
                        <>
                          <Check className="w-3 h-3 text-foreground" />
                          AVAILABLE
                        </>
                      ) : (
                        <>
                          <Coffee className="w-3 h-3 text-destructive" />
                          BREAK
                        </>
                      )}
                    </span>
                  </div>

                  {/* Active Job Description */}
                  <div className="mt-3 p-2.5 bg-card border border-border flex flex-col gap-1">
                    <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-start gap-2 text-xs">
                      <span className="break-words font-semibold text-muted-foreground">
                        {isInService ? "Pelanggan Saat Ini:" : "Kondisi Kursi:"}
                      </span>
                      <span className="break-words text-right font-bold text-foreground">
                        {capster.customerName}
                      </span>
                    </div>
                    <span className="break-words text-xs font-medium text-info">
                      {capster.serviceName}
                    </span>

                    {/* Progress Bar for Active Cut */}
                    {isInService && (
                      <div className="mt-1.5 flex flex-col gap-1">
                        <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 text-[10px] font-mono text-muted-foreground">
                          <span>Mulai {capster.startTime}</span>
                          <span>Est. Selesai {capster.estimatedFinish}</span>
                        </div>
                        <div className="w-full bg-background h-1.5 border border-border p-0.5">
                          <div
                            className="h-full bg-primary"
                            style={{ width: `${capster.progressPercent}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom line: Today's cuts */}
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-2.5 text-xs text-muted-foreground">
                  <span className="flex min-w-0 items-center gap-1 text-[11px]">
                    <Clock className="h-3.5 w-3.5 shrink-0" />
                    {isInService
                      ? `${capster.elapsedMinutes} / ${capster.totalMinutes} menit`
                      : "Jadwal hari ini"}
                  </span>
                  <span className="break-words text-right font-bold text-foreground">
                    {capster.todayCuts} Potong Hari Ini
                  </span>
                </div>
              </div>
            );
          })}
        </div>}
      </div>
    </div>
  );
}
