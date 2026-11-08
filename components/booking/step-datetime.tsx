"use client";

import { AlertTriangle, CalendarDays, Clock } from "lucide-react";

interface StepDateTimeProps {
  selectedDateKey: string;
  selectedTime: string;
  availableTimes: string[];
  canCheckAvailability: boolean;
  selectedServiceCount: number;
  totalDurationMinutes: number;
  isLoading: boolean;
  availabilityError: string;
  onRetry: () => void;
  onSelectDate: (date: string) => void;
  onSelectTime: (time: string) => void;
}

function bandungDate(date: Date) {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Jakarta" }).format(
    date,
  );
}

export function StepDateTime({
  selectedDateKey,
  selectedTime,
  availableTimes,
  canCheckAvailability,
  selectedServiceCount,
  totalDurationMinutes,
  isLoading,
  availabilityError,
  onRetry,
  onSelectDate,
  onSelectTime,
}: StepDateTimeProps) {
  const today = bandungDate(new Date());

  return (
    <section id="step-jadwal" className="flex flex-col gap-4">
      <div className="flex items-center gap-3 border-b border-[#27272A] pb-3">
        <span className="flex h-7 w-7 items-center justify-center bg-[#FAFAFA] font-heading text-sm font-bold text-[#09090B]">
          4
        </span>
        <h2 className="font-heading text-xl font-bold uppercase tracking-tight text-[#FAFAFA] sm:text-2xl">
          PILIH TANGGAL & JAM
        </h2>
      </div>

      <label className="max-w-sm text-xs font-bold uppercase tracking-wider text-[#A1A1AA]">
        Tanggal booking
        <span className="relative mt-2 block">
          <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#0033A0]" />
          <input
            type="date"
            required
            min={today}
            value={selectedDateKey}
            onChange={(event) => {
              onSelectDate(event.target.value);
              onSelectTime("");
            }}
            className="w-full border border-[#27272A] bg-[#1A1A1D] py-3 pl-10 pr-3 text-sm text-[#FAFAFA] outline-none focus:border-[#0033A0]"
          />
        </span>
      </label>

      <div className="border border-[#27272A] bg-[#1A1A1D] p-4">
        <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FAFAFA]">
          <Clock className="h-4 w-4 text-[#0033A0]" />
          Slot booking
        </h3>
        {isLoading ? (
          <p
            role="status"
            className="border border-[#52525B] bg-[#09090B] p-4 text-sm text-[#FAFAFA]"
          >
            Memeriksa slot untuk {selectedServiceCount} layanan dengan total
            durasi {totalDurationMinutes} menit…
          </p>
        ) : availabilityError ? (
          <div
            role="alert"
            className="border-2 border-red-500 bg-red-950 p-4 text-sm text-red-100"
          >
            <p className="flex items-center gap-2 font-bold uppercase">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              Jadwal gagal diperiksa
            </p>
            <p className="mt-2">{availabilityError}</p>
            <button
              type="button"
              onClick={onRetry}
              className="mt-3 border border-red-400 bg-red-900 px-3 py-2 font-bold text-white hover:bg-red-800"
            >
              Coba lagi
            </button>
          </div>
        ) : !canCheckAvailability ? (
          <p
            role="status"
            className="border border-[#52525B] bg-[#09090B] p-4 text-sm text-[#D4D4D8]"
          >
            Pilih cabang, capster, dan minimal satu layanan untuk memeriksa
            slot booking.
          </p>
        ) : availableTimes.length === 0 ? (
          <div
            role="status"
            className="border-2 border-red-500 bg-red-950 p-4 text-sm text-red-100"
          >
            <p className="flex items-center gap-2 font-bold uppercase">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              Tidak ada slot tersedia
            </p>
            <p className="mt-2">
              Tidak ada jadwal yang cocok untuk tanggal ini dengan durasi total{" "}
              {totalDurationMinutes} menit ({selectedServiceCount} layanan).
              Jadwal dapat penuh, capster tidak bertugas, atau durasi layanan
              tidak muat dalam jam operasional.
            </p>
            <p className="mt-2 font-semibold">
              Pilih tanggal atau capster lain, atau kurangi layanan.
            </p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {availableTimes.map((time) => (
              <button
                type="button"
                key={time}
                onClick={() => onSelectTime(time)}
                aria-pressed={selectedTime === time}
                className={`border px-4 py-2.5 text-sm font-bold ${
                  selectedTime === time
                    ? "border-[#0033A0] bg-[#0033A0] text-white"
                    : "border-[#52525B] bg-[#09090B] text-[#D4D4D8] hover:border-[#0033A0]"
                }`}
              >
                {time}
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
