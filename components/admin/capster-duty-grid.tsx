"use client";

import { Scissors, Coffee, Check, Clock } from "lucide-react";
import type { CapsterDutyItem } from "./admin-types";

interface CapsterDutyGridProps {
  roster: CapsterDutyItem[];
}

export function CapsterDutyGrid({ roster }: CapsterDutyGridProps) {
  return (
    <div className="flex min-w-0 flex-col justify-between border border-[#27272A] bg-[#1A1A1D] p-3 sm:p-5" id="roster-section">
      <div>
        {/* Header */}
        <div className="flex min-w-0 flex-col justify-between gap-3 border-b border-[#27272A] pb-4 sm:flex-row sm:items-start">
          <div className="flex min-w-0 flex-col gap-1">
            <div className="flex min-w-0 items-start gap-2">
              <span className="mt-1 h-2.5 w-2.5 shrink-0 bg-[#0033A0]" />
              <span className="break-words text-[10px] font-bold uppercase tracking-wider text-[#A1A1AA] sm:text-[11px]">
                DISTRIBUSI OPERASIONAL CAPSTER
              </span>
            </div>
            <span className="break-words font-heading text-base font-bold uppercase text-[#FAFAFA] sm:text-lg">
              Status Kursi &amp; Capster Real-Time
            </span>
          </div>
          <span className="w-fit max-w-full break-words border border-[#27272A] bg-[#09090B] px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#B6C4FF] sm:text-xs">
            {roster.filter((item) => item.status === "IN_SERVICE").length} MELAYANI / {roster.length} CAPSTER
          </span>
        </div>

        {/* Duty Cards Grid */}
        {roster.length === 0 ? (
          <p className="py-8 text-center text-sm text-[#A1A1AA]">Belum ada data capster untuk cabang ini.</p>
        ) : <div className="mt-4 grid min-w-0 grid-cols-1 gap-3 2xl:grid-cols-2">
          {roster.map((capster) => {
            const isInService = capster.status === "IN_SERVICE";
            const isAvailable = capster.status === "AVAILABLE";

            return (
              <div
                key={capster.id}
                className={`flex min-w-0 flex-col justify-between border bg-[#09090B] p-3 transition-all sm:p-4 ${
                  isInService
                    ? "border-[#0033A0] shadow-[2px_2px_0px_0px_#0033A0]"
                    : isAvailable
                    ? "border-[#27272A] hover:border-[#FAFAFA]"
                    : "border-[#27272A] opacity-80"
                }`}
              >
                <div>
                  {/* Top line: Name & Chair */}
                  <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex min-w-0 flex-col">
                      <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                        <span className="break-words font-heading text-base font-bold uppercase text-[#FAFAFA]">
                          {capster.name}
                        </span>
                        <span className="w-fit shrink-0 bg-[#27272A] px-1 text-[10px] font-mono font-bold text-[#A1A1AA]">
                          {capster.branchCode}
                        </span>
                      </div>
                      <span className="break-words text-xs font-medium text-[#A1A1AA]">
                        {capster.branch} • {capster.chairNo}
                      </span>
                    </div>

                    {/* Status Badge */}
                    <span
                      className={`flex w-fit max-w-full shrink-0 items-center gap-1 border px-2 py-0.5 text-[10px] font-bold uppercase ${
                        isInService
                          ? "bg-[#0033A0]/20 border-[#0033A0] text-[#B6C4FF]"
                          : isAvailable
                          ? "bg-[#1A1A1D] border-[#FAFAFA] text-[#FAFAFA]"
                          : "bg-[#FF2A2A]/20 border-[#FF2A2A] text-[#FF2A2A]"
                      }`}
                    >
                      {isInService ? (
                        <>
                          <Scissors className="w-3 h-3 text-[#B6C4FF]" />
                          IN SERVICE
                        </>
                      ) : isAvailable ? (
                        <>
                          <Check className="w-3 h-3 text-[#FAFAFA]" />
                          AVAILABLE
                        </>
                      ) : (
                        <>
                          <Coffee className="w-3 h-3 text-[#FF2A2A]" />
                          BREAK
                        </>
                      )}
                    </span>
                  </div>

                  {/* Active Job Description */}
                  <div className="mt-3 p-2.5 bg-[#1A1A1D] border border-[#27272A] flex flex-col gap-1">
                    <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-start gap-2 text-xs">
                      <span className="break-words font-semibold text-[#A1A1AA]">
                        {isInService ? "Pelanggan Saat Ini:" : "Kondisi Kursi:"}
                      </span>
                      <span className="break-words text-right font-bold text-[#FAFAFA]">
                        {capster.customerName}
                      </span>
                    </div>
                    <span className="break-words text-xs font-medium text-[#B6C4FF]">
                      {capster.serviceName}
                    </span>

                    {/* Progress Bar for Active Cut */}
                    {isInService && (
                      <div className="mt-1.5 flex flex-col gap-1">
                        <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 text-[10px] font-mono text-[#A1A1AA]">
                          <span>Mulai {capster.startTime}</span>
                          <span>Est. Selesai {capster.estimatedFinish}</span>
                        </div>
                        <div className="w-full bg-[#09090B] h-1.5 border border-[#27272A] p-0.5">
                          <div
                            className="h-full bg-[#0033A0]"
                            style={{ width: `${capster.progressPercent}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom line: Today's cuts */}
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[#27272A] pt-2.5 text-xs text-[#A1A1AA]">
                  <span className="flex min-w-0 items-center gap-1 text-[11px]">
                    <Clock className="h-3.5 w-3.5 shrink-0" />
                    {isInService
                      ? `${capster.elapsedMinutes} / ${capster.totalMinutes} menit`
                      : "Jadwal hari ini"}
                  </span>
                  <span className="break-words text-right font-bold text-[#FAFAFA]">
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
