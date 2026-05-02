import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "bg-zinc-700 text-zinc-50",
        secondary: "bg-zinc-800 text-zinc-400",
        outline: "border border-zinc-700 text-zinc-300 bg-transparent",
        success: "bg-emerald-900 text-emerald-400",
        warning: "bg-amber-900 text-amber-400",
        destructive: "bg-red-900 text-red-400",
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
