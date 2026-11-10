import Link from "next/link";
import { Clock, MapPin } from "lucide-react";

type Branch = {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string | null;
  mapsUrl: string | null;
  schedules: { dayOfWeek: number; open: string; close: string }[];
};

const dayLabels = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

export function BranchesSection({ branches }: { branches: Branch[] }) {
  return (
    <section id="cabang" className="w-full border-t border-border bg-background py-20">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-2 border-b border-border pb-8">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary">
            <MapPin className="h-3.5 w-3.5 text-destructive" />
            LOKASI KAMI
          </div>
          <h2 className="font-heading text-3xl font-extrabold uppercase tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            CABANG ZEUS
          </h2>
          <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
            Informasi lokasi dan jadwal operasional dari cabang aktif.
          </p>
        </div>

        {branches.length === 0 ? (
          <p className="border border-border bg-card p-6 text-sm text-muted-foreground">
            Informasi cabang belum tersedia.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {branches.map((branch, index) => (
              <article key={branch.id} className="flex flex-col border border-border bg-card">
                <div className="border-b border-border bg-inset p-5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-destructive">
                    CABANG {String(index + 1).padStart(2, "0")} · {branch.city}
                  </span>
                  <h3 className="mt-2 font-heading text-2xl font-bold uppercase text-foreground">
                    {branch.name}
                  </h3>
                </div>
                <div className="flex flex-1 flex-col gap-4 p-5">
                  <p className="flex items-start gap-2 text-sm text-muted-foreground">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                    {branch.address}
                  </p>
                  {branch.phone && (
                    <a className="text-sm text-muted-foreground hover:text-foreground" href={`tel:${branch.phone}`}>
                      {branch.phone}
                    </a>
                  )}
                  <div className="border-t border-border pt-3">
                    <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase text-foreground">
                      <Clock className="h-3.5 w-3.5 text-primary" />
                      Jam Operasional
                    </span>
                    {branch.schedules.length ? (
                      <ul className="space-y-1 text-xs text-muted-foreground">
                        {branch.schedules.map((schedule) => (
                          <li key={schedule.dayOfWeek} className="flex justify-between gap-3">
                            <span>{dayLabels[schedule.dayOfWeek] ?? "Hari"}</span>
                            <span>{schedule.open}–{schedule.close}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-muted-foreground">Jadwal operasional belum tersedia.</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 p-5 pt-0">
                  {branch.mapsUrl && (
                    <a
                      href={branch.mapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 border border-border px-3 py-3 text-center text-xs font-bold uppercase text-foreground hover:border-primary"
                    >
                      Peta
                    </a>
                  )}
                  <Link
                    href={`/booking?branch=${encodeURIComponent(branch.id)}`}
                    className="flex-1 bg-primary px-3 py-3 text-center text-xs font-bold uppercase text-primary-foreground hover:bg-foreground hover:text-background"
                  >
                    Pilih Cabang
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
