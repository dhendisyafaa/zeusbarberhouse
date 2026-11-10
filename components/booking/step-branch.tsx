"use client";

import { Clock, Check } from "lucide-react";

export interface BranchOption {
  id: string;
  number: string;
  name: string;
  city: string;
  address: string;
  hours: string;
  phone: string | null;
}

interface StepBranchProps {
  branches: BranchOption[];
  selectedBranchId: string;
  onSelectBranch: (branchId: string) => void;
}

export function StepBranch({
  branches,
  selectedBranchId,
  onSelectBranch,
}: StepBranchProps) {
  return (
    <section id="step-cabang" className="flex flex-col gap-4">
      {/* Step Header */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-3">
          <span className="w-7 h-7 bg-foreground text-background font-heading flex items-center justify-center font-bold text-sm">
            1
          </span>
          <h2 className="font-heading text-xl sm:text-2xl font-bold uppercase text-foreground tracking-tight">
            PILIH CABANG RESMI
          </h2>
        </div>
        <span className="hidden text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:inline-block">
          {branches.length} cabang aktif
        </span>
      </div>

      {/* Branch Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {branches.map((branch) => {
          const isSelected = selectedBranchId === branch.id;

          return (
            <div
              key={branch.id}
              onClick={() => onSelectBranch(branch.id)}
              className={`relative cursor-pointer p-5 bg-card transition-all duration-150 flex flex-col justify-between ${
                isSelected
                  ? "border-2 border-primary shadow-[4px_4px_0px_0px_var(--primary)]"
                  : "border border-border hover:border-primary/60"
              }`}
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[11px] font-bold text-destructive tracking-wider uppercase font-mono">
                    {branch.number}
                  </span>
                  {isSelected && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider">
                      <Check className="w-3 h-3" />
                      TERPILIH
                    </span>
                  )}
                </div>

                <h3 className="font-heading text-xl font-bold text-foreground uppercase leading-tight mb-1">
                  {branch.name}
                </h3>
                <p className="text-xs text-muted-foreground mb-4 leading-relaxed line-clamp-2">
                  {branch.address}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-primary" />
                  {branch.hours}
                </span>
                <span className="text-foreground font-bold">{branch.city}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
