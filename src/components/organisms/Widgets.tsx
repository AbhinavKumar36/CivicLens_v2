import React from "react"
import { GlassPanel } from "@/components/ui/GlassPanel"
import { Headline, BodyText, Label } from "@/components/atoms/Typography"
import { cn } from "@/utils/utils"

export interface WeatherWidgetProps extends React.HTMLAttributes<HTMLDivElement> {
  temperature: string
  condition: string
  location: string
  icon?: string
}

export function WeatherWidget({ temperature, condition, location, icon = "cloud", className, ...props }: WeatherWidgetProps) {
  return (
    <GlassPanel className={cn("p-6 relative overflow-hidden", className)} {...props}>
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 blur-3xl rounded-full pointer-events-none"></div>
      <div className="flex justify-between items-start mb-6">
        <div>
          <Label className="text-primary mb-1 block">Local Weather</Label>
          <Headline level={4}>{location}</Headline>
        </div>
        <span className="material-symbols-outlined text-4xl text-on-surface" style={{ fontVariationSettings: "'FILL' 1" }}>
          {icon}
        </span>
      </div>
      <div className="flex items-end gap-3">
        <span className="text-5xl font-display-lg font-bold text-on-surface leading-none">{temperature}</span>
        <span className="text-on-surface-variant font-body-md mb-1">{condition}</span>
      </div>
    </GlassPanel>
  )
}

export interface InsightWidgetProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  insight: string
  actionLabel?: string
  onAction?: () => void
}

export function InsightWidget({ title, insight, actionLabel, onAction, className, ...props }: InsightWidgetProps) {
  return (
    <GlassPanel className={cn("p-6 border-primary/20 relative overflow-hidden group", className)} {...props}>
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/10 blur-3xl group-hover:bg-primary/20 transition-colors"></div>
      <div className="flex items-center gap-2 text-primary mb-4">
        <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
        <Label className="text-[10px] md:text-[12px]">Predictive Insight</Label>
      </div>
      <Headline level={3} className="mb-2">{title}</Headline>
      <BodyText className="mb-6">{insight}</BodyText>
      {actionLabel && (
        <button 
          onClick={onAction}
          className="w-full bg-primary text-on-primary py-3 rounded-xl font-body-md font-semibold hover:shadow-lg hover:shadow-primary/25 transition-all active:scale-95"
        >
          {actionLabel}
        </button>
      )}
    </GlassPanel>
  )
}
