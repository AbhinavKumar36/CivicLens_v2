import React from "react"
import { cn } from "@/utils/utils"

export type StatusVariant = "success" | "warning" | "error" | "info" | "primary" | "secondary"

interface StatusChipProps extends React.HTMLAttributes<HTMLDivElement> {
  status: string
  variant?: StatusVariant
  icon?: string
}

export function StatusChip({ status, variant = "primary", icon, className, ...props }: StatusChipProps) {
  const variants = {
    success: "bg-tertiary-container/20 text-tertiary border-tertiary/20",
    warning: "bg-secondary-container/20 text-secondary border-secondary/20",
    error: "bg-error-container/20 text-error border-error/20",
    info: "bg-on-surface-variant/10 text-on-surface-variant border-on-surface-variant/20",
    primary: "bg-primary-container/20 text-primary border-primary/20",
    secondary: "bg-secondary-container/20 text-secondary border-secondary/20",
  }

  return (
    <div 
      className={cn(
        "inline-flex items-center gap-1.5 rounded border px-2 py-1 text-[10px] font-label-sm uppercase tracking-wider font-bold",
        variants[variant],
        className
      )}
      {...props}
    >
      {icon && <span className="material-symbols-outlined text-[12px]">{icon}</span>}
      {status}
    </div>
  )
}
