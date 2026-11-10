"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { cn } from "cn";

interface ThemeToggleProps {
  showLabel?: boolean;
  className?: string;
}

export function ThemeToggle({ showLabel = false, className }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <Button
      type="button"
      variant="outline"
      size={showLabel ? "default" : "icon"}
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      aria-label="Ganti tema"
      title="Ganti tema"
      className={cn(
        "border-border bg-background text-muted-foreground hover:border-primary hover:bg-muted hover:text-foreground",
        showLabel && "w-full justify-start gap-2 px-3 normal-case tracking-normal",
        className,
      )}
    >
      <Sun className="h-4 w-4 dark:hidden" aria-hidden="true" />
      <Moon className="hidden h-4 w-4 dark:block" aria-hidden="true" />
      {showLabel ? (
        <span className="text-xs font-semibold uppercase tracking-wider">
          <span className="dark:hidden">Light mode</span>
          <span className="hidden dark:inline">Dark mode</span>
        </span>
      ) : null}
    </Button>
  );
}
