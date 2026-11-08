"use client";

import { CheckCircle2, Scissors } from "lucide-react";

export interface CapsterOption {
  id: string;
  name: string;
  nickname: string;
  specialty: string;
}

interface StepCapsterProps {
  capsters: CapsterOption[];
  selectedCapsterId: string;
  onSelectCapster: (capsterId: string) => void;
}

export function StepCapster({
  capsters,
  selectedCapsterId,
  onSelectCapster,
}: StepCapsterProps) {
  return (
    <section id="step-capster" className="flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
        <div className="flex items-center gap-3">
          <span className="flex h-7 w-7 items-center justify-center bg-[#FAFAFA] font-heading text-sm font-bold text-[#09090B]">
            2
          </span>
          <h2 className="font-heading text-xl font-bold uppercase tracking-tight text-[#FAFAFA] sm:text-2xl">
            PILIH CAPSTER
          </h2>
        </div>
      </div>

      {capsters.length === 0 ? (
        <p className="border border-[#27272A] bg-[#1A1A1D] p-4 text-sm text-[#A1A1AA]">
          Belum ada capster aktif di cabang ini.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {capsters.map((capster) => {
            const isSelected = selectedCapsterId === capster.id;
            return (
              <button
                type="button"
                key={capster.id}
                onClick={() => onSelectCapster(capster.id)}
                aria-pressed={isSelected}
                className={`flex items-center gap-4 border p-4 text-left transition-colors ${
                  isSelected
                    ? "border-[#0033A0] shadow-[4px_4px_0px_0px_#0033A0]"
                    : "border-[#27272A] hover:border-[#0033A0]/60"
                }`}
              >
                <span className="flex h-16 w-16 shrink-0 items-center justify-center border border-[#27272A] bg-[#09090B]">
                  <Scissors className="h-6 w-6 text-[#0033A0]" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2 font-heading text-lg font-bold uppercase">
                    <span className="truncate">{capster.name}</span>
                    {isSelected && <CheckCircle2 className="h-5 w-5 shrink-0 text-[#0033A0]" />}
                  </span>
                  {capster.specialty && (
                    <span className="mt-1 block text-xs leading-relaxed text-[#A1A1AA]">
                      {capster.specialty}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
