import type { Metadata } from "next";
import { connection } from "next/server";
import { BranchesSection } from "@/components/home/branches-section";
import { PublicPageFrame } from "@/components/home/public-page-frame";
import { StructuredData } from "@/components/seo/structured-data";
import { getHomePageData } from "@/lib/public-data";
import { buildSiteStructuredData } from "@/lib/structured-data";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Cabang & Lokasi Barbershop di Bandung Raya",
  description:
    "Temukan lokasi Zeus BarberHouse terdekat di Bandung Raya. Lihat alamat lengkap, nomor telepon, jam operasional, dan petunjuk arah ke setiap cabang.",
  alternates: {
    canonical: "/branches",
  },
  openGraph: {
    title: "Cabang & Lokasi Zeus BarberHouse di Bandung Raya",
    description:
      "Alamat, jam operasional, dan petunjuk arah ke cabang Zeus BarberHouse di Bandung Raya.",
    url: "/branches",
    images: [siteConfig.ogImage],
  },
};

export default async function BranchesPage() {
  await connection();
  const { branches } = await getHomePageData();

  return (
    <PublicPageFrame>
      <StructuredData data={buildSiteStructuredData({ branches })} />
      <BranchesSection branches={branches} />
    </PublicPageFrame>
  );
}
