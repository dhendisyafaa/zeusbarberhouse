import type { Metadata } from "next";
import { PublicPageFrame } from "@/components/home/public-page-frame";
import { CustomerAccountWorkbench } from "@/components/customer/customer-account-workbench";

export const metadata: Metadata = {
  title: "Akun Member",
  description:
    "Kelola profil, riwayat booking, dan poin membership Zeus BarberHouse.",
  alternates: {
    canonical: "/account",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function CustomerAccountPage() {
  return (
    <PublicPageFrame>
      <CustomerAccountWorkbench />
    </PublicPageFrame>
  );
}
