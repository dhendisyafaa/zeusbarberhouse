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
      <div className="flex items-center gap-3 border-b border-[#27272A] pb-3">
        <span className="flex h-7 w-7 items-center justify-center bg-[#FAFAFA] font-heading text-sm font-bold text-[#09090B]">
          3
        </span>
        <h2 className="font-heading text-xl font-bold uppercase tracking-tight text-[#FAFAFA] sm:text-2xl">
          LAYANAN & PAKET
        </h2>
      </div>

      {services.length === 0 ? (
        <p className="border border-[#27272A] bg-[#1A1A1D] p-4 text-sm text-[#A1A1AA]">
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
                className={`flex flex-col justify-between border bg-[#1A1A1D] p-4 text-left transition-colors ${
                  isSelected
                    ? "border-[#0033A0] shadow-[4px_4px_0px_0px_#0033A0]"
                    : "border-[#27272A] hover:border-[#0033A0]/60"
                }`}
              >
                <span>
                  <span className="block font-heading text-lg font-bold uppercase text-[#FAFAFA]">
                    {service.title}
                  </span>
                  <span className="mt-1 block text-xs leading-relaxed text-[#A1A1AA]">
                    {service.description || "Layanan tersedia untuk dibooking."}
                  </span>
                </span>
                <span className="mt-4 flex items-center justify-between border-t border-[#27272A] pt-3">
                  <span className="inline-flex items-center gap-1 text-xs text-[#A1A1AA]">
                    <Clock className="h-3.5 w-3.5" />
                    {service.duration} menit
                  </span>
                  <span className="flex items-center gap-2 font-heading text-lg font-bold text-[#FAFAFA]">
                    Rp {service.price.toLocaleString("id-ID")}
                    <span
                      className={`flex h-5 w-5 items-center justify-center border ${
                        isSelected
                          ? "border-[#0033A0] bg-[#0033A0]"
                          : "border-[#52525B]"
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
