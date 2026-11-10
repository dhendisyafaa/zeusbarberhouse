"use client";

import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AdminSidebar } from "./admin-sidebar";
import {
  adminQueryKeys,
  fetchAdminData,
  fetchAdminMembershipPoints,
  fetchAdminMembershipPolicy,
  fetchAdminMemberships,
} from "@/lib/admin/queries";

type Row = Record<string, unknown>;

function message(error: unknown) {
  return error instanceof Error ? error.message : "Permintaan gagal.";
}

function dateText(value: unknown) {
  return value ? new Date(String(value)).toLocaleDateString("id-ID") : "Tanpa batas";
}

export function AdminMembershipWorkbench() {
  const [status, setStatus] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [deltaPoints, setDeltaPoints] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const queryClient = useQueryClient();
  const membershipsQuery = useQuery({
    queryKey: adminQueryKeys.membership.list(status || "all"),
    queryFn: () => fetchAdminMemberships(status),
    placeholderData: (previous) => previous,
  });
  const policyQuery = useQuery({
    queryKey: adminQueryKeys.membership.policy,
    queryFn: fetchAdminMembershipPolicy,
  });
  const pointsQuery = useQuery({
    queryKey: adminQueryKeys.membership.points(selectedId),
    queryFn: () => fetchAdminMembershipPoints(selectedId),
    enabled: Boolean(selectedId),
    placeholderData: (previous) => previous,
  });
  const memberships = membershipsQuery.data || [];

  const invalidateMemberships = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.membership.all }),
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.reports.all }),
    ]);
  };
  const policyMutation = useMutation({
    mutationFn: (pointsPerCompletedBooking: number) =>
      fetchAdminData("/api/admin/memberships/policy", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pointsPerCompletedBooking }),
      }),
    onSuccess: async () => {
      setNotice("Kebijakan poin disimpan.");
      setError("");
      await queryClient.invalidateQueries({ queryKey: adminQueryKeys.membership.policy });
    },
    onError: (reason) => setError(message(reason)),
  });
  const pointsMutation = useMutation({
    mutationFn: ({ id, delta, note }: { id: string; delta: number; note: string }) =>
      fetchAdminData(`/api/admin/memberships/${encodeURIComponent(id)}/points`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deltaPoints: delta,
          reason: note,
          idempotencyKey: crypto.randomUUID(),
        }),
      }),
    onSuccess: async () => {
      setDeltaPoints("");
      setReason("");
      setNotice("Penyesuaian poin dicatat.");
      setError("");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: adminQueryKeys.membership.points(selectedId) }),
        queryClient.invalidateQueries({ queryKey: adminQueryKeys.membership.detail(selectedId) }),
      ]);
    },
    onError: (reason) => setError(message(reason)),
  });
  const expiryMutation = useMutation({
    mutationFn: ({ id, value }: { id: string; value: string }) =>
      fetchAdminData(`/api/admin/memberships/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          expiresAt: value ? new Date(`${value}T23:59:59.000+07:00`).toISOString() : null,
        }),
      }),
    onSuccess: async () => {
      setNotice("Tanggal kedaluwarsa diperbarui.");
      setError("");
      await invalidateMemberships();
    },
    onError: (reason) => setError(message(reason)),
  });

  const submitPolicy = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    policyMutation.mutate(Number(formData.get("pointsPerCompletedBooking")));
  };

  const submitPoints = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedId) return;
    pointsMutation.mutate({
      id: selectedId,
      delta: Number(deltaPoints),
      note: reason.trim(),
    });
  };

  const pointEntries = (pointsQuery.data?.entries || []) as Row[];
  const policyValue = Number(policyQuery.data?.pointsPerCompletedBooking ?? 0);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AdminSidebar activeTab="membership" />
      <main className="ml-0 min-w-0 space-y-6 px-4 pb-8 pt-16 sm:px-6 lg:ml-72 lg:py-8">
        <header>
          <h1 className="text-3xl font-bold uppercase">Membership & Poin</h1>
          <p className="mt-2 text-sm text-muted-foreground">Akun pelanggan otomatis menjadi member. Status menjadi kedaluwarsa saat masa berlaku yang ditentukan tercapai; tanggal kosong berarti tanpa batas.</p>
        </header>
        {error && <p role="alert" className="border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
        {notice && <p role="status" className="border border-success/40 bg-success/10 p-3 text-sm text-success">{notice}</p>}

        <section>
          <form onSubmit={submitPolicy} className="space-y-3 border border-border bg-card p-5">
            <h2 className="font-bold uppercase">Kebijakan poin</h2>
            <p className="text-xs text-muted-foreground">Poin yang diberikan untuk setiap booking anggota berstatus selesai.</p>
            <label className="block text-xs text-subtle-foreground">
              Poin per booking selesai
              <input
                name="pointsPerCompletedBooking"
                type="number"
                min="0"
                required
                defaultValue={policyValue}
                key={policyQuery.dataUpdatedAt}
                className="mt-1 w-full border border-border bg-background px-3 py-2"
              />
            </label>
            {policyQuery.isError && <p role="alert" className="text-xs text-destructive">{message(policyQuery.error)}</p>}
            <button disabled={policyMutation.isPending} className="bg-primary text-primary-foreground px-4 py-2 text-xs font-bold uppercase disabled:opacity-50">
              {policyMutation.isPending ? "Menyimpan…" : "Simpan kebijakan"}
            </button>
          </form>
        </section>

        <section className="border border-border bg-card">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4">
            <h2 className="font-bold uppercase">Daftar membership</h2>
            <select value={status} onChange={(event) => setStatus(event.target.value)} className="border border-border bg-background px-3 py-2 text-xs">
              <option value="">Semua status</option>
              <option value="ACTIVE">Aktif</option>
              <option value="INACTIVE">Nonaktif</option>
              <option value="EXPIRED">Kedaluwarsa</option>
            </select>
          </div>
          {membershipsQuery.error && <p role="alert" className="p-4 text-sm text-destructive">{message(membershipsQuery.error)}</p>}
          {membershipsQuery.isFetching && !membershipsQuery.isPending && <p role="status" className="px-4 pt-3 text-xs text-muted-foreground">Memperbarui daftar… Menampilkan data cache.</p>}
          {membershipsQuery.isPending ? <p className="p-6 text-sm text-muted-foreground">Memuat membership…</p> :
            memberships.length === 0 ? <p className="p-6 text-sm text-muted-foreground">Belum ada membership untuk filter ini.</p> : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-left text-sm">
                  <thead className="text-xs uppercase text-muted-foreground"><tr><th className="p-3">Pelanggan</th><th className="p-3">Status</th><th className="p-3">Aktif sejak</th><th className="p-3">Kedaluwarsa</th><th className="p-3">Detail</th></tr></thead>
                  <tbody className="divide-y divide-zinc-800">
                    {memberships.map((membership) => {
                      const customer = membership.customer as Row | undefined;
                      return (
                        <tr key={String(membership.id)} className="hover:bg-muted/50">
                          <td className="p-3"><div>{String(customer?.name || "Pelanggan")}</div><div className="text-xs text-subtle">{String(customer?.phone || customer?.email || "")}</div></td>
                          <td className="p-3">{String(membership.status)}</td>
                          <td className="p-3">{dateText(membership.activatedAt)}</td>
                          <td className="p-3">{dateText(membership.expiresAt)}</td>
                          <td className="p-3 whitespace-nowrap">
                            <button onClick={() => {
                              setSelectedId(String(membership.id));
                              setExpiresAt(membership.expiresAt ? new Date(String(membership.expiresAt)).toISOString().slice(0, 10) : "");
                            }} className="mr-3 text-xs text-info hover:text-foreground">Kelola</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
        </section>

        {selectedId && (
          <section className="border border-border bg-card p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-bold uppercase">Ledger poin</h2>
                <p className="mt-1 text-sm text-muted-foreground">Saldo ledger: <strong className="text-foreground">{pointsQuery.data?.pointBalance ?? "—"}</strong></p>
              </div>
              <button onClick={() => setSelectedId("")} className="border border-border px-3 py-2 text-xs">Tutup</button>
            </div>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                expiryMutation.mutate({ id: selectedId, value: expiresAt });
              }}
              className="my-4 flex flex-wrap items-end gap-3 border-b border-border pb-4"
            >
              <label className="text-xs text-subtle-foreground">Kedaluwarsa (kosong = tanpa batas)
                <input type="date" value={expiresAt} onChange={(event) => setExpiresAt(event.target.value)} className="mt-1 block border border-border bg-background px-3 py-2" />
              </label>
              <button disabled={expiryMutation.isPending} className="border border-border px-4 py-2 text-xs font-bold uppercase disabled:opacity-50">{expiryMutation.isPending ? "Menyimpan…" : "Simpan tanggal"}</button>
            </form>
            <form onSubmit={submitPoints} className="my-4 grid min-w-0 gap-3 sm:grid-cols-[minmax(0,180px)_minmax(0,1fr)] lg:grid-cols-[180px_minmax(0,1fr)_auto]">
              <label className="text-xs text-subtle-foreground">Delta poin (+/-)
                <input type="number" step="1" required value={deltaPoints} onChange={(event) => setDeltaPoints(event.target.value)} className="mt-1 w-full border border-border bg-background px-3 py-2" />
              </label>
              <label className="text-xs text-subtle-foreground">Alasan
                <input required maxLength={200} value={reason} onChange={(event) => setReason(event.target.value)} className="mt-1 w-full border border-border bg-background px-3 py-2" />
              </label>
              <button disabled={pointsMutation.isPending} className="w-full self-end bg-primary text-primary-foreground px-4 py-2 text-xs font-bold uppercase disabled:opacity-50 sm:col-span-2 sm:w-fit lg:col-span-1">{pointsMutation.isPending ? "Menyimpan…" : "Catat poin"}</button>
            </form>
            {pointsQuery.error && <p role="alert" className="text-sm text-destructive">{message(pointsQuery.error)}</p>}
            {pointsQuery.isFetching && !pointsQuery.isPending && <p role="status" className="mb-2 text-xs text-muted-foreground">Memperbarui ledger…</p>}
            {pointsQuery.isPending ? <p className="py-4 text-sm text-muted-foreground">Memuat ledger…</p> :
              pointEntries.length === 0 ? <p className="py-4 text-sm text-muted-foreground">Belum ada transaksi poin.</p> : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm"><thead className="text-xs uppercase text-muted-foreground"><tr><th className="p-2">Waktu</th><th className="p-2">Delta</th><th className="p-2">Alasan</th></tr></thead><tbody className="divide-y divide-zinc-800">
                    {pointEntries.map((entry) => <tr key={String(entry.id)}><td className="p-2">{new Date(String(entry.createdAt)).toLocaleString("id-ID")}</td><td className="p-2">{Number(entry.deltaPoints) > 0 ? "+" : ""}{String(entry.deltaPoints)}</td><td className="p-2">{String(entry.reason)}</td></tr>)}
                  </tbody></table>
                </div>
              )}
          </section>
        )}
      </main>
    </div>
  );
}
