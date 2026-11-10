import Link from "next/link";
import { Trophy, Gift, ArrowRight, ShieldCheck } from "lucide-react";

export function MembershipSection({
  pointsPerCompletedBooking,
}: {
  pointsPerCompletedBooking: number;
}) {
  return (
    <section
      id="membership"
      className="w-full bg-background pb-20 border-t border-border pt-20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-card border-2 border-border p-8 lg:p-12 relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-10 hover:border-primary transition-colors">
          {/* Subtle Background Watermark Typography */}
          <div className="absolute -right-8 -bottom-10 opacity-5 pointer-events-none select-none">
            <span className="font-heading text-[160px] lg:text-[200px] font-extrabold text-foreground leading-none">
              ZEUS
            </span>
          </div>

          {/* Left Details */}
          <div className="flex flex-col gap-4 max-w-2xl relative z-10">
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold uppercase text-foreground leading-tight">
              HAYU AH JOIN ZEUS CLUB!
            </h2>

            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Makin sering potong di Zeus, makin banyak reward yang bisa lu
              kantongin. Kumpulin poin dari tiap transaksi buat dapetin Poin dan
              benefit lainnya.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-xs text-foreground">
              <div className="flex items-center gap-2.5">
                <Trophy className="w-4 h-4 text-primary shrink-0" />
                <span>
                  {pointsPerCompletedBooking} poin tiap booking selesai
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Gift className="w-4 h-4 text-destructive shrink-0" />
                <span>Cuma daftar akun aja</span>
              </div>
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                <span>Otomatis Jadi Member</span>
              </div>
            </div>
          </div>

          {/* Right Side Card Action */}
          <div className="flex flex-col gap-4 w-full lg:w-80 shrink-0 relative z-10 bg-background p-6 border border-border">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                MEMBERSHIP
              </span>
              <span className="w-2.5 h-2.5 bg-primary inline-block" />
            </div>

            <p className="text-xs text-foreground leading-relaxed">
              Buat akun gratis untuk otomatis menjadi member Zeus. Membership
              tidak memiliki biaya aktivasi.
            </p>

            <Link
              href="/register"
              className="w-full text-center bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider py-4 border border-primary transition-all duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_var(--foreground)] inline-flex items-center justify-center gap-2"
            >
              <span>DAFTAR JADI MEMBER</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
