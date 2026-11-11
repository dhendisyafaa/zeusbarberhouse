import type { Metadata } from "next";
import { connection } from "next/server";
import { ServicesSection } from "@/components/home/services-section";
import { PublicPageFrame } from "@/components/home/public-page-frame";
import { StructuredData } from "@/components/seo/structured-data";
import { getHomePageData } from "@/lib/public-data";
import { buildSiteStructuredData } from "@/lib/structured-data";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Layanan & Harga Potong Rambut Pria",
  description:
    "Daftar layanan dan harga Zeus BarberHouse: haircut, fade, pompadour, grooming, dan perawatan pria lainnya. Harga transparan dengan durasi layanan yang jelas.",
  alternates: {
    canonical: "/services",
  },
  openGraph: {
    title: "Layanan & Harga Zeus BarberHouse",
    description:
      "Haircut, fade, pompadour, grooming, dan perawatan pria dengan harga transparan.",
    url: "/services",
    images: [siteConfig.ogImage],
  },
};

export default async function ServicesPage() {
  await connection();
  const { services } = await getHomePageData();

  return (
    <PublicPageFrame>
      <StructuredData data={buildSiteStructuredData({ services })} />
      <ServicesSection services={services} />
    </PublicPageFrame>
  );
}
