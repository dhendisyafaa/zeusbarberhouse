import type { Metadata } from "next";
import { requireAdminPage } from "@/lib/admin/page-auth";
import { AdminDashboardWorkbench } from "@/components/admin/admin-dashboard-workbench";

export const metadata: Metadata = {
  title: "Admin Operations Console | Zeus BarberHouse",
  description: "HQ Operations Dashboard untuk manajemen booking, verifikasi pembayaran soft-lock, jadwal capster, dan ringkasan transaksi.",
};

export default async function AdminPage() {
  await requireAdminPage();
  return <AdminDashboardWorkbench />;
}
