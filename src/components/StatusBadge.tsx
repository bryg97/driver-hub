import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export type Tone = "success" | "warning" | "info" | "danger" | "neutral" | "primary";

const toneClasses: Record<Tone, string> = {
  success: "bg-success text-success-foreground",
  warning: "bg-warning text-warning-foreground",
  info: "bg-info text-info-foreground",
  danger: "bg-danger text-danger-foreground",
  neutral: "bg-neutral text-neutral-foreground",
  primary: "bg-accent text-accent-foreground",
};

export function StatusBadge({
  tone = "neutral",
  children,
  className,
}: {
  tone?: Tone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
