import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-lg border border-[color:var(--brand-outline)] bg-[color:var(--brand-nav-bg)] px-3 py-2 text-sm text-[color:var(--brand-text-strong)] placeholder:text-[color:var(--brand-text-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--brand-outline-strong)] disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  )
);
Input.displayName = "Input";

export { Input };
