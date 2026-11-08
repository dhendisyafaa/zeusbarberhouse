'use client';

import { useState, type FormEvent } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { fetchApiData, publicQueryKeys } from '@/lib/queries/api';

type Vacancy = {
  id: string;
  title: string;
  description: string;
  publishedAt: string | null;
  closesAt: string | null;
};

type ApplicationResult = {
  id: string;
  name: string;
  status: string;
  createdAt: string;
};

const fieldClass = 'mt-1 w-full border border-[#27272A] bg-[#09090B] px-3 py-3 text-sm text-[#FAFAFA] outline-none focus:border-[#0033A0]';

export function CareerWorkbench() {
  const [selectedVacancy, setSelectedVacancy] = useState<Vacancy | null>(null);
  const [notice, setNotice] = useState('');
  const [formValidationError, setFormValidationError] = useState('');
  const vacanciesQuery = useQuery({
    queryKey: publicQueryKeys.vacancies,
    queryFn: () => fetchApiData<Vacancy[]>('/api/public/vacancies'),
  });
  const applicationMutation = useMutation({
    mutationFn: (formData: FormData) =>
      fetchApiData<ApplicationResult>('/api/public/job-applications', {
        method: 'POST',
        body: formData,
      }),
    onSuccess: (application) => {
      setNotice(`Lamaran berhasil dikirim. Nomor referensi: ${application.id}. Status lamaran dikelola secara internal dan tidak ada notifikasi status otomatis.`);
      setSelectedVacancy(null);
    },
  });

  const submitApplication = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNotice('');
    const formData = new FormData(event.currentTarget);
    if (selectedVacancy) formData.set('vacancyId', selectedVacancy.id);
    const resume = formData.get('resume');
    if (resume instanceof File && resume.name) {
      if (resume.type !== 'application/pdf') {
        setFormValidationError('Resume harus berupa file PDF.');
        return;
      }
      if (resume.size <= 0 || resume.size > 5 * 1024 * 1024) {
        setFormValidationError('Ukuran resume harus lebih dari 0 dan maksimal 5 MB.');
        return;
      }
    } else {
      setFormValidationError('CV/resume wajib diunggah.');
      return;
    }
    if (!String(formData.get('experience') ?? '').trim()) {
      setFormValidationError('Pengalaman wajib diisi.');
      return;
    }
    setFormValidationError('');
    applicationMutation.mutate(formData);
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-8 border-b border-[#27272A] pb-6">
        <p className="text-xs font-bold uppercase tracking-widest text-[#0033A0]">Careers at Zeus</p>
        <h1 className="mt-2 font-heading text-3xl font-extrabold uppercase sm:text-5xl">
          Lowongan & Karier
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-[#A1A1AA]">
          Lowongan aktif dikelola langsung oleh tim Zeus. Isi pengalaman dan unggah CV/resume PDF untuk mengirim lamaran.
        </p>
      </header>

      {notice && (
        <p role="status" className="mb-5 border border-emerald-700 bg-emerald-950/30 p-4 text-sm text-emerald-200">
          {notice}
        </p>
      )}
      {(formValidationError || applicationMutation.error) && (
        <p role="alert" className="mb-5 border border-red-800 bg-red-950/40 p-4 text-sm text-red-200">
          {formValidationError || applicationMutation.error?.message}
        </p>
      )}
      {vacanciesQuery.isPending ? (
        <p role="status" className="border border-[#27272A] bg-[#1A1A1D] p-5 text-sm text-[#A1A1AA]">
          Memuat lowongan…
        </p>
      ) : vacanciesQuery.isError && !vacanciesQuery.data ? (
        <div className="border border-red-800 bg-red-950/30 p-5 text-sm text-red-200">
          <p>Lowongan gagal dimuat: {vacanciesQuery.error.message}</p>
          <button type="button" onClick={() => void vacanciesQuery.refetch()} className="mt-3 underline">
            Coba lagi
          </button>
        </div>
      ) : (
        <>
          {vacanciesQuery.isFetching && (
            <p role="status" className="mb-3 text-xs text-[#A1A1AA]">Memperbarui lowongan…</p>
          )}
          {vacanciesQuery.isError && vacanciesQuery.data && (
            <p role="status" className="mb-3 text-xs text-amber-300">
              Gagal memperbarui; data terakhir tetap ditampilkan.
            </p>
          )}
          {vacanciesQuery.data?.length ? (
            <div className="grid gap-5 md:grid-cols-2">
              {vacanciesQuery.data.map((vacancy) => (
                <article key={vacancy.id} className="border border-[#27272A] bg-[#1A1A1D] p-6">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-[#0033A0]">
                    {vacancy.closesAt
                      ? `Ditutup ${new Date(vacancy.closesAt).toLocaleDateString('id-ID')}`
                      : 'Pendaftaran dibuka'}
                  </p>
                  <h2 className="mt-2 font-heading text-2xl font-bold uppercase">{vacancy.title}</h2>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-[#A1A1AA]">
                    {vacancy.description}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                              setNotice('');
                              setFormValidationError('');
                              applicationMutation.reset();
                      setSelectedVacancy(vacancy);
                    }}
                    className="mt-5 border border-[#0033A0] bg-[#0033A0] px-5 py-3 text-xs font-bold uppercase tracking-wider hover:bg-[#FAFAFA] hover:text-[#09090B]"
                  >
                    Lamar posisi ini
                  </button>
                </article>
              ))}
            </div>
          ) : (
            <p className="border border-[#27272A] bg-[#1A1A1D] p-6 text-sm text-[#A1A1AA]">
              Belum ada lowongan aktif. Silakan cek lagi nanti.
            </p>
          )}
        </>
      )}

      {selectedVacancy && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-black/80 p-4">
          <form
            onSubmit={submitApplication}
            className="my-auto w-full max-w-xl space-y-4 border border-[#0033A0] bg-[#1A1A1D] p-6"
          >
            <div className="flex items-start justify-between gap-4 border-b border-[#27272A] pb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#0033A0]">Formulir Lamaran</p>
                <h2 className="mt-1 font-heading text-2xl font-bold uppercase">{selectedVacancy.title}</h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedVacancy(null)}
                className="px-2 py-1 text-sm text-[#A1A1AA] hover:text-white"
                aria-label="Tutup formulir"
              >
                Tutup
              </button>
            </div>
            <label className="block text-xs font-semibold uppercase text-[#A1A1AA]">
              Nama lengkap *
              <input name="name" required maxLength={100} autoComplete="name" className={fieldClass} />
            </label>
            <label className="block text-xs font-semibold uppercase text-[#A1A1AA]">
              Email *
              <input name="email" type="email" required maxLength={254} autoComplete="email" className={fieldClass} />
            </label>
            <label className="block text-xs font-semibold uppercase text-[#A1A1AA]">
              Nomor telepon *
              <input name="phone" type="tel" required minLength={5} maxLength={20} autoComplete="tel" className={fieldClass} />
            </label>
            <label className="block text-xs font-semibold uppercase text-[#A1A1AA]">
              Pengalaman *
              <textarea name="experience" rows={4} required maxLength={1000} className={fieldClass} />
            </label>
            <label className="block text-xs font-semibold uppercase text-[#A1A1AA]">
              CV/resume (PDF, maks. 5 MB) *
              <input name="resume" type="file" accept="application/pdf,.pdf" required className={fieldClass} />
            </label>
            <p className="text-xs text-[#A1A1AA]">
              Resume disimpan privat dan hanya dapat diakses oleh admin yang berwenang.
            </p>
            <button
              type="submit"
              disabled={applicationMutation.isPending}
              className="w-full bg-[#0033A0] px-5 py-3.5 text-xs font-bold uppercase tracking-wider disabled:opacity-60"
            >
              {applicationMutation.isPending ? 'Mengirim lamaran…' : 'Kirim lamaran'}
            </button>
          </form>
        </div>
      )}
    </section>
  );
}
