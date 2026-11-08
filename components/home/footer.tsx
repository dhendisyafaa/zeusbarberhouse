import Image from "next/image";
import Link from "next/link";
import { CheckerboardDivider } from "./checkerboard-divider";
import { Clock, MapPin, ArrowRight } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full bg-[#1A1A1D] border-t border-[#27272A] relative">
      {/* Top Crimson Racing Stripe Divider */}
      <CheckerboardDivider variant="crimson" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Col 1: Brand Info */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="relative w-8 h-8 overflow-hidden border border-[#27272A] bg-[#09090B] shrink-0">
                <Image
                  src="/zeus-logo.jpg"
                  alt="Zeus BarberHouse"
                  fill
                  className="object-cover"
                />
              </div>
              <span className="font-heading text-lg font-bold uppercase tracking-wider text-[#FAFAFA]">
                ZEUS BARBERHOUSE
              </span>
            </div>

            <p className="text-xs sm:text-sm text-[#A1A1AA] leading-relaxed">
              Tempat potong rambut pria dengan standar presisi tinggi, disiplin
              mekanik, dan kenyamanan maksimal.
            </p>

            <div className="flex items-center gap-2 mt-2">
              <span className="px-2.5 py-1 bg-[#09090B] border border-[#27272A] text-[#FAFAFA] text-xs font-semibold uppercase tracking-wider">
                EST. 2024 • BANDUNG
              </span>
            </div>
          </div>

          {/* Col 2: Cabang Garasi */}
          <div className="flex flex-col gap-4 lg:border-l lg:border-[#27272A] lg:pl-8">
            <span className="font-heading text-sm font-bold uppercase tracking-wider text-[#FAFAFA] flex items-center gap-2">
              CABANG GARASI
            </span>

            <p className="text-xs leading-relaxed text-[#A1A1AA]">
              Alamat dan jam operasional terbaru mengikuti data cabang aktif.
            </p>
            <Link
              href="/branches"
              className="text-xs font-bold uppercase tracking-wider text-[#FAFAFA] hover:text-[#0033A0]"
            >
              Lihat semua cabang →
            </Link>
          </div>

          {/* Col 3: Jam Operasional */}
          <div className="flex flex-col gap-4 lg:border-l lg:border-[#27272A] lg:pl-8">
            <span className="font-heading text-sm font-bold uppercase tracking-wider text-[#FAFAFA] flex items-center gap-2">
              JAM BUKA GARASI
            </span>

            <p className="text-xs leading-relaxed text-[#A1A1AA]">
              Jadwal tiap cabang dapat berbeda. Lihat detailnya sebelum
              berkunjung.
            </p>
            <Link
              href="/branches"
              className="text-xs font-bold uppercase tracking-wider text-[#FAFAFA] hover:text-[#0033A0]"
            >
              Cek jadwal cabang →
            </Link>
          </div>

          {/* Col 4: Quick Links */}
          <div className="flex flex-col gap-4 lg:border-l lg:border-[#27272A] lg:pl-8">
            <span className="font-heading text-sm font-bold uppercase tracking-wider text-[#FAFAFA]">
              AKSES CEPAT
            </span>

            <div className="flex flex-col gap-2.5 text-xs font-semibold uppercase tracking-wider">
              <Link
                href="/services"
                className="text-[#A1A1AA] hover:text-[#FAFAFA] transition-colors"
              >
                Daftar Layanan & Harga
              </Link>
              <a
                href="#booking-info"
                className="text-[#A1A1AA] hover:text-[#FAFAFA] transition-colors"
              >
                Cara Booking Online
              </a>
              <Link
                href="/branches"
                className="text-[#A1A1AA] hover:text-[#FAFAFA] transition-colors"
              >
                Lokasi Cabang
              </Link>
              <Link
                href="/haircut-models"
                className="text-[#A1A1AA] hover:text-[#FAFAFA] transition-colors"
              >
                Inspirasi Model Rambut
              </Link>
              <Link
                href="/careers"
                className="text-[#A1A1AA] hover:text-[#FAFAFA] transition-colors"
              >
                Karier
              </Link>
              <a
                href="#membership"
                className="text-[#A1A1AA] hover:text-[#FAFAFA] transition-colors"
              >
                Zeus VIP Club Membership
              </a>
              <Link
                href="/booking"
                className="text-[#FF2A2A] hover:underline font-bold mt-2 inline-flex items-center gap-1"
              >
                <span>Pesan Kursi Sekarang</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#27272A] flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#A1A1AA]">
          <p>
            &copy; {new Date().getFullYear()} Zeus BarberHouse. All rights
            reserved.
          </p>
          <div className="flex items-center gap-6 font-semibold uppercase text-[11px]">
            <span className="text-[#FAFAFA]">Bandung, Jawa Barat</span>
            <span>&bull;</span>
            <span>Feel at Home. Leave Refreshed.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
