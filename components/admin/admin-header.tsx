"use client";

import { Store, Calendar } from "lucide-react";
import type { BranchOption } from "./admin-types";

interface AdminHeaderProps {
  branches: BranchOption[];
  selectedBranch: string;
  onBranchChange: (branchId: string) => void;
}

export function AdminHeader({
  branches,
  selectedBranch,
  onBranchChange,
}: AdminHeaderProps) {
  const currentDate = new Date()
    .toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
    .toUpperCase();

  return (
    <header className="fixed left-0 right-0 top-0 z-40 flex h-16 items-center justify-between border-b border-[#27272A] bg-[#1A1A1D]/95 pl-14 pr-3 backdrop-blur-md sm:px-6 sm:pl-16 lg:left-72 lg:pl-6">
      <div className="flex min-w-0 items-center gap-2 sm:gap-4">
        {/* Branch Selector */}
        <div className="flex min-w-0 items-center border border-[#27272A] bg-[#09090B] px-2 py-1.5 sm:px-3">
          <Store className="w-4 h-4 text-[#A1A1AA] mr-2 shrink-0" />
          <label htmlFor="branch-select" className="sr-only">
            Cabang Operasional
          </label>
          <select
            id="branch-select"
            value={selectedBranch}
            onChange={(e) => onBranchChange(e.target.value)}
            className="max-w-[42vw] truncate bg-transparent text-[10px] font-semibold uppercase tracking-wider text-[#FAFAFA] focus:outline-none cursor-pointer pr-2 sm:max-w-none sm:pr-4 sm:text-xs"
          >
            <option value="all" className="bg-[#1A1A1D] text-[#FAFAFA]">
              SEMUA CABANG (BDG RAYA)
            </option>
            {branches.map((b) => (
              <option
                key={b.id}
                value={b.id}
                className="bg-[#1A1A1D] text-[#FAFAFA]"
              >
                CABANG {b.name.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        {/* Date & Shift Badge */}
        <div className="hidden xl:flex items-center border border-[#27272A] bg-[#09090B] px-3 py-1.5 gap-2">
          <Calendar className="w-4 h-4 text-[#A1A1AA]" />
          <span className="text-[11px] font-bold text-[#FAFAFA] uppercase tracking-wider">
            HARI INI: {currentDate}
          </span>
        </div>
      </div>
    </header>
  );
}
