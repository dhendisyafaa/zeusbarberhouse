import type { Metadata } from 'next';
import { CustomerAuthForm } from '@/components/customer/customer-auth-form';

export const metadata: Metadata = {
  title: 'Daftar Member | Zeus BarberHouse',
  robots: { index: false, follow: false },
};

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10 text-foreground">
      <section className="w-full max-w-md space-y-6 border border-border bg-card p-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-info">
            Zeus BarberHouse
          </p>
          <h1 className="mt-2 text-2xl font-bold">Buat akun member</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Daftar gratis dengan akun Google aktif untuk otomatis menjadi member Zeus.
          </p>
        </div>
        <CustomerAuthForm mode="register" error={params.error} />
      </section>
    </main>
  );
}
