'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function AdminLoginForm() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get('email') ?? '').trim();
    const password = String(formData.get('password') ?? '');

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setErrorMessage('Email atau kata sandi tidak valid.');
        return;
      }

      router.replace('/admin');
      router.refresh();
    } catch {
      setErrorMessage('Tidak dapat terhubung ke layanan autentikasi. Coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
      <label className="block space-y-1 text-sm">
        <span>Email admin</span>
        <input
          required
          autoComplete="username"
          name="email"
          type="email"
          className="w-full rounded border border-border bg-background px-3 py-2"
        />
      </label>
      <label className="block space-y-1 text-sm">
        <span>Kata sandi</span>
        <input
          required
          autoComplete="current-password"
          name="password"
          type="password"
          className="w-full rounded border border-border bg-background px-3 py-2"
        />
      </label>
      {errorMessage ? (
        <p role="alert" className="text-sm text-destructive">{errorMessage}</p>
      ) : null}
      <button
        disabled={isSubmitting}
        type="submit"
        className="w-full rounded bg-primary px-4 py-2 font-semibold text-primary-foreground disabled:opacity-60"
      >
        {isSubmitting ? 'Memeriksa...' : 'Masuk'}
      </button>
    </form>
  );
}
