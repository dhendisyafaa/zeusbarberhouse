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
      ? "checkerboard-crimson"
      : variant === "blue"
      ? "checkerboard-blue"
      : "checkerboard-default";

  return (
    <div
      className={`h-[6px] w-full border-t border-b border-border ${gradientClass} ${className}`}
      role="presentation"
    />
  );
}
