import { connection } from "next/server";
import { Navbar } from "@/components/home/navbar";
import { HeroSection } from "@/components/home/hero-section";
import { CheckerboardDivider } from "@/components/home/checkerboard-divider";
import { ServicesSection } from "@/components/home/services-section";
import { BarbersSection } from "@/components/home/barbers-section";
import { BookingFeatureSection } from "@/components/home/booking-feature-section";
import { BranchesSection } from "@/components/home/branches-section";
import { MembershipSection } from "@/components/home/membership-section";
import { Footer } from "@/components/home/footer";
import { getHomePageData } from "@/lib/public-data";

export default async function Home() {
  await connection();
  const data = await getHomePageData();

  return (
    <div className="min-h-screen bg-[#09090B] text-[#FAFAFA] flex flex-col font-sans">
      <Navbar />
      <main className="flex-1 w-full flex flex-col">
        <HeroSection
          branchCount={data.branches.length}
          barberCount={data.barberCount}
        />
        <CheckerboardDivider variant="crimson" />
        <ServicesSection services={data.services} />
        <BarbersSection barbers={data.barbers} />

        {/* Section 3: 15-Minute Soft-Lock Booking Feature */}
        {/* <BookingFeatureSection /> */}

        {/* Section 4: 3 Official Branches */}
        <BranchesSection branches={data.branches} />

        {/* Section 5: VIP Membership Program */}
        <MembershipSection
          pointsPerCompletedBooking={data.pointsPerCompletedBooking}
        />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
