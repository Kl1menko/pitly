import * as React from "react";
import { cn } from "@/lib/utils";

export type CheckboxProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(({ className, ...props }, ref) => {
  return (
    <input
      type="checkbox"
      ref={ref}
      className={cn(
        "h-5 w-5 rounded-md border border-neutral-300 text-primary focus:ring-2 focus:ring-primary focus:ring-offset-1",
        className
      )}
      {...props}
    />
  );
});
Checkbox.displayName = "Checkbox";
