interface BookingStepperProps {
  currentStep?: number;
}

const steps = [
  { number: "01", label: "Cabang", id: "step-cabang" },
  { number: "02", label: "Capster Master", id: "step-capster" },
  { number: "03", label: "Layanan & Paket", id: "step-layanan" },
  { number: "04", label: "Tanggal & Slot Jam", id: "step-waktu" },
  { number: "05", label: "Detail Pelanggan", id: "step-pelanggan" },
];

export function BookingStepper({ currentStep = 1 }: BookingStepperProps) {
  return (
    <div className="border-t border-[#27272A] bg-[#09090B]/90 backdrop-blur-sm overflow-x-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <ol className="flex items-center gap-4 sm:gap-6 min-w-[680px] text-xs font-semibold uppercase tracking-wider">
          {steps.map((step, idx) => {
            const stepNum = idx + 1;
            const isCompleted = stepNum < currentStep;
            const isCurrent = stepNum === currentStep;

            return (
              <li
                key={step.number}
                className={`flex items-center gap-2.5 transition-colors ${
                  isCurrent
                    ? "text-[#FAFAFA] font-bold"
                    : isCompleted
                      ? "text-[#FAFAFA]"
                      : "text-[#A1A1AA]"
                }`}
              >
                <span
                  className={`w-6 h-6 flex items-center justify-center text-xs font-mono font-bold transition-colors ${
                    isCurrent || isCompleted
                      ? "bg-[#0033A0] text-[#FAFAFA]"
                      : "bg-[#27272A] text-[#A1A1AA]"
                  }`}
                >
                  {step.number}
                </span>
                <a
                  href={`#${step.id}`}
                  className="hover:text-[#FAFAFA] transition-colors"
                >
                  {step.label}
                </a>
                {idx < steps.length - 1 && (
                  <span className="text-[#27272A] ml-2 font-mono">/</span>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
