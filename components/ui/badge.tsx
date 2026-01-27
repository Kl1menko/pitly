import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "outline";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const styles = {
    default: "bg-neutral-100 text-neutral-900",
    success: "bg-emerald-100 text-emerald-800",
    outline: "border border-neutral-300 text-neutral-700"
  }[variant];

  return (
    <span
      className={cn("inline-flex items-center rounded-full px-3.5 py-1.5 text-xs font-semibold", styles, className)}
      {...props}
    />
  );
}
