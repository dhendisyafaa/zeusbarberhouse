import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock, Sparkles } from "lucide-react";

type Service = {
  id: string;
  name: string;
  description: string | null;
  durationMinutes: number;
  priceRupiah: number;
};

export function ServicesSection({ services }: { services: Service[] }) {
  return (
    <section id="layanan" className="w-full border-t border-[#27272A] bg-[#09090B] py-20">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-2 border-b border-[#27272A] pb-8">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#0033A0]">
            <Sparkles className="h-3.5 w-3.5 text-[#FF2A2A]" />
            MENU & HARGA
          </div>
          <h2 className="font-heading text-3xl font-extrabold uppercase tracking-tight text-[#FAFAFA] sm:text-4xl lg:text-5xl">
            LAYANAN & HARGA
          </h2>
          <p className="max-w-2xl text-sm text-[#A1A1AA] sm:text-base">
            Harga dan durasi mengikuti layanan aktif yang tersedia saat ini.
          </p>
        </div>

        {services.length === 0 ? (
          <p className="border border-[#27272A] bg-[#1A1A1D] p-6 text-sm text-[#A1A1AA]">
            Belum ada layanan yang tersedia. Silakan cek kembali nanti.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <article
                key={service.id}
                className="flex flex-col justify-between border border-[#27272A] bg-[#1A1A1D] p-6 transition-colors hover:border-[#0033A0]"
              >
                <div>
                  <div className="mb-3 flex items-center justify-between gap-3 text-xs text-[#A1A1AA]">
                    <span className="font-bold uppercase tracking-wider text-[#0033A0]">
                      LAYANAN ZEUS
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {service.durationMinutes} menit
                    </span>
                  </div>
                  <h3 className="mb-2 font-heading text-xl font-bold uppercase text-[#FAFAFA]">
                    {service.name}
                  </h3>
                  <p className="min-h-12 text-sm leading-relaxed text-[#A1A1AA]">
                    {service.description || "Layanan tersedia untuk booking di cabang Zeus."}
                  </p>
                </div>
                <div className="mt-6 flex items-center justify-between border-t border-[#27272A] pt-4">
                  <div>
                    <span className="block text-[10px] font-semibold uppercase text-[#A1A1AA]">
                      Harga
                    </span>
                    <span className="font-heading text-xl font-bold text-[#FAFAFA]">
                      Rp {service.priceRupiah.toLocaleString("id-ID")}
                    </span>
                  </div>
                  <Link
                    href={`/booking?service=${encodeURIComponent(service.id)}`}
                    className="inline-flex items-center gap-1 border border-[#0033A0] bg-[#0033A0] px-4 py-3 text-xs font-bold uppercase tracking-wider text-[#FAFAFA] hover:bg-[#FAFAFA] hover:text-[#09090B]"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    PILIH
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}

        <Link
          href="/haircut-models"
          className="self-start border-b border-[#0033A0] pb-1 text-sm font-bold uppercase tracking-wide text-[#FAFAFA] hover:text-[#A1A1AA]"
        >
          Lihat inspirasi model rambut →
        </Link>
      </div>
    </section>
  );
}
