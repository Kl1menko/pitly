import * as React from "react";
import { cn } from "@/lib/utils";

export type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: "default" | "dark";
};

export function Card({ className, variant = "default", ...props }: CardProps) {
  const base =
    variant === "dark"
      ? "rounded-3xl border border-neutral-900 bg-neutral-900 text-white shadow-lg"
      : "rounded-3xl border border-neutral-200 bg-neutral-50 text-neutral-900 shadow-sm";

  return <div className={cn(base, "p-5", className)} {...props} />;
}
