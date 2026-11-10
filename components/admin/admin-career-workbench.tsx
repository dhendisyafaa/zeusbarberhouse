"use client";

import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AdminSidebar } from "./admin-sidebar";
import {
  adminQueryKeys,
  fetchAdminApplications,
  fetchAdminData,
  fetchAdminVacancies,
} from "@/lib/admin/queries";

type Row = Record<string, unknown>;
type VacancyForm = { title: string; description: string; closesAt: string };
const EMPTY_FORM: VacancyForm = { title: "", description: "", closesAt: "" };
const TRANSITIONS: Record<string, string[]> = {
  SUBMITTED: ["ACCEPTED", "REJECTED"],
  REVIEWING: ["ACCEPTED", "REJECTED"],
  ACCEPTED: [],
  REJECTED: [],
};

function message(error: unknown) {
  return error instanceof Error ? error.message : "Permintaan gagal.";
}

export function AdminCareerWorkbench() {
  const [tab, setTab] = useState<"vacancies" | "applications">("vacancies");
  const [editing, setEditing] = useState<Row | null>(null);
  const [form, setForm] = useState<VacancyForm>(EMPTY_FORM);
  const [status, setStatus] = useState("");
  const [vacancyFilter, setVacancyFilter] = useState("");
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const queryClient = useQueryClient();
  const vacanciesQuery = useQuery({
    queryKey: adminQueryKeys.career.vacancies,
    queryFn: fetchAdminVacancies,
    placeholderData: (previous) => previous,
  });
  const applicationsQuery = useQuery({
    queryKey: adminQueryKeys.career.applications({ status, vacancyId: vacancyFilter }),
    queryFn: () => fetchAdminApplications({ status, vacancyId: vacancyFilter }),
    placeholderData: (previous) => previous,
  });
  const vacancies = vacanciesQuery.data || [];
  const applications = applicationsQuery.data || [];

  const mutation = useMutation({
    mutationFn: ({ url, method, body }: { url: string; method: string; body?: unknown }) =>
      fetchAdminData(url, {
        method,
        ...(body !== undefined ? {
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        } : {}),
      }),
    onSuccess: async () => {
      setError("");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: adminQueryKeys.career.all }),
        queryClient.invalidateQueries({ queryKey: adminQueryKeys.reports.all }),
      ]);
    },
    onError: (reason) => setError(message(reason)),
  });

  const submitVacancy = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setNotice("");
    try {
      await mutation.mutateAsync({
        url: editing ? `/api/admin/career/vacancies/${encodeURIComponent(String(editing.id))}` : "/api/admin/career/vacancies",
        method: editing ? "PATCH" : "POST",
        body: {
          title: form.title.trim(),
          description: form.description.trim(),
          closesAt: form.closesAt ? new Date(`${form.closesAt}T23:59:59.000+07:00`).toISOString() : null,
        },
      });
      setNotice(editing ? "Lowongan diperbarui." : "Lowongan dibuat.");
      setEditing(null);
      setForm(EMPTY_FORM);
    } catch (reason) {
      setError(message(reason));
    }
  };

  const editVacancy = (vacancy: Row) => {
    setEditing(vacancy);
    setForm({
      title: String(vacancy.title),
      description: String(vacancy.description),
      closesAt: vacancy.closesAt ? new Date(String(vacancy.closesAt)).toISOString().slice(0, 10) : "",
    });
    setNotice("");
  };

  const updateApplication = async (application: Row, nextStatus: string) => {
    setError("");
    setNotice("");
    try {
      await mutation.mutateAsync({
        url: `/api/admin/career/applications/${encodeURIComponent(String(application.id))}`,
        method: "PATCH",
        body: { status: nextStatus, note: notes[String(application.id)] || undefined },
      });
      setNotice(nextStatus === "ACCEPTED"
        ? `Lamaran ${String(application.name)} diterima. Silakan hubungi pelamar sesuai kontak yang tersedia di CV/resume. Tidak ada notifikasi otomatis yang dikirim.`
        : `Lamaran ${String(application.name)} ditolak. Status ini hanya untuk catatan internal; tidak ada notifikasi otomatis yang dikirim.`);
    } catch (reason) {
      setError(message(reason));
    }
  };

  const openDocument = async (application: Row, document: Row) => {
    setError("");
    const popup = window.open("about:blank", "_blank");
    if (!popup) {
      setError("Izinkan pop-up untuk membuka dokumen lamaran.");
      return;
    }
    try {
      const result = await fetchAdminData<{ url: string }>(
        `/api/admin/career/applications/${encodeURIComponent(String(application.id))}/documents/${encodeURIComponent(String(document.id))}`,
      );
      popup.opener = null;
      popup.location.replace(result.url);
    } catch (reason) {
      popup.close();
      setError(message(reason));
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AdminSidebar activeTab="career" />
      <main className="ml-0 min-w-0 space-y-6 px-4 pb-8 pt-16 sm:px-6 lg:ml-72 lg:py-8">
        <header>
          <h1 className="text-3xl font-bold uppercase">Career</h1>
          <p className="mt-2 text-sm text-muted-foreground">Lowongan langsung terbit saat dibuat atau disimpan. Status lamaran hanya untuk catatan internal; tidak ada notifikasi otomatis ke pelamar.</p>
        </header>
        {error && <p role="alert" className="border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
        {notice && <p role="status" className="border border-success/40 bg-success/10 p-3 text-sm text-success">{notice}</p>}
        <div className="flex gap-2 border-b border-border">
          <button onClick={() => setTab("vacancies")} className={`px-4 py-3 text-xs font-bold uppercase ${tab === "vacancies" ? "border-b-2 border-primary text-foreground" : "text-muted-foreground"}`}>Lowongan</button>
          <button onClick={() => setTab("applications")} className={`px-4 py-3 text-xs font-bold uppercase ${tab === "applications" ? "border-b-2 border-primary text-foreground" : "text-muted-foreground"}`}>Lamaran</button>
        </div>

        {tab === "vacancies" ? (
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(300px,0.8fr)]">
            <section className="border border-border bg-card">
              <h2 className="border-b border-border p-4 font-bold uppercase">Daftar lowongan</h2>
              {vacanciesQuery.error && <p role="alert" className="p-4 text-sm text-destructive">{message(vacanciesQuery.error)}</p>}
              {vacanciesQuery.isFetching && !vacanciesQuery.isPending && <p role="status" className="p-3 text-xs text-muted-foreground">Memperbarui lowongan… Menampilkan data cache.</p>}
              {vacanciesQuery.isPending ? <p className="p-5 text-sm text-muted-foreground">Memuat lowongan…</p> :
                vacancies.length === 0 ? <p className="p-5 text-sm text-muted-foreground">Belum ada lowongan.</p> : (
                  <div className="divide-y divide-zinc-800">
                    {vacancies.map((vacancy) => (
                      <article key={String(vacancy.id)} className="p-4">
                        <div className="flex flex-wrap justify-between gap-2">
                          <div><h3 className="font-semibold">{String(vacancy.title)}</h3><p className="mt-1 text-xs text-muted-foreground">{Boolean(vacancy.isPublished) ? "Published" : "Draft — akan terbit saat disimpan"} · {Number(vacancy.applications || 0)} lamaran · tutup: {vacancy.closesAt ? new Date(String(vacancy.closesAt)).toLocaleDateString("id-ID") : "tidak ditentukan"}</p></div>
                          <button onClick={() => editVacancy(vacancy)} className="text-xs text-info hover:text-foreground">Edit</button>
                        </div>
                        <p className="mt-3 whitespace-pre-wrap text-sm text-subtle-foreground">{String(vacancy.description)}</p>
                      </article>
                    ))}
                  </div>
                )}
            </section>
            <form onSubmit={submitVacancy} className="h-fit space-y-4 border border-border bg-card p-5">
              <h2 className="font-bold uppercase">{editing ? "Edit lowongan" : "Buat lowongan"}</h2>
              <label className="block text-xs text-subtle-foreground">Judul
                <input required maxLength={200} value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} className="mt-1 w-full border border-border bg-background px-3 py-2" />
              </label>
              <label className="block text-xs text-subtle-foreground">Deskripsi
                <textarea required rows={8} value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} className="mt-1 w-full border border-border bg-background px-3 py-2" />
              </label>
              <label className="block text-xs text-subtle-foreground">Tanggal penutupan (opsional)
                <input type="date" value={form.closesAt} onChange={(event) => setForm((current) => ({ ...current, closesAt: event.target.value }))} className="mt-1 w-full border border-border bg-background px-3 py-2" />
              </label>
              <div className="flex gap-2">
                <button disabled={mutation.isPending} className="bg-primary text-primary-foreground px-4 py-2 text-xs font-bold uppercase disabled:opacity-50">{mutation.isPending ? "Menyimpan…" : editing ? "Simpan perubahan" : "Buat lowongan"}</button>
                {editing && <button type="button" onClick={() => { setEditing(null); setForm(EMPTY_FORM); }} className="border border-border px-4 py-2 text-xs">Batal</button>}
              </div>
            </form>
          </div>
        ) : (
          <section className="border border-border bg-card">
            <div className="flex flex-wrap gap-3 border-b border-border p-4">
              <select value={status} onChange={(event) => setStatus(event.target.value)} className="border border-border bg-background px-3 py-2 text-xs">
                <option value="">Semua status</option><option value="SUBMITTED">Diajukan</option><option value="ACCEPTED">Diterima</option><option value="REJECTED">Ditolak</option>
              </select>
              <select value={vacancyFilter} onChange={(event) => setVacancyFilter(event.target.value)} className="border border-border bg-background px-3 py-2 text-xs">
                <option value="">Semua lowongan</option>{vacancies.map((vacancy) => <option key={String(vacancy.id)} value={String(vacancy.id)}>{String(vacancy.title)}</option>)}
              </select>
            </div>
            {applicationsQuery.error && <p role="alert" className="p-4 text-sm text-destructive">{message(applicationsQuery.error)}</p>}
            {applicationsQuery.isFetching && !applicationsQuery.isPending && <p role="status" className="p-3 text-xs text-muted-foreground">Memperbarui lamaran… Menampilkan data cache.</p>}
            {applicationsQuery.isPending ? <p className="p-5 text-sm text-muted-foreground">Memuat lamaran…</p> :
              applications.length === 0 ? <p className="p-5 text-sm text-muted-foreground">Belum ada lamaran untuk filter ini.</p> : (
                <div className="divide-y divide-zinc-800">
                  {applications.map((application) => {
                    const documents = Array.isArray(application.documents) ? application.documents as Row[] : [];
                    const transitions = TRANSITIONS[String(application.status)] || [];
                    return (
                      <article key={String(application.id)} className="space-y-3 p-4">
                        <div className="flex flex-wrap justify-between gap-3">
                          <div className="min-w-0"><h3 className="font-semibold">{String(application.name)}</h3><p className="break-all text-xs text-muted-foreground">{String(application.email)} · {String(application.phone)} · {String((application.vacancy as Row | undefined)?.title || "Lowongan")}</p></div>
                          <span className="h-fit border border-border px-2 py-1 text-[10px] uppercase">{String(application.status)}</span>
                        </div>
                        {Boolean(application.message) && (
                          <p className="whitespace-pre-wrap text-sm text-subtle-foreground">
                            <span className="font-semibold text-foreground">Pengalaman: </span>
                            {String(application.message)}
                          </p>
                        )}
                        {documents.map((document) => (
                          <button key={String(document.id)} onClick={() => void openDocument(application, document)} className="block text-xs text-info underline hover:text-foreground">
                            Dokumen: {String(document.originalFileName)} ({Math.ceil(Number(document.sizeBytes) / 1024)} KB)
                          </button>
                        ))}
                        {transitions.length > 0 && (
                          <div className="flex flex-wrap items-end gap-2">
                            <label className="min-w-52 flex-1 text-[10px] uppercase text-muted-foreground">Catatan admin
                              <input maxLength={500} value={notes[String(application.id)] || ""} onChange={(event) => setNotes((current) => ({ ...current, [String(application.id)]: event.target.value }))} className="mt-1 w-full border border-border bg-background px-3 py-2 text-xs normal-case" />
                            </label>
                            {transitions.map((nextStatus) => (
                              <button
                                key={nextStatus}
                                disabled={mutation.isPending}
                                onClick={() => void updateApplication(application, nextStatus)}
                                className="border border-border px-3 py-2 text-xs font-bold uppercase hover:border-primary disabled:opacity-50"
                              >
                                {nextStatus === "ACCEPTED" ? "Terima lamaran" : "Tolak lamaran"}
                              </button>
                            ))}
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              )}
          </section>
        )}
      </main>
    </div>
  );
}
