import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { connection } from 'next/server';
import { PublicPageFrame } from '@/components/home/public-page-frame';
import { getPublicHaircutModels } from '@/lib/public-data';

export const metadata: Metadata = {
  title: 'Inspirasi Model Rambut | Zeus BarberHouse',
  description: 'Lihat model haircut yang tersedia dari barber Zeus.',
};

export default async function HaircutModelsPage() {
  await connection();
  const models = await getPublicHaircutModels();
  return (
    <PublicPageFrame>
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <header className="mb-8 border-b border-[#27272A] pb-6">
          <p className="text-xs font-bold uppercase tracking-widest text-[#0033A0]">Haircut gallery</p>
          <h1 className="mt-2 font-heading text-3xl font-extrabold uppercase sm:text-5xl">
            Inspirasi Model Rambut
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-[#A1A1AA]">
            Pilih referensi yang kamu suka dan bawa saat booking.
          </p>
        </header>
        {models.length === 0 ? (
          <p className="border border-[#27272A] bg-[#1A1A1D] p-6 text-sm text-[#A1A1AA]">
            Belum ada foto model rambut yang tersedia.
          </p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {models.map((model) => (
              <article key={model.id} className="overflow-hidden border border-[#27272A] bg-[#1A1A1D]">
                <div className="relative aspect-[4/3] bg-[#111113]">
                  {model.imageUrl ? (
                    <Image
                      src={model.imageUrl}
                      alt={model.title}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center px-6 text-center text-sm text-[#A1A1AA]">
                      Foto model ini belum tersedia.
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h2 className="font-heading text-xl font-bold uppercase">{model.title}</h2>
                  {model.description && (
                    <p className="mt-2 whitespace-pre-wrap text-sm text-[#A1A1AA]">
                      {model.description}
                    </p>
                  )}
                  <Link
                    href="/booking"
                    className="mt-4 inline-flex border border-[#0033A0] bg-[#0033A0] px-4 py-2.5 text-xs font-bold uppercase hover:bg-[#FAFAFA] hover:text-[#09090B]"
                  >
                    Booking
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </PublicPageFrame>
  );
}
