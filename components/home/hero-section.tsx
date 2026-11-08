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
    <section className="relative w-full bg-[#09090B] pt-28 pb-16 sm:pt-36 sm:pb-20 overflow-hidden">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#27272A_1px,transparent_1px)] [background-size:20px_20px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Hero Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center mb-16">
          {/* Left Column: Headlines & CTAs */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-extrabold uppercase tracking-tight text-[#FAFAFA] leading-[0.98]">
              FEEL AT HOME.
              <br />
              <span className="text-[#0033A0] selection:bg-[#FF2A2A] selection:text-[#FAFAFA]">
                LEAVE REFRESHED.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-[#A1A1AA] max-w-2xl leading-relaxed">
              Tempat potong rambut paling santai di Bandung Raya. Gak ada drama
              antre lama apalagi hasil potongan buru-buru. Tinggal pilih jadwal,
              pilih capster andalan lu, dan nikmati potongan presisi standar
              garasi mekanik sambil ngopi santai.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/booking"
                className="bg-[#0033A0] text-[#FAFAFA] text-sm sm:text-base font-bold uppercase tracking-wider px-8 py-4 border border-[#0033A0] transition-all duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_#FAFAFA] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none inline-flex items-center gap-2.5"
              >
                <Calendar className="w-5 h-5" />
                BOOKING JADWAL SEKARANG
              </Link>
              <a
                href="#layanan"
                className="bg-transparent text-[#FAFAFA] border border-[#27272A] hover:bg-[#1A1A1D] hover:border-[#0033A0] text-sm sm:text-base font-semibold uppercase tracking-wider px-8 py-4 transition-all duration-150 inline-flex items-center gap-2"
              >
                <Scissors className="w-4 h-4 text-[#A1A1AA]" />
                LIHAT DAFTAR LAYANAN
              </a>
            </div>
          </div>

          {/* Right Column: Industrial Badge Showcase */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center p-8 bg-[#1A1A1D] border border-[#27272A] relative group hover:border-[#0033A0] transition-colors">
            {/* Corner Decorative Marks */}
            <div className="absolute top-2 left-2 text-[10px] text-[#52525B] font-mono">
              [SEC-01]
            </div>
            <div className="absolute top-2 right-2 text-[10px] text-[#52525B] font-mono">
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

            <div className="w-full border-t border-[#27272A] pt-4 mt-2 flex flex-col items-center text-center">
              <span className="font-heading text-lg font-bold uppercase tracking-wider text-[#FAFAFA]">
                ZEUS ALL HAIR GARAGE
              </span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Stat 1 */}
          <div className="bg-[#1A1A1D] border border-[#27272A] p-5 flex flex-col justify-between hover:border-[#0033A0] transition-colors">
            <div className="flex items-center justify-between text-[#0033A0] mb-2">
              <Store className="w-5 h-5" />
              <span className="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-wider">
                LOKASI
              </span>
            </div>
            <div className="font-heading text-2xl sm:text-3xl font-extrabold uppercase text-[#FAFAFA]">
              {branchCount} CABANG
            </div>
            <p className="text-xs text-[#A1A1AA] mt-1">Lokasi cabang aktif</p>
          </div>

          {/* Stat 2 */}
          <div className="bg-[#1A1A1D] border border-[#27272A] p-5 flex flex-col justify-between hover:border-[#0033A0] transition-colors">
            <div className="flex items-center justify-between text-[#0033A0] mb-2">
              <Scissors className="w-5 h-5" />
              <span className="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-wider">
                CREW
              </span>
            </div>
            <div className="font-heading text-2xl sm:text-3xl font-extrabold uppercase text-[#FAFAFA]">
              {barberCount} CAPSTER
            </div>
            <p className="text-xs text-[#A1A1AA] mt-1">Capster aktif</p>
          </div>

          {/* Stat 3 */}
          <div className="bg-[#1A1A1D] border border-[#27272A] p-5 flex flex-col justify-between hover:border-[#0033A0] transition-colors">
            <div className="flex items-center justify-between text-[#0033A0] mb-2">
              <Users className="w-5 h-5" />
              <span className="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-wider">
                Layanan
              </span>
            </div>
            <div className="font-heading text-2xl sm:text-3xl font-extrabold uppercase text-[#FAFAFA]">
              10.000+
            </div>
            <p className="text-xs text-[#A1A1AA] mt-1">Glow-up dengan instan</p>
          </div>

          {/* Stat 4 */}
          <div className="bg-[#1A1A1D] border border-[#27272A] p-5 flex flex-col justify-between hover:border-[#FF2A2A] transition-colors">
            <div className="flex items-center justify-between text-[#FF2A2A] mb-2">
              <Star className="w-5 h-5 fill-[#FF2A2A]" />
              <span className="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-wider">
                RATING
              </span>
            </div>
            <div className="font-heading text-2xl sm:text-3xl font-extrabold uppercase text-[#FAFAFA]">
              4.9 / 5.0
            </div>
            <p className="text-xs text-[#A1A1AA] mt-1">
              Rata-rata ulasan Google Maps
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
