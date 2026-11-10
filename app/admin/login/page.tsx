import type { Metadata } from "next";
import { AdminLoginForm } from "@/components/admin/admin-login-form";

export const metadata: Metadata = {
  title: "Admin Login | Zeus BarberHouse",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
      <section className="w-full max-w-md space-y-6 rounded-lg border border-border bg-card p-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-info">
            Zeus BarberHouse
          </p>
          <h1 className="mt-2 text-2xl font-bold">Masuk dashboard admin</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Gunakan akun khusus admin yang diberikan oleh developer!
          </p>
        </div>
        <AdminLoginForm />
      </section>
    </main>
  );
}
