import { connection } from 'next/server';
import { ServicesSection } from '@/components/home/services-section';
import { PublicPageFrame } from '@/components/home/public-page-frame';
import { getHomePageData } from '@/lib/public-data';

export default async function ServicesPage() {
  await connection();
  const { services } = await getHomePageData();
  return (
    <PublicPageFrame>
      <ServicesSection services={services} />
    </PublicPageFrame>
  );
}
