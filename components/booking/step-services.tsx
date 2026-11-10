"use client";

import { Check, Clock } from "lucide-react";

export interface BookingServiceItem {
  id: string;
  title: string;
  description: string;
  duration: number;
  price: number;
}

interface StepServicesProps {
  services: BookingServiceItem[];
  selectedServiceIds: string[];
  onToggleService: (serviceId: string) => void;
}

export function StepServices({
  services,
  selectedServiceIds,
  onToggleService,
}: StepServicesProps) {
  return (
    <section id="step-layanan" className="flex flex-col gap-4">
      <div className="flex items-center gap-3 border-b border-border pb-3">
        <span className="flex h-7 w-7 items-center justify-center bg-foreground font-heading text-sm font-bold text-background">
          3
        </span>
        <h2 className="font-heading text-xl font-bold uppercase tracking-tight text-foreground sm:text-2xl">
          LAYANAN & PAKET
        </h2>
      </div>

      {services.length === 0 ? (
        <p className="border border-border bg-card p-4 text-sm text-muted-foreground">
          Belum ada layanan yang tersedia.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {services.map((service) => {
            const isSelected = selectedServiceIds.includes(service.id);
            return (
              <button
                type="button"
                key={service.id}
                onClick={() => onToggleService(service.id)}
                aria-pressed={isSelected}
                className={`flex flex-col justify-between border bg-card p-4 text-left transition-colors ${
                  isSelected
                    ? "border-primary shadow-[4px_4px_0px_0px_var(--primary)]"
                    : "border-border hover:border-primary/60"
                }`}
              >
                <span>
                  <span className="block font-heading text-lg font-bold uppercase text-foreground">
                    {service.title}
                  </span>
                  <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                    {service.description || "Layanan tersedia untuk dibooking."}
                  </span>
                </span>
                <span className="mt-4 flex items-center justify-between border-t border-border pt-3">
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    {service.duration} menit
                  </span>
                  <span className="flex items-center gap-2 font-heading text-lg font-bold text-foreground">
                    Rp {service.price.toLocaleString("id-ID")}
                    <span
                      className={`flex h-5 w-5 items-center justify-center border ${
                        isSelected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-subtle"
                      }`}
                    >
                      <Check className="h-3.5 w-3.5" />
                    </span>
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
