import React from "react"
import { cn } from "@/utils/utils"

interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean
}

export function GlassPanel({ className, hover, children, ...props }: GlassPanelProps) {
  return (
    <div 
      className={cn(
        "glass-panel rounded-2xl transition-all",
        hover && "glass-panel-hover",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
