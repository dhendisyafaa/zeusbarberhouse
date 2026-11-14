import { MessageCircle } from "lucide-react";

export function FeedbackSection() {
  const whatsappUrl = process.env.NEXT_PUBLIC_WA_URL || "https://wa.me/6283125271804";

  return (
    <section id="kritik" className="w-full border-t border-border bg-background py-24">
      <div className="mx-auto max-w-3xl px-5 text-center sm:px-8">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary">Masukan Pelanggan</p>
        <h2 className="mt-3 font-heading text-4xl font-extrabold uppercase text-foreground sm:text-5xl">
          Kritik <span className="text-primary">&amp; Saran</span>
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-muted-foreground">
          Bantu kami menjadi lebih baik. Sampaikan pengalamanmu langsung kepada tim Zeus.
        </p>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-primary-foreground transition hover:bg-primary-hover"
        >
          <MessageCircle className="h-4 w-4" />
          Kirim Masukan via WhatsApp
        </a>
      </div>
    </section>
  );
}
