import { connection } from 'next/server';
import { BranchesSection } from '@/components/home/branches-section';
import { PublicPageFrame } from '@/components/home/public-page-frame';
import { getHomePageData } from '@/lib/public-data';

export default async function BranchesPage() {
  await connection();
  const { branches } = await getHomePageData();
  return (
    <PublicPageFrame>
      <BranchesSection branches={branches} />
    </PublicPageFrame>
  );
}
