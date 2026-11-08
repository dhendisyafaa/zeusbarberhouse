import { notFound } from "next/navigation";
import { AdminResourceWorkbench } from "@/components/admin/admin-resource-workbench";
import { requireAdminPage } from "@/lib/admin/page-auth";

const resources = [
  "bookings",
  "branches",
  "services",
  "barbers",
  "schedules",
  "haircut-models",
  "reports",
  "membership",
  "payment-options",
  "career",
] as const;

export default async function AdminResourcePage({
  params,
}: {
  params: Promise<{ resource: string }>;
}) {
  await requireAdminPage();
  const { resource } = await params;
  const selectedResource = resources.find((candidate) => candidate === resource);
  if (!selectedResource) notFound();

  return <AdminResourceWorkbench resource={selectedResource} />;
}
