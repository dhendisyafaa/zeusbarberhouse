import { redirect } from "next/navigation";
import { AppError } from "@/lib/api/errors";
import { requireAdmin } from "@/lib/api/auth";

export async function requireAdminPage() {
  try {
    await requireAdmin();
  } catch (error) {
    if (error instanceof AppError && (error.status === 401 || error.status === 403)) {
      redirect("/admin/login");
    }
    throw error;
  }
}
