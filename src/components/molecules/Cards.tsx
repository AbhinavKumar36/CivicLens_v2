import React from "react"
import { GlassPanel } from "@/components/ui/GlassPanel"
import { Headline, BodyText, Label } from "@/components/atoms/Typography"
import { cn } from "@/utils/utils"

interface KpiCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  value: string | number
  icon: string
  trend?: string
  trendDirection?: "up" | "down" | "neutral"
  colorTheme?: "primary" | "secondary" | "tertiary" | "error"
}

export function KpiCard({ title, value, icon, trend, trendDirection, colorTheme = "primary", className, ...props }: KpiCardProps) {
  const colorMap = {
    primary: "text-primary bg-primary/10",
    secondary: "text-secondary bg-secondary/10",
    tertiary: "text-tertiary bg-tertiary/10",
    error: "text-error bg-error/10",
  }

  return (
    <GlassPanel hover className={cn("p-6 flex flex-col group", className)} {...props}>
      <div className="flex justify-between items-start mb-4">
        <span className={cn("material-symbols-outlined p-2 rounded-lg", colorMap[colorTheme])}>{icon}</span>
        {trend && (
          <span className="text-xs text-on-surface-variant font-label-sm">{trend}</span>
        )}
      </div>
      <Label className="mb-1 text-on-surface-variant">{title}</Label>
      <Headline level={2}>{value}</Headline>
    </GlassPanel>
  )
}

interface ActionCardProps extends React.HTMLAttributes<HTMLButtonElement> {
  title: string
  description?: string
  icon: string
  colorTheme?: "primary" | "secondary" | "tertiary"
}

export function ActionCard({ title, description, icon, colorTheme = "primary", className, ...props }: ActionCardProps) {
  const colorMap = {
    primary: "text-primary bg-primary-container/20",
    secondary: "text-secondary bg-secondary-container/20",
    tertiary: "text-tertiary bg-tertiary-container/20",
  }

  return (
    <button 
      className={cn(
        "glass-panel glass-panel-hover p-4 md:p-6 rounded-2xl md:rounded-3xl flex flex-col items-center md:items-start md:gap-4 text-center md:text-left group transition-all w-full",
        className
      )}
      {...props}
    >
      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform mb-2 md:mb-0", colorMap[colorTheme])}>
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <div>
        <Headline level={4} className="mb-1">{title}</Headline>
        {description && <BodyText variant="md" className="hidden md:block">{description}</BodyText>}
      </div>
    </button>
  )
}
