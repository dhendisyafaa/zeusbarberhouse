"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type CustomerAuthFormProps = {
  mode: "login" | "register";
  error?: string;
};

export function CustomerAuthForm({ mode, error = "" }: CustomerAuthFormProps) {
  const isRegister = mode === "register";
  const [errorMessage, setErrorMessage] = useState(
    error === "setup"
      ? "Login Google berhasil, tetapi profil belum selesai disiapkan. Coba login kembali."
      : error === "google"
        ? "Login Google dibatalkan atau gagal. Silakan coba lagi."
        : "",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const signInWithGoogle = async () => {
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const { error: authError } = await createClient().auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: new URL(
            "/auth/callback",
            window.location.origin,
          ).toString(),
          queryParams: { prompt: "select_account" },
        },
      });
      if (authError) throw authError;
    } catch {
      setErrorMessage("Tidak dapat memulai login Google. Silakan coba lagi.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <p className="text-sm text-zinc-400">
        {isRegister
          ? "Setelah login berhasil, akun otomatis menjadi member Zeus."
          : "Gunakan akun Google yang terhubung dengan membership-mu."}
      </p>
      {errorMessage && (
        <p role="alert" className="text-sm text-red-400">
          {errorMessage}
        </p>
      )}
      <button
        type="button"
        disabled={isSubmitting}
        onClick={() => void signInWithGoogle()}
        className="flex w-full items-center justify-center gap-3 border border-zinc-600 bg-white px-4 py-3 font-semibold text-zinc-900 transition-colors hover:bg-zinc-200 disabled:cursor-wait disabled:opacity-60"
      >
        <span aria-hidden="true" className="text-lg font-bold text-blue-600">
          G
        </span>
        {isSubmitting ? "Mengarahkan ke Google…" : "Lanjutkan dengan Google"}
      </button>
      <p className="text-sm text-zinc-400">
        {isRegister ? "Sudah punya akun?" : "Belum punya akun?"}{" "}
        <Link
          href={isRegister ? "/login" : "/register"}
          className="text-blue-300 underline"
        >
          {isRegister ? "Masuk" : "Daftar sebagai member"}
        </Link>
      </p>
    </div>
  );
}
