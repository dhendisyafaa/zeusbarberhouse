interface CheckerboardDividerProps {
  variant?: "default" | "crimson" | "blue";
  className?: string;
}

export function CheckerboardDivider({
  variant = "default",
  className = "",
}: CheckerboardDividerProps) {
  const gradientClass =
    variant === "crimson"
      ? "bg-[repeating-linear-gradient(45deg,#09090B,#09090B_8px,#FF2A2A_8px,#FF2A2A_16px)]"
      : variant === "blue"
      ? "bg-[repeating-linear-gradient(45deg,#09090B,#09090B_8px,#0033A0_8px,#0033A0_16px)]"
      : "bg-[repeating-linear-gradient(45deg,#09090B,#09090B_8px,#FAFAFA_8px,#FAFAFA_16px)]";

  return (
    <div
      className={`h-[6px] w-full border-t border-b border-[#27272A] ${gradientClass} ${className}`}
      role="presentation"
    />
  );
}
