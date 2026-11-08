'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { ApiResponseError, customerQueryKeys, fetchApiData } from '@/lib/queries/api';

type CustomerProfile = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
};

type ProfileResponse = {
  profile: { id: string; role: string };
  customer: CustomerProfile;
};

type Booking = {
  id: string;
  status: string;
  startsAt: string;
  createdAt: string;
  branch: { id: string; name: string };
  barber: { id: string; name: string };
  items: {
    id: string;
    serviceNameSnapshot: string;
    unitPriceRupiahSnapshot: number;
    durationMinutesSnapshot: number;
  }[];
};

type Membership = {
  id: string;
  status: string;
  activatedAt: string;
  expiresAt: string | null;
  pointBalance: number;
  recentTransactions: { id: string; deltaPoints: number; reason: string; createdAt: string }[];
} | null;

type Transaction = {
  id: string;
  status: string;
  totalAmountRupiah: number;
  createdAt: string;
  branch: { id: string; name: string };
  items: { nameSnapshot: string; quantity: number; unitPriceRupiahSnapshot: number }[];
  payments: { method: string; status: string; amountRupiah: number }[];
};

const fieldClass = 'mt-1 w-full border border-[#27272A] bg-[#09090B] px-3 py-2.5 text-sm text-[#FAFAFA] outline-none focus:border-[#0033A0]';

function ProfileEditor({ profile }: { profile: CustomerProfile }) {
  const [name, setName] = useState(profile.name);
  const [email] = useState(profile.email ?? '');
  const [phone, setPhone] = useState(profile.phone ?? '');
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: () =>
      fetchApiData<CustomerProfile>('/api/customer/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone }),
      }),
    onSuccess: async (customer) => {
      queryClient.setQueryData<ProfileResponse>(customerQueryKeys.profile, (previous) =>
        previous ? { ...previous, customer } : previous,
      );
      await queryClient.invalidateQueries({ queryKey: customerQueryKeys.profile });
    },
  });

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    mutation.mutate();
  };

  return (
    <section className="border border-[#27272A] bg-[#1A1A1D]">
      <h2 className="border-b border-[#27272A] px-5 py-4 font-heading text-lg font-bold uppercase">Profil</h2>
      <form onSubmit={submit} className="grid gap-4 p-5 sm:grid-cols-2">
        <label className="text-xs font-bold uppercase text-[#A1A1AA]">
          Nama
          <input required maxLength={100} value={name} onChange={(event) => setName(event.target.value)} className={fieldClass} />
        </label>
        <label className="text-xs font-bold uppercase text-[#A1A1AA]">
          Nomor telepon
          <input type="tel" minLength={5} maxLength={20} value={phone} onChange={(event) => setPhone(event.target.value)} className={fieldClass} />
        </label>
        <label className="text-xs font-bold uppercase text-[#A1A1AA] sm:col-span-2">
          Email akun Google
          <input type="email" maxLength={254} value={email} readOnly className={`${fieldClass} cursor-not-allowed opacity-70`} />
        </label>
        {mutation.error && (
          <p role="alert" className="text-sm text-red-300 sm:col-span-2">{mutation.error.message}</p>
        )}
        {mutation.isSuccess && (
          <p role="status" className="text-sm text-emerald-300 sm:col-span-2">Profil berhasil diperbarui.</p>
        )}
        <button
          type="submit"
          disabled={mutation.isPending}
          className="justify-self-start bg-[#0033A0] px-5 py-3 text-xs font-bold uppercase tracking-wider disabled:opacity-60 sm:col-span-2"
        >
          {mutation.isPending ? 'Menyimpan…' : 'Simpan profil'}
        </button>
      </form>
    </section>
  );
}

function SectionLoading({ label }: { label: string }) {
  return <p role="status" className="p-5 text-sm text-[#A1A1AA]">Memuat {label}…</p>;
}

function SectionError({ label, onRetry }: { label: string; onRetry: () => void }) {
  return (
    <div role="alert" className="p-5 text-sm text-red-200">
      {label} gagal dimuat.{" "}
      <button type="button" onClick={onRetry} className="underline">Coba lagi</button>
    </div>
  );
}

