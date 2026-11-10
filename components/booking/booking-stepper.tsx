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
    <div className="border-t border-border bg-background/90 backdrop-blur-sm overflow-x-auto">
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
                    ? "text-foreground font-bold"
                    : isCompleted
                      ? "text-foreground"
                      : "text-muted-foreground"
                }`}
              >
                <span
                  className={`w-6 h-6 flex items-center justify-center text-xs font-mono font-bold transition-colors ${
                    isCurrent || isCompleted
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {step.number}
                </span>
                <a
                  href={`#${step.id}`}
                  className="hover:text-foreground transition-colors"
                >
                  {step.label}
                </a>
                {idx < steps.length - 1 && (
                  <span className="text-subtle ml-2 font-mono">/</span>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
