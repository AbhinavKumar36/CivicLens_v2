import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/utils/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border border-foreground/10 px-2.5 py-0.5 font-label-sm text-xs transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-on-primary hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-on-secondary hover:bg-secondary/80",
        destructive:
          "border-transparent bg-error text-on-error hover:bg-error/80",
        outline: "text-on-surface-variant",
        glass: "bg-surface-container/60 backdrop-blur-md text-on-surface",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
