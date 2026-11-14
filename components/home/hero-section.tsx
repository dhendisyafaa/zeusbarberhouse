import Image from "next/image";
import Link from "next/link";
import { ArrowDown, Calendar, MapPin } from "lucide-react";

export function HeroSection({
  branchCount,
  barberCount,
}: {
  branchCount: number;
  barberCount: number;
}) {
  return (
    <section className="hero-surface relative flex min-h-[680px] items-center overflow-hidden pt-28 sm:min-h-[760px]">
      <div className="absolute -right-32 top-32 h-80 w-80 rounded-full border border-primary/20 sm:h-[30rem] sm:w-[30rem]" />
      <div className="absolute -right-20 top-44 h-64 w-64 rounded-full border border-primary/10 sm:h-96 sm:w-96" />

      <div className="relative z-10 mx-auto grid w-full max-w-7xl gap-12 px-5 pb-20 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <h1 className="max-w-3xl font-heading text-5xl font-extrabold uppercase leading-[0.95] tracking-tight text-foreground sm:text-7xl lg:text-8xl">
            Feel at Home.
            <br />
            <span className="text-primary">Leave Refreshed.</span>
          </h1>
          <p className="mt-7 max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">
            Tempat potong rambut yang hangat, santai, dan presisi. Pilih
            layanan, tentukan kursi, lalu datang dengan tenang.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/booking"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-primary-foreground transition hover:bg-primary-hover"
            >
              <Calendar className="h-4 w-4" />
              Book Your Slot
            </Link>
            <a
              href="#pricelist"
              className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-foreground transition hover:border-primary"
            >
              <ArrowDown className="h-4 w-4" />
              Explore Zeus
            </a>
          </div>
        </div>

        <div className="relative mx-auto flex aspect-square w-full max-w-[420px] items-center justify-center rounded-[2.5rem] border border-border bg-card/70 p-10 shadow-[0_24px_70px_-35px_var(--shadow)]">
          <div className="absolute inset-5 rounded-[2rem] border border-primary/20" />
          <Image
            src="/zeus-logo.jpg"
            alt="Zeus Barberhouse"
            fill
            sizes="(max-width: 1024px) 90vw, 420px"
            className="relative z-10 object-contain p-20 sm:p-24"
            priority
          />
          <div className="absolute bottom-7 left-7 z-20 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <MapPin className="h-4 w-4 text-primary" />
            Bandung Raya
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:col-span-2 lg:max-w-2xl">
          <div className="rounded-2xl border border-border bg-card/80 p-4">
            <span className="text-xs uppercase tracking-widest text-muted-foreground">
              Cabang
            </span>
            <strong className="mt-2 block font-heading text-3xl text-foreground">
              {branchCount}
            </strong>
            <span className="text-xs text-muted-foreground">cabang aktif</span>
          </div>
          <div className="rounded-2xl border border-border bg-card/80 p-4">
            <span className="text-xs uppercase tracking-widest text-muted-foreground">
              Barber
            </span>
            <strong className="mt-2 block font-heading text-3xl text-foreground">
              {barberCount}
            </strong>
            <span className="text-xs text-muted-foreground">barber aktif</span>
          </div>
        </div>
      </div>
    </section>
  );
}
