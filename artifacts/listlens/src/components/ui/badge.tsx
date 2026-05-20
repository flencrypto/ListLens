import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "bg-[color:var(--brand-accent-soft)] text-[color:var(--brand-text-strong)] border border-[color:var(--brand-outline)]",
        secondary: "bg-[color:var(--brand-nav-bg)] text-[color:var(--brand-text-muted)] border border-[color:var(--brand-outline)]",
        outline: "border border-[color:var(--brand-outline)] text-[color:var(--brand-text)] bg-transparent",
        success: "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300",
        warning: "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300",
        destructive: "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
