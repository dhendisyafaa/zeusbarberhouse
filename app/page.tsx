import { connection } from "next/server";
import { Navbar } from "@/components/home/navbar";
import { HeroSection } from "@/components/home/hero-section";
import { CheckerboardDivider } from "@/components/home/checkerboard-divider";
import { ServicesSection } from "@/components/home/services-section";
import { BarbersSection } from "@/components/home/barbers-section";
import { BranchesSection } from "@/components/home/branches-section";
import { MembershipSection } from "@/components/home/membership-section";
import { GallerySection } from "@/components/home/gallery-section";
import { FeedbackSection } from "@/components/home/feedback-section";
import { Footer } from "@/components/home/footer";
import { StructuredData } from "@/components/seo/structured-data";
import { getHomePageData } from "@/lib/public-data";
import { buildSiteStructuredData } from "@/lib/structured-data";

export default async function Home() {
  await connection();
  const data = await getHomePageData();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <StructuredData
        data={buildSiteStructuredData({
          branches: data.branches,
          services: data.services,
        })}
      />
      <Navbar />
      <main className="flex-1 w-full flex flex-col">
        <HeroSection
          branchCount={data.branches.length}
          barberCount={data.barberCount}
        />
        <CheckerboardDivider variant="crimson" />
        <ServicesSection services={data.services} />
        <BarbersSection barbers={data.barbers} />
        <GallerySection items={[]} />
        <BranchesSection branches={data.branches} />
        <MembershipSection
          pointsPerCompletedBooking={data.pointsPerCompletedBooking}
        />
        <FeedbackSection />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
