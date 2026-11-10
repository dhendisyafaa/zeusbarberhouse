import Image from "next/image";
import Link from "next/link";
import {
  Calendar,
  Clock,
  Store,
  Scissors,
  Users,
  Star,
  ShieldCheck,
} from "lucide-react";

export function HeroSection({
  branchCount,
  barberCount,
}: {
  branchCount: number;
  barberCount: number;
}) {
  return (
    <section className="relative w-full bg-background pt-28 pb-16 sm:pt-36 sm:pb-20 overflow-hidden">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 opacity-15 pointer-events-none dot-grid [background-size:20px_20px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Hero Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center mb-16">
          {/* Left Column: Headlines & CTAs */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-extrabold uppercase tracking-tight text-foreground leading-[0.98]">
              FEEL AT HOME.
              <br />
              <span className="text-destructive selection:bg-primary selection:text-primary-foreground">
                LEAVE REFRESHED.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed">
              Tempat potong rambut paling santai di Bandung Raya. Gak ada drama
              antre lama apalagi hasil potongan buru-buru. Tinggal pilih jadwal,
              pilih capster andalan lu, dan nikmati potongan presisi sambil
              ngopi santai.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/booking"
                className="bg-primary text-primary-foreground text-sm sm:text-base font-bold uppercase tracking-wider px-8 py-4 border border-primary transition-all duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_var(--foreground)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none inline-flex items-center gap-2.5"
              >
                <Calendar className="w-5 h-5" />
                BOOKING JADWAL SEKARANG
              </Link>
              <a
                href="#layanan"
                className="bg-transparent text-foreground border border-border hover:bg-card hover:border-primary text-sm sm:text-base font-semibold uppercase tracking-wider px-8 py-4 transition-all duration-150 inline-flex items-center gap-2"
              >
                <Scissors className="w-4 h-4 text-muted-foreground" />
                LIHAT DAFTAR LAYANAN
              </a>
            </div>
          </div>

          {/* Right Column: Industrial Badge Showcase */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center p-8 bg-card border border-border relative group hover:border-primary transition-colors">
            {/* Corner Decorative Marks */}
            <div className="absolute top-2 left-2 text-[10px] text-subtle font-mono">
              [SEC-01]
            </div>
            <div className="absolute top-2 right-2 text-[10px] text-subtle font-mono">
              BDG-2024
            </div>

            <div className="relative w-44 h-44 sm:w-52 sm:h-52 my-4">
              <Image
                src="/zeus-logo.jpg"
                alt="Zeus Official Badge"
                fill
                className="object-contain filter drop-shadow-xl"
                priority
              />
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Stat 1 */}
          <div className="bg-card border border-border p-5 flex flex-col justify-between hover:border-primary transition-colors">
            <div className="flex items-center justify-between text-primary mb-2">
              <Store className="w-5 h-5" />
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                LOKASI
              </span>
            </div>
            <div className="font-heading text-2xl sm:text-3xl font-extrabold uppercase text-foreground">
              {branchCount} CABANG
            </div>
            <p className="text-xs text-muted-foreground mt-1">Lokasi cabang aktif</p>
          </div>

          {/* Stat 2 */}
          <div className="bg-card border border-border p-5 flex flex-col justify-between hover:border-primary transition-colors">
            <div className="flex items-center justify-between text-primary mb-2">
              <Scissors className="w-5 h-5" />
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                CREW
              </span>
            </div>
            <div className="font-heading text-2xl sm:text-3xl font-extrabold uppercase text-foreground">
              {barberCount} CAPSTER
            </div>
            <p className="text-xs text-muted-foreground mt-1">Capster aktif</p>
          </div>

          {/* Stat 3 */}
          <div className="bg-card border border-border p-5 flex flex-col justify-between hover:border-primary transition-colors">
            <div className="flex items-center justify-between text-primary mb-2">
              <Users className="w-5 h-5" />
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Layanan
              </span>
            </div>
            <div className="font-heading text-2xl sm:text-3xl font-extrabold uppercase text-foreground">
              10.000+
            </div>
            <p className="text-xs text-muted-foreground mt-1">Glow-up dengan instan</p>
          </div>

          {/* Stat 4 */}
          <div className="bg-card border border-border p-5 flex flex-col justify-between hover:border-destructive transition-colors">
            <div className="flex items-center justify-between text-destructive mb-2">
              <Star className="w-5 h-5 fill-destructive" />
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                RATING
              </span>
            </div>
            <div className="font-heading text-2xl sm:text-3xl font-extrabold uppercase text-foreground">
              4.9 / 5.0
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Rata-rata ulasan Google Maps
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
