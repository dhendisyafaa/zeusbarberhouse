import { Suspense } from "react";
import type { Metadata } from "next";
import { Navbar } from "@/components/home/navbar";
import { Footer } from "@/components/home/footer";
import { BookingFormWorkbench } from "@/components/booking/booking-form-workbench";

export const metadata: Metadata = {
  title: "Booking Jadwal Online | Zeus BarberHouse BDG",
  description:
    "Reservasi kursi dan capster andalan secara online dengan sistem soft-lock 15 menit. Anti double-booking, cepat, dan transparan.",
};

export default function BookingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* Header Navigation */}
      <Navbar />

      {/* Main Content with Suspense Boundary for useSearchParams */}
      <main className="flex-1 w-full pt-20">
        <Suspense
          fallback={
            <div className="w-full py-32 flex items-center justify-center text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Memuat Sistem Reservasi ...
            </div>
          }
        >
          <BookingFormWorkbench />
        </Suspense>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
