"use client";

import Image from "next/image";
import { useState, type FormEvent, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AdminSidebar } from "./admin-sidebar";
import { adminQueryKeys, fetchAdminData } from "@/lib/admin/queries";

type PaymentOption = {
  id: string;
  method: "BANK_TRANSFER" | "QRIS";
  label: string;
  bankName: string | null;
  accountNumber: string | null;
  accountHolder: string | null;
  instructions: string | null;
  qrImageUrl: string | null;
  isActive: boolean;
  sortOrder: number;
};

type OptionForm = {
  method: PaymentOption["method"];
  label: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  instructions: string;
  sortOrder: string;
  isActive: boolean;
};

const EMPTY_FORM: OptionForm = {
  method: "BANK_TRANSFER",
  label: "",
  bankName: "",
  accountNumber: "",
  accountHolder: "",
  instructions: "",
  sortOrder: "0",
  isActive: true,
};

function optionFormData(form: OptionForm, qrImage: File | null) {
  const data = new FormData();
  for (const [key, value] of Object.entries(form)) {
    data.append(key, String(value));
  }
  if (qrImage) data.append("qrImage", qrImage);
  return data;
}

function PageFrame({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground antialiased">
      <AdminSidebar activeTab="payment-options" />
      <main className="min-h-screen min-w-0 pl-0 lg:pl-72">
        <header className="sticky top-0 z-30 flex min-h-16 items-center border-b border-border bg-card/95 pl-14 pr-4 backdrop-blur-md sm:px-6 sm:pl-16 lg:pl-6">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">
            Admin <span className="mx-2 text-subtle">/</span> Payment Options
          </div>
        </header>
        <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}

export function AdminPaymentOptionsWorkbench() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<OptionForm>(EMPTY_FORM);
  const [qrImage, setQrImage] = useState<File | null>(null);
  const [formError, setFormError] = useState("");

  const optionsQuery = useQuery({
    queryKey: adminQueryKeys.paymentOptions.all,
    queryFn: () => fetchAdminData<PaymentOption[]>("/api/admin/payment-options"),
  });
  const currentEditingOption = optionsQuery.data?.find((option) => option.id === editingId);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(
        editingId
          ? `/api/admin/payment-options/${encodeURIComponent(editingId)}`
          : "/api/admin/payment-options",
        {
          method: editingId ? "PATCH" : "POST",
          body: optionFormData(form, qrImage),
        },
      );
      return fetchAdminDataFromResponse(response);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: adminQueryKeys.paymentOptions.all });
      setEditingId(null);
      setForm(EMPTY_FORM);
      setQrImage(null);
      setFormError("");
    },
    onError: (error) => setFormError(error.message),
  });

  const toggleMutation = useMutation({
    mutationFn: async (option: PaymentOption) => {
      const updatedForm: OptionForm = {
        method: option.method,
        label: option.label,
        bankName: option.bankName ?? "",
        accountNumber: option.accountNumber ?? "",
        accountHolder: option.accountHolder ?? "",
        instructions: option.instructions ?? "",
        sortOrder: String(option.sortOrder),
        isActive: !option.isActive,
      };
      const response = await fetch(`/api/admin/payment-options/${encodeURIComponent(option.id)}`, {
        method: "PATCH",
        body: optionFormData(updatedForm, null),
      });
      return fetchAdminDataFromResponse(response);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminQueryKeys.paymentOptions.all }),
  });

  const resetForm = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setQrImage(null);
    setFormError("");
  };

  const editOption = (option: PaymentOption) => {
    setEditingId(option.id);
    setForm({
      method: option.method,
      label: option.label,
      bankName: option.bankName ?? "",
      accountNumber: option.accountNumber ?? "",
      accountHolder: option.accountHolder ?? "",
      instructions: option.instructions ?? "",
      sortOrder: String(option.sortOrder),
      isActive: option.isActive,
    });
    setQrImage(null);
    setFormError("");
  };

  const submitForm = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");
    saveMutation.mutate();
  };

  return (
    <PageFrame>
      <section className="border border-border bg-card p-6">
        <div className="mb-5">
          <h1 className="font-heading text-2xl font-bold uppercase">Metode pembayaran</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Kelola transfer bank dan QRIS untuk semua cabang. Opsi nonaktif tetap tersimpan untuk riwayat pembayaran.
          </p>
        </div>
        <form onSubmit={submitForm} className="grid gap-4 md:grid-cols-2">
          <label className="space-y-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Metode
            <select
              value={form.method}
              onChange={(event) => {
                setForm({ ...form, method: event.target.value as PaymentOption["method"] });
                setQrImage(null);
              }}
              className="block w-full border border-border bg-background p-3 text-sm text-foreground"
            >
              <option value="BANK_TRANSFER">Transfer bank</option>
              <option value="QRIS">QRIS</option>
            </select>
          </label>
          <label className="space-y-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Label
            <input
              required
              maxLength={100}
              value={form.label}
              onChange={(event) => setForm({ ...form, label: event.target.value })}
              placeholder={form.method === "QRIS" ? "Contoh: QRIS Zeus" : "Contoh: BCA"}
              className="block w-full border border-border bg-background p-3 text-sm text-foreground"
            />
          </label>
          {form.method === "BANK_TRANSFER" ? (
            <>
              <label className="space-y-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Nama bank
                <input required value={form.bankName} onChange={(event) => setForm({ ...form, bankName: event.target.value })} className="block w-full border border-border bg-background p-3 text-sm text-foreground" />
              </label>
              <label className="space-y-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Nomor rekening
                <input required value={form.accountNumber} onChange={(event) => setForm({ ...form, accountNumber: event.target.value })} className="block w-full border border-border bg-background p-3 text-sm text-foreground" />
              </label>
              <label className="space-y-1 text-xs font-bold uppercase tracking-wider text-muted-foreground md:col-span-2">
                Atas nama
                <input required value={form.accountHolder} onChange={(event) => setForm({ ...form, accountHolder: event.target.value })} className="block w-full border border-border bg-background p-3 text-sm text-foreground" />
              </label>
            </>
          ) : (
            <label className="space-y-1 text-xs font-bold uppercase tracking-wider text-muted-foreground md:col-span-2">
              Gambar QRIS {editingId ? "(unggah untuk mengganti)" : ""}
              <input
                key={`${editingId ?? "new"}-${form.method}`}
                required={!editingId || !currentEditingOption?.qrImageUrl}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) => setQrImage(event.target.files?.[0] ?? null)}
                className="block w-full border border-border bg-background p-3 text-sm text-foreground"
              />
              <span className="block normal-case text-muted-foreground">JPEG, PNG, atau WebP, maksimal 5 MB.</span>
            </label>
          )}
          <label className="space-y-1 text-xs font-bold uppercase tracking-wider text-muted-foreground md:col-span-2">
            Instruksi (opsional)
            <textarea
              maxLength={500}
              rows={3}
              value={form.instructions}
              onChange={(event) => setForm({ ...form, instructions: event.target.value })}
              className="block w-full border border-border bg-background p-3 text-sm text-foreground"
            />
          </label>
          <label className="space-y-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Urutan tampil
            <input
              type="number"
              min={0}
              max={10000}
              value={form.sortOrder}
              onChange={(event) => setForm({ ...form, sortOrder: event.target.value })}
              className="block w-full border border-border bg-background p-3 text-sm text-foreground"
            />
          </label>
          <label className="flex items-center gap-2 self-end pb-3 text-sm text-foreground">
            <input type="checkbox" checked={form.isActive} onChange={(event) => setForm({ ...form, isActive: event.target.checked })} />
            Tampilkan ke pelanggan
          </label>
          {formError && (
            <p role="alert" className="border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive md:col-span-2">{formError}</p>
          )}
          <div className="flex gap-2 md:col-span-2">
            <button type="submit" disabled={saveMutation.isPending} className="bg-primary text-primary-foreground px-5 py-3 text-xs font-bold uppercase tracking-wider disabled:opacity-50">
              {saveMutation.isPending ? "Menyimpan…" : editingId ? "Simpan perubahan" : "Tambah metode"}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} className="border border-subtle px-5 py-3 text-xs font-bold uppercase tracking-wider">
                Batal
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="space-y-3">
        <h2 className="font-heading text-xl font-bold uppercase">Daftar metode tersimpan</h2>
        {optionsQuery.isPending ? (
          <p className="text-sm text-muted-foreground">Memuat metode pembayaran…</p>
        ) : optionsQuery.isError ? (
          <p role="alert" className="border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
            Gagal memuat opsi pembayaran: {optionsQuery.error.message}
          </p>
        ) : optionsQuery.data.length === 0 ? (
          <p className="border border-border bg-card p-4 text-sm text-muted-foreground">
            Belum ada metode pembayaran.
          </p>
        ) : optionsQuery.data.map((option) => (
          <article key={option.id} className="flex flex-col gap-4 border border-border bg-card p-4 sm:flex-row sm:items-center">
            {option.qrImageUrl && (
              <Image src={option.qrImageUrl} alt={`QR ${option.label}`} width={80} height={80} unoptimized className="h-20 w-20 bg-white object-contain p-1" />
            )}
            <div className="min-w-0 flex-1 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <strong>{option.label}</strong>
                <span className="border border-subtle px-2 py-0.5 text-[10px] uppercase">{option.method === "QRIS" ? "QRIS" : "Transfer bank"}</span>
                <span className={`px-2 py-0.5 text-[10px] uppercase ${option.isActive ? "bg-success/10 text-success" : "bg-muted text-subtle-foreground"}`}>
                  {option.isActive ? "Aktif" : "Nonaktif"}
                </span>
              </div>
              {option.method === "BANK_TRANSFER" && (
                <p className="mt-1 text-muted-foreground">{option.bankName} · {option.accountNumber} · a.n. {option.accountHolder}</p>
              )}
              {option.method === "QRIS" && !option.qrImageUrl && (
                <p role="alert" className="mt-1 text-destructive">Gambar QRIS tidak ditemukan. Edit opsi ini dan unggah ulang gambarnya.</p>
              )}
              {option.instructions && <p className="mt-1 whitespace-pre-wrap text-xs text-muted-foreground">{option.instructions}</p>}
              <p className="mt-1 text-xs text-muted-foreground">Urutan: {option.sortOrder}</p>
            </div>
            <div className="flex shrink-0 gap-2">
              <button type="button" onClick={() => editOption(option)} className="border border-subtle px-3 py-2 text-xs font-bold uppercase">
                Edit
              </button>
              <button
                type="button"
                onClick={() => toggleMutation.mutate(option)}
                disabled={toggleMutation.isPending}
                className="border border-subtle px-3 py-2 text-xs font-bold uppercase disabled:opacity-50"
              >
                {option.isActive ? "Nonaktifkan" : "Aktifkan"}
              </button>
            </div>
          </article>
        ))}
        {toggleMutation.isError && (
          <p role="alert" className="border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{toggleMutation.error.message}</p>
        )}
      </section>
    </PageFrame>
  );
}

async function fetchAdminDataFromResponse(response: Response) {
  const body = await response.json().catch(() => null) as
    | { data: unknown; error?: { message?: string } }
    | { error?: { message?: string } }
    | null;
  if (!response.ok) throw new Error(body?.error?.message || `Request failed (${response.status})`);
  if (!body || !("data" in body)) throw new Error("Server returned an invalid response.");
  return body.data;
}
