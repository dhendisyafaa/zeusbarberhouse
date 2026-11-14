"use client";

import Image from "next/image";
import Link from "next/link";
import { Scissors } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import AutoScroll from "embla-carousel-auto-scroll";

export type HomeBarber = {
  id: string;
  name: string;
  bio: string | null;
  photoUrl: string | null;
  branchId: string;
  branchName: string;
};

export function BarbersSection({ barbers }: { barbers: HomeBarber[] }) {
  // Inisialisasi Embla: loop aktif, gunakan plugin AutoScroll (kecepatan bisa diatur via parameter 'speed')
  const [emblaRef] = useEmblaCarousel({ loop: true, dragFree: true }, [
    AutoScroll({ playOnInit: true, speed: 1.5, stopOnInteraction: false }),
  ]);

  return (
    <section
      id="barbers"
      className="w-full border-t border-border bg-background py-24"
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 pb-8 text-center">
          <h2 className="font-heading text-3xl font-extrabold uppercase tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Capster Zeus
          </h2>
          <p className="mx-auto max-w-2xl text-sm text-muted-foreground sm:text-base">
            Pilih barber yang paling cocok untuk gaya rambutmu.
          </p>
        </div>

        {barbers.length === 0 ? (
          <p className="border border-border bg-card p-6 text-sm text-muted-foreground">
            Belum ada barber yang tersedia. Silakan cek kembali nanti.
          </p>
        ) : (
          /* Area Embla Viewport (Wajib overflow-hidden) */
          <div
            className="overflow-hidden cursor-grab active:cursor-grabbing"
            ref={emblaRef}
          >
            <div className="flex touch-pan-y ml-[-20px]">
              {barbers.map((barber) => (
                /* Slide Item: Ukuran responsif diatur di sini, margin kiri untuk jarak antar card */
                <div
                  key={barber.id}
                  className="min-w-0 flex-[0_0_80%] sm:flex-[0_0_45%] md:flex-[0_0_33.33%] lg:flex-[0_0_20%] pl-[20px]"
                >
                  <article className="flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card transition-colors hover:border-primary">
                    <div className="relative aspect-[4/5] bg-inset">
                      {barber.photoUrl ? (
                        <Image
                          src={barber.photoUrl}
                          alt={barber.name}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center text-sm text-muted-foreground">
                          <Scissors className="h-8 w-8 text-primary" />
                          Foto barber belum tersedia.
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-destructive">
                        {barber.branchName}
                      </span>
                      <h3 className="mt-2 font-heading text-xl font-bold uppercase text-foreground">
                        {barber.name}
                      </h3>
                      <p className="mt-2 mb-4 min-h-12 text-sm leading-relaxed text-muted-foreground">
                        {barber.bio ||
                          "Capster aktif di cabang Zeus BarberHouse."}
                      </p>
                      <Link
                        href={`/booking?branch=${encodeURIComponent(barber.branchId)}`}
                        className="mt-auto inline-flex self-start border border-primary bg-primary px-4 py-3 text-xs font-bold uppercase tracking-wider text-primary-foreground hover:bg-foreground hover:text-background"
                      >
                        Booking
                      </Link>
                    </div>
                  </article>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
