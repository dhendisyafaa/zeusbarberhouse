import type { Metadata } from "next";
import { PublicPageFrame } from "@/components/home/public-page-frame";
import { CareerWorkbench } from "@/components/career/career-workbench";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Karier & Lowongan Capster Barbershop",
  description:
    "Gabung tim Zeus BarberHouse. Lihat lowongan capster dan posisi barbershop yang sedang dibuka di Bandung Raya, lalu kirim lamaran secara online.",
  alternates: {
    canonical: "/careers",
  },
  openGraph: {
    title: "Karier & Lowongan Capster Zeus BarberHouse",
    description:
      "Lowongan capster dan posisi barbershop di Bandung Raya. Kirim lamaran secara online.",
    url: "/careers",
    images: [siteConfig.ogImage],
  },
};

export default function CareersPage() {
  return (
    <PublicPageFrame>
      <CareerWorkbench />
    </PublicPageFrame>
  );
}
