import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ImageIcon } from "lucide-react";

type GalleryItem = {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
};

export function GallerySection({ items }: { items: GalleryItem[] }) {
  return (
    <section
      id="gallery"
      className="w-full border-t border-border bg-background py-24"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-5">
          <div>
            <h2 className="mt-3 font-heading text-4xl font-extrabold uppercase text-foreground sm:text-5xl">
              Galeri <span className="text-primary">Zeus</span>
            </h2>
          </div>
          <Link
            href="/haircut-models"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground transition hover:text-foreground"
          >
            Lihat semua <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="flex min-h-56 items-center justify-center rounded-3xl border border-dashed border-border bg-card text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <ImageIcon className="h-4 w-4" /> Galeri segera hadir.
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {items.slice(0, 4).map((item) => (
              <article
                key={item.id}
                className="group relative aspect-[4/5] overflow-hidden rounded-3xl border border-border bg-card"
              >
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    fill
                    unoptimized
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    <ImageIcon />
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 pt-12">
                  <h3 className="font-heading text-lg font-bold uppercase text-white">
                    {item.title}
                  </h3>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