export function CustomerAccountWorkbench() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const profileQuery = useQuery({
    queryKey: customerQueryKeys.profile,
    queryFn: () => fetchApiData<ProfileResponse>('/api/customer/profile'),
  });
  const bookingsQuery = useQuery({
    queryKey: customerQueryKeys.bookings,
    queryFn: () => fetchApiData<Booking[]>('/api/customer/bookings?page=1&limit=100'),
    enabled: Boolean(profileQuery.data),
  });
  const membershipQuery = useQuery({
    queryKey: customerQueryKeys.membership,
    queryFn: () => fetchApiData<Membership>('/api/customer/membership'),
    enabled: Boolean(profileQuery.data),
  });
  const transactionsQuery = useQuery({
    queryKey: customerQueryKeys.transactions,
    queryFn: () => fetchApiData<Transaction[]>('/api/customer/transactions?page=1&limit=100'),
    enabled: Boolean(profileQuery.data),
  });
  const logoutMutation = useMutation({
    mutationFn: () => fetchApiData<{ signedOut: boolean }>('/api/auth/logout', { method: 'POST' }),
    onSuccess: () => {
      queryClient.clear();
      router.replace('/login');
    },
  });

  if (profileQuery.isPending) {
    return <main className="mx-auto max-w-7xl px-4 py-16 text-sm text-[#A1A1AA] sm:px-6 lg:px-8" role="status">Memuat akun…</main>;
  }
  if (profileQuery.error instanceof ApiResponseError &&
      (profileQuery.error.status === 401 || profileQuery.error.status === 403)) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
        <h1 className="font-heading text-3xl font-bold uppercase">Masuk untuk melihat akun</h1>
        <p className="mt-3 text-sm text-[#A1A1AA]">Profil, membership, booking, dan transaksi hanya dapat dilihat oleh pemilik akun.</p>
        <Link href="/login" className="mt-6 inline-block bg-[#0033A0] px-6 py-3 text-xs font-bold uppercase">Masuk dengan Google</Link>
      </main>
    );
  }
  if (profileQuery.isError || !profileQuery.data) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
        <p role="alert" className="flex items-center justify-center gap-2 text-sm text-red-300">
          <AlertCircle className="h-4 w-4" />
          {profileQuery.error instanceof Error ? profileQuery.error.message : 'Profil akun tidak dapat dimuat.'}
        </p>
        <button type="button" onClick={() => void profileQuery.refetch()} className="mt-4 underline">Coba lagi</button>
      </main>
    );
  }

  const customer = profileQuery.data.customer;
  const membership = membershipQuery.data;
  const bookings = bookingsQuery.data ?? [];
  const transactions = transactionsQuery.data ?? [];
  const hasBackgroundRefresh = [
    profileQuery,
    bookingsQuery,
    membershipQuery,
    transactionsQuery,
  ].some((query) => query.isFetching && !query.isPending);

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-[#27272A] pb-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[#0033A0]">Area pelanggan</p>
          <h1 className="mt-2 font-heading text-3xl font-extrabold uppercase sm:text-5xl">
            Halo, {customer.name}
          </h1>
          <p className="mt-2 text-sm text-[#A1A1AA]">Data yang tampil hanya milik akun kamu.</p>
        </div>
        <button
          type="button"
          disabled={logoutMutation.isPending}
          onClick={() => logoutMutation.mutate()}
          className="border border-[#52525B] px-4 py-2.5 text-xs font-bold uppercase hover:border-[#FF2A2A]"
        >
          {logoutMutation.isPending ? 'Keluar…' : 'Keluar'}
        </button>
      </header>
      {logoutMutation.error && <p role="alert" className="text-sm text-red-300">{logoutMutation.error.message}</p>}
      {hasBackgroundRefresh && (
        <p role="status" className="flex items-center gap-2 text-xs text-[#A1A1AA]">
          <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Memperbarui data akun…
        </p>
      )}
      <ProfileEditor profile={customer} />

      <section className="border border-[#27272A] bg-[#1A1A1D]">
        <h2 className="border-b border-[#27272A] px-5 py-4 font-heading text-lg font-bold uppercase">Membership & poin</h2>
        {membershipQuery.isPending ? <SectionLoading label="membership" /> : membershipQuery.isError ? (
          <SectionError label="Membership" onRetry={() => void membershipQuery.refetch()} />
        ) : membership ? (
          <div className="grid gap-4 p-5 sm:grid-cols-3">
            <div><p className="text-xs uppercase text-[#A1A1AA]">Status</p><p className="mt-1 font-bold">{membership.status}</p></div>
            <div><p className="text-xs uppercase text-[#A1A1AA]">Saldo poin</p><p className="mt-1 font-heading text-2xl font-bold">{membership.pointBalance.toLocaleString('id-ID')}</p></div>
            <div><p className="text-xs uppercase text-[#A1A1AA]">Berlaku sampai</p><p className="mt-1 font-bold">{membership.expiresAt ? new Date(membership.expiresAt).toLocaleDateString('id-ID') : 'Tanpa batas waktu'}</p></div>
            <div className="border-t border-[#27272A] pt-3 sm:col-span-3">
              <h3 className="text-xs font-bold uppercase text-[#A1A1AA]">Riwayat poin terbaru</h3>
              {membership.recentTransactions.length ? (
                <ul className="mt-2 divide-y divide-[#27272A]">
                  {membership.recentTransactions.map((entry) => (
                    <li key={entry.id} className="flex justify-between gap-4 py-2 text-sm">
                      <span>{entry.reason}</span><span className={entry.deltaPoints >= 0 ? 'text-emerald-300' : 'text-red-300'}>{entry.deltaPoints > 0 ? '+' : ''}{entry.deltaPoints}</span>
                    </li>
                  ))}
                </ul>
              ) : <p className="mt-2 text-sm text-[#A1A1AA]">Belum ada transaksi poin.</p>}
            </div>
          </div>
        ) : (
          <p className="p-5 text-sm text-[#A1A1AA]">Membership belum tersedia untuk akun ini.</p>
        )}
      </section>

      <section className="border border-[#27272A] bg-[#1A1A1D]">
        <h2 className="border-b border-[#27272A] px-5 py-4 font-heading text-lg font-bold uppercase">Riwayat booking</h2>
        {bookingsQuery.isPending ? <SectionLoading label="booking" /> : bookingsQuery.isError ? (
          <SectionError label="Booking" onRetry={() => void bookingsQuery.refetch()} />
        ) : bookings.length ? (
          <div className="divide-y divide-[#27272A]">
            {bookings.map((booking) => (
              <article key={booking.id} className="grid gap-3 p-5 sm:grid-cols-3">
                <div>
                  <p className="font-bold">{new Date(booking.startsAt).toLocaleString('id-ID')}</p>
                  <p className="mt-1 text-xs text-[#A1A1AA]">{booking.branch.name} · {booking.barber.name}</p>
                </div>
                <div className="text-sm text-[#A1A1AA]">
                  {booking.items.map((item) => <p key={item.id}>{item.serviceNameSnapshot}</p>)}
                </div>
                <span className="text-xs font-bold uppercase text-[#0033A0]">{booking.status}</span>
              </article>
            ))}
          </div>
        ) : <p className="p-5 text-sm text-[#A1A1AA]">Belum ada booking. <Link href="/booking" className="underline">Buat booking</Link>.</p>}
      </section>

      <section className="border border-[#27272A] bg-[#1A1A1D]">
        <h2 className="border-b border-[#27272A] px-5 py-4 font-heading text-lg font-bold uppercase">Riwayat transaksi</h2>
        {transactionsQuery.isPending ? <SectionLoading label="transaksi" /> : transactionsQuery.isError ? (
          <SectionError label="Transaksi" onRetry={() => void transactionsQuery.refetch()} />
        ) : transactions.length ? (
          <div className="divide-y divide-[#27272A]">
            {transactions.map((transaction) => (
              <article key={transaction.id} className="grid gap-3 p-5 sm:grid-cols-3">
                <div>
                  <p className="font-bold">Rp {transaction.totalAmountRupiah.toLocaleString('id-ID')}</p>
                  <p className="mt-1 text-xs text-[#A1A1AA]">{new Date(transaction.createdAt).toLocaleString('id-ID')} · {transaction.branch.name}</p>
                </div>
                <div className="text-sm text-[#A1A1AA]">
                  {transaction.items.map((item, index) => <p key={`${item.nameSnapshot}-${index}`}>{item.quantity}× {item.nameSnapshot}</p>)}
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-[#0033A0]">{transaction.status}</p>
                  {transaction.payments.map((payment, index) => (
                    <p key={`${payment.method}-${index}`} className="mt-1 text-xs text-[#A1A1AA]">{payment.method} · {payment.status}</p>
                  ))}
                </div>
              </article>
            ))}
          </div>
        ) : <p className="p-5 text-sm text-[#A1A1AA]">Belum ada transaksi.</p>}
      </section>
    </main>
  );
}
