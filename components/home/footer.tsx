import { ArrowRight, MessageCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { CheckerboardDivider } from "./checkerboard-divider";

export function Footer() {
  return (
    <footer className="w-full bg-card border-t border-border relative">
      {/* Top Crimson Racing Stripe Divider */}
      <CheckerboardDivider variant="crimson" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Col 1: Brand Info & Socials */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="relative w-8 h-8 overflow-hidden border border-border bg-background shrink-0">
                <Image
                  src="/zeus-logo.jpg"
                  alt="Zeus BarberHouse"
                  fill
                  className="object-cover"
                />
              </div>
              <span className="font-heading text-lg font-bold uppercase tracking-wider text-foreground">
                ZEUS BARBERHOUSE
              </span>
            </div>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Tempat potong rambut pria dengan standar presisi tinggi, disiplin
              mekanik, dan kenyamanan maksimal.
            </p>

            <div className="flex items-center gap-2 mt-2">
              <span className="px-2.5 py-1 bg-background border border-border text-foreground text-xs font-semibold uppercase tracking-wider">
                EST. 2024 • BANDUNG
              </span>
            </div>

            {/* Social Media Icons */}
            <div className="flex items-center gap-4 mt-2">
              {process.env.NEXT_PUBLIC_IG_URL && (
                <a
                  href={process.env.NEXT_PUBLIC_IG_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                >
                  <svg
                    className="w-5 h-5 text-muted-foreground hover:text-destructive transition-colors"
                    role="img"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                  >
                    <title>Instagram</title>
                    <path d="M7.0301.084c-1.2768.0602-2.1487.264-2.911.5634-.7888.3075-1.4575.72-2.1228 1.3877-.6652.6677-1.075 1.3368-1.3802 2.127-.2954.7638-.4956 1.6365-.552 2.914-.0564 1.2775-.0689 1.6882-.0626 4.947.0062 3.2586.0206 3.6671.0825 4.9473.061 1.2765.264 2.1482.5635 2.9107.308.7889.72 1.4573 1.388 2.1228.6679.6655 1.3365 1.0743 2.1285 1.38.7632.295 1.6361.4961 2.9134.552 1.2773.056 1.6884.069 4.9462.0627 3.2578-.0062 3.668-.0207 4.9478-.0814 1.28-.0607 2.147-.2652 2.9098-.5633.7889-.3086 1.4578-.72 2.1228-1.3881.665-.6682 1.0745-1.3378 1.3795-2.1284.2957-.7632.4966-1.636.552-2.9124.056-1.2809.0692-1.6898.063-4.948-.0063-3.2583-.021-3.6668-.0817-4.9465-.0607-1.2797-.264-2.1487-.5633-2.9117-.3084-.7889-.72-1.4568-1.3876-2.1228C21.2982 1.33 20.628.9208 19.8378.6165 19.074.321 18.2017.1197 16.9244.0645 15.6471.0093 15.236-.005 11.977.0014 8.718.0076 8.31.0215 7.0301.0839m.1402 21.6932c-1.17-.0509-1.8053-.2453-2.2287-.408-.5606-.216-.96-.4771-1.3819-.895-.422-.4178-.6811-.8186-.9-1.378-.1644-.4234-.3624-1.058-.4171-2.228-.0595-1.2645-.072-1.6442-.079-4.848-.007-3.2037.0053-3.583.0607-4.848.05-1.169.2456-1.805.408-2.2282.216-.5613.4762-.96.895-1.3816.4188-.4217.8184-.6814 1.3783-.9003.423-.1651 1.0575-.3614 2.227-.4171 1.2655-.06 1.6447-.072 4.848-.079 3.2033-.007 3.5835.005 4.8495.0608 1.169.0508 1.8053.2445 2.228.408.5608.216.96.4754 1.3816.895.4217.4194.6816.8176.9005 1.3787.1653.4217.3617 1.056.4169 2.2263.0602 1.2655.0739 1.645.0796 4.848.0058 3.203-.0055 3.5834-.061 4.848-.051 1.17-.245 1.8055-.408 2.2294-.216.5604-.4763.96-.8954 1.3814-.419.4215-.8181.6811-1.3783.9-.4224.1649-1.0577.3617-2.2262.4174-1.2656.0595-1.6448.072-4.8493.079-3.2045.007-3.5825-.006-4.848-.0608M16.953 5.5864A1.44 1.44 0 1 0 18.39 4.144a1.44 1.44 0 0 0-1.437 1.4424M5.8385 12.012c.0067 3.4032 2.7706 6.1557 6.173 6.1493 3.4026-.0065 6.157-2.7701 6.1506-6.1733-.0065-3.4032-2.771-6.1565-6.174-6.1498-3.403.0067-6.156 2.771-6.1496 6.1738M8 12.0077a4 4 0 1 1 4.008 3.9921A3.9996 3.9996 0 0 1 8 12.0077" />
                  </svg>
                </a>
              )}
              {process.env.NEXT_PUBLIC_TIKTOK_URL && (
                <a
                  href={process.env.NEXT_PUBLIC_TIKTOK_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="TikTok"
                >
                  <svg
                    className="w-5 h-5 text-muted-foreground hover:text-destructive transition-colors"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z" />
                  </svg>
                </a>
              )}
              {process.env.NEXT_PUBLIC_WA_URL && (
                <a
                  href={process.env.NEXT_PUBLIC_WA_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                >
                  <svg
                    className="w-5 h-5 text-muted-foreground hover:text-destructive transition-colors"
                    role="img"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                  >
                    <title>WhatsApp</title>
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                </a>
              )}
            </div>
          </div>

          {/* Col 2: Cabang */}
          <div className="flex flex-col gap-4 lg:border-l lg:border-border lg:pl-8">
            <span className="font-heading text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
              CABANG
            </span>

            <p className="text-xs leading-relaxed text-muted-foreground">
              Alamat dan jam operasional terbaru mengikuti data cabang aktif.
            </p>
            <Link
              href="/branches"
              className="text-xs font-bold uppercase tracking-wider text-foreground hover:text-primary"
            >
              Lihat semua cabang →
            </Link>
          </div>

          {/* Col 3: Jam Operasional */}
          <div className="flex flex-col gap-4 lg:border-l lg:border-border lg:pl-8">
            <span className="font-heading text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
              JAM BUKA CABANG
            </span>

            <p className="text-xs leading-relaxed text-muted-foreground">
              Jadwal tiap cabang dapat berbeda. Lihat detailnya sebelum
              berkunjung.
            </p>
            <Link
              href="/branches"
              className="text-xs font-bold uppercase tracking-wider text-foreground hover:text-primary"
            >
              Cek jadwal cabang →
            </Link>
          </div>

          {/* Col 4: Quick Links */}
          <div className="flex flex-col gap-4 lg:border-l lg:border-border lg:pl-8">
            <span className="font-heading text-sm font-bold uppercase tracking-wider text-foreground">
              AKSES CEPAT
            </span>

            <div className="flex flex-col gap-2.5 text-xs font-semibold uppercase tracking-wider">
              <Link
                href="/services"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Daftar Layanan & Harga
              </Link>
              <a
                href="#booking-info"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Cara Booking Online
              </a>
              <Link
                href="/#capster"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Capster
              </Link>
              <Link
                href="/branches"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Lokasi Cabang
              </Link>
              <Link
                href="/haircut-models"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Inspirasi Model Rambut
              </Link>
              <Link
                href="/careers"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Karier
              </Link>
              <a
                href="#membership"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Zeus VIP Club Membership
              </a>
              <Link
                href="/booking"
                className="text-destructive hover:underline font-bold mt-2 inline-flex items-center gap-1"
              >
                <span>Pesan Kursi Sekarang</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} Zeus BarberHouse. All rights
            reserved.
          </p>
          <div className="flex items-center gap-6 font-semibold uppercase text-[11px]">
            <span className="text-foreground">Bandung, Jawa Barat</span>
            <span>&bull;</span>
            <span>Feel at Home. Leave Refreshed.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
