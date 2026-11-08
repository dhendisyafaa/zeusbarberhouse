import type { Metadata } from 'next';
import { CustomerAuthForm } from '@/components/customer/customer-auth-form';

export const metadata: Metadata = {
  title: 'Masuk Member | Zeus BarberHouse',
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 py-10 text-zinc-50">
      <section className="w-full max-w-md space-y-6 border border-zinc-800 bg-zinc-900 p-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">
            Zeus BarberHouse
          </p>
          <h1 className="mt-2 text-2xl font-bold">Masuk akun member</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Masuk dengan akun Google yang terhubung dengan membership Zeus.
          </p>
        </div>
        <CustomerAuthForm mode="login" error={params.error} />
      </section>
    </main>
  );
}
