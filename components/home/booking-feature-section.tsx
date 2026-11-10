import Link from "next/link";
import {
  Clock,
  CheckCircle2,
  Lock,
  ArrowRight,
  Smartphone,
  CalendarCheck2,
} from "lucide-react";

export function BookingFeatureSection() {
  const steps = [
    {
      step: "01",
      title: "Pilih Cabang & Capster",
      description:
        "Pilih cabang aktif, lihat capster yang tersedia, lalu tentukan jadwal sesuai operasional masing-masing.",
      icon: StoreIcon,
    },
    {
      step: "02",
      title: "Kunci Slot 15 Menit",
      description:
        "Pilih tanggal dan jam potong. Begitu lu klik pesan, slot itu otomatis di-lock selama 15 menit khusus buat lu. Gak bakal diserobot orang lain!",
      icon: Lock,
      highlight: true,
    },
    {
      step: "03",
      title: "Upload Bukti & Beres",
      description:
        "Lakuin transfer manual dan upload bukti bayarnya sebelum 15 menit habis. Admin langsung konfirmasi jadwal lu dan lu tinggal datang pas jamnya.",
      icon: CalendarCheck2,
    },
  ];

  function StoreIcon(props: React.ComponentProps<"svg">) {
    return <Smartphone {...props} />;
  }

  return (
    <section id="booking-info" className="w-full bg-card py-20 border-t border-border relative overflow-hidden">
      {/* Background Subtle Accent */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12 border-b border-border pb-8">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-destructive mb-2">
              <Clock className="w-4 h-4 text-destructive" />
              SISTEM BOOKING PRESISI
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold uppercase text-foreground tracking-tight">
              BOOKING JADWAL CEPAT & ANTI BENTROK
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mt-2">
              Gak perlu download aplikasi tambahan atau daftar akun ribet. Mau pesan
              sebagai tamu (guest booking) juga bisa langsung jalan dalam 2 menit.
            </p>
          </div>

          <Link
            href="/booking"
            className="self-start lg:self-end bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider px-8 py-4 border border-primary transition-all duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_var(--foreground)] inline-flex items-center gap-2 shrink-0"
          >
            <span>MULAI BOOKING SEKARANG</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 3 Step Flow Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className={`p-6 bg-background border border-border relative flex flex-col justify-between hover:border-primary transition-colors ${
                  item.highlight ? "border-primary/60 ring-1 ring-primary/30" : ""
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-heading text-3xl font-extrabold text-primary">
                      {item.step}
                    </span>
                    <div className="w-10 h-10 border border-border bg-card flex items-center justify-center text-foreground">
                      <Icon className="w-5 h-5 text-foreground" />
                    </div>
                  </div>

                  <h3 className="font-heading text-xl font-bold uppercase text-foreground mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {item.highlight && (
                  <div className="mt-6 pt-3 border-t border-border flex items-center gap-2 text-xs text-destructive font-semibold">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Countdown timer aktif saat checkout</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Reassurance Box */}
        <div className="bg-background border border-border p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-primary shrink-0" />
            <p className="text-xs sm:text-sm text-foreground">
              <strong>Bisa Guest Booking:</strong> Tanpa harus ribet bikin akun atau password,
              lu udah bisa booking jadwal langsung!
            </p>
          </div>
          <Link
            href="/booking"
            className="text-xs font-bold uppercase tracking-wider text-primary hover:text-foreground underline underline-offset-4 whitespace-nowrap"
          >
            Buka Form Pemesanan &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}
