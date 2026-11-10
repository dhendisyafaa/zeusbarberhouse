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
      <div className="flex items-center gap-3 border-b border-border pb-3">
        <span className="flex h-7 w-7 items-center justify-center bg-foreground font-heading text-sm font-bold text-background">
          4
        </span>
        <h2 className="font-heading text-xl font-bold uppercase tracking-tight text-foreground sm:text-2xl">
          PILIH TANGGAL & JAM
        </h2>
      </div>

      <label className="max-w-sm text-xs font-bold uppercase tracking-wider text-muted-foreground">
        Tanggal booking
        <span className="relative mt-2 block">
          <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
          <input
            type="date"
            required
            min={today}
            value={selectedDateKey}
            onChange={(event) => {
              onSelectDate(event.target.value);
              onSelectTime("");
            }}
            className="w-full border border-border bg-card py-3 pl-10 pr-3 text-sm text-foreground outline-none focus:border-primary"
          />
        </span>
      </label>

      <div className="border border-border bg-card p-4">
        <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground">
          <Clock className="h-4 w-4 text-primary" />
          Slot booking
        </h3>
        {isLoading ? (
          <p
            role="status"
            className="border border-subtle bg-background p-4 text-sm text-foreground"
          >
            Memeriksa slot untuk {selectedServiceCount} layanan dengan total
            durasi {totalDurationMinutes} menit…
          </p>
        ) : availabilityError ? (
          <div
            role="alert"
            className="border-2 border-destructive bg-destructive/10 p-4 text-sm text-destructive"
          >
            <p className="flex items-center gap-2 font-bold uppercase">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              Jadwal gagal diperiksa
            </p>
            <p className="mt-2">{availabilityError}</p>
            <button
              type="button"
              onClick={onRetry}
              className="mt-3 border border-destructive bg-destructive/15 px-3 py-2 font-bold text-foreground hover:bg-destructive/20"
            >
              Coba lagi
            </button>
          </div>
        ) : !canCheckAvailability ? (
          <p
            role="status"
            className="border border-subtle bg-background p-4 text-sm text-foreground"
          >
            Pilih cabang, capster, dan minimal satu layanan untuk memeriksa
            slot booking.
          </p>
        ) : availableTimes.length === 0 ? (
          <div
            role="status"
            className="border-2 border-destructive bg-destructive/10 p-4 text-sm text-destructive"
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
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-subtle bg-background text-foreground hover:border-primary"
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
