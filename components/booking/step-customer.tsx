"use client";

import Link from "next/link";

interface BookingCustomerProfile {
  name: string;
  email: string | null;
  phone: string | null;
}

export interface CustomerFormData {
  name: string;
  phone: string;
  notes: string;
}

interface StepCustomerProps {
  formData: CustomerFormData;
  customer: BookingCustomerProfile | null;
  isCheckingProfile: boolean;
  profileError: string;
  onChange: (field: keyof CustomerFormData, value: string) => void;
  onRetryProfile: () => void;
}

const fieldClass =
  "w-full border border-[#27272A] bg-[#09090B] px-4 py-3 text-sm text-[#FAFAFA] outline-none transition-colors focus:border-[#0033A0]";

export function StepCustomer({
  formData,
  customer,
  isCheckingProfile,
  profileError,
  onChange,
  onRetryProfile,
}: StepCustomerProps) {
  const isMember = customer !== null;

  return (
    <section id="step-pelanggan" className="flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
        <div className="flex items-center gap-3">
          <span className="flex h-7 w-7 items-center justify-center bg-[#FAFAFA] font-heading text-sm font-bold text-[#09090B]">
            5
          </span>
          <h2 className="font-heading text-xl font-bold uppercase tracking-tight text-[#FAFAFA] sm:text-2xl">
            DATA PELANGGAN
          </h2>
        </div>
        {!isMember && !isCheckingProfile && (
          <span className="text-xs font-bold uppercase tracking-wider text-[#FF2A2A]">
            Wajib diisi
          </span>
        )}
      </div>
      {isCheckingProfile ? (
        <p role="status" className="border border-[#27272A] bg-[#1A1A1D] p-5 text-sm text-[#A1A1AA]">
          Memeriksa status akun…
        </p>
      ) : profileError ? (
        <div role="alert" className="border border-red-800 bg-red-950/30 p-5 text-sm text-red-200">
          <p>Data akun tidak dapat diperiksa. Coba lagi sebelum melanjutkan booking.</p>
          <button type="button" onClick={onRetryProfile} className="mt-3 font-semibold underline">
            Coba lagi
          </button>
        </div>
      ) : (
        <>
          {isMember ? (
            <p className="text-sm text-[#A1A1AA]">
              Booking akan terhubung ke akun member yang sedang login.
            </p>
          ) : (
            <p className="text-sm text-[#A1A1AA]">
              Sudah punya akun member?{" "}
              <Link href="/login" className="font-semibold text-[#FAFAFA] underline">
                Masuk dengan Google
              </Link>{" "}
              untuk menghubungkan booking ke akun member kamu.
            </p>
          )}
          <div className="grid gap-4 border border-[#27272A] bg-[#1A1A1D] p-5 md:grid-cols-2">
            {isMember ? (
              <div className="space-y-2 text-sm text-[#FAFAFA]">
                <p className="font-bold">{customer.name}</p>
                {customer.email && <p className="text-[#A1A1AA]">{customer.email}</p>}
                {customer.phone && <p className="text-[#A1A1AA]">{customer.phone}</p>}
                <p className="pt-1 text-xs text-[#A1A1AA]">
                  Data ini diambil dari profil akun. Untuk mengubahnya, buka halaman akun.
                </p>
              </div>
            ) : (
              <>
                <label className="text-xs font-bold uppercase tracking-wider text-[#FAFAFA]">
                  Nama lengkap *
                  <input
                    type="text"
                    autoComplete="name"
                    required
                    maxLength={100}
                    value={formData.name}
                    onChange={(event) => onChange("name", event.target.value)}
                    placeholder="Nama sesuai identitas"
                    className={`${fieldClass} mt-1.5`}
                  />
                </label>
                <label className="text-xs font-bold uppercase tracking-wider text-[#FAFAFA]">
                  Nomor WhatsApp *
                  <input
                    type="tel"
                    autoComplete="tel"
                    required
                    minLength={5}
                    maxLength={20}
                    value={formData.phone}
                    onChange={(event) => onChange("phone", event.target.value)}
                    placeholder="08xxxxxxxxxx"
                    className={`${fieldClass} mt-1.5`}
                  />
                </label>
              </>
            )}
            <label className="text-xs font-bold uppercase tracking-wider text-[#FAFAFA] md:col-span-2">
              Catatan potongan (opsional)
              <textarea
                rows={3}
                maxLength={500}
                value={formData.notes}
                onChange={(event) => onChange("notes", event.target.value)}
                placeholder="Contoh: low fade, bagian atas jangan terlalu pendek."
                className={`${fieldClass} mt-1.5 resize-y`}
              />
            </label>
          </div>
        </>
      )}
    </section>
  );
}
