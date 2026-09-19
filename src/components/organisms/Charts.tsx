import React from "react"
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar
} from "recharts"
import { GlassPanel } from "@/components/ui/GlassPanel"
import { Headline, BodyText } from "@/components/atoms/Typography"
import { cn } from "@/utils/utils"

interface ChartBaseProps {
  title: string
  subtitle?: string
  data: any[]
  className?: string
  height?: number | string
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface/90 border border-foreground/10 p-3 rounded-xl backdrop-blur-xl shadow-xl">
        <p className="text-label-sm font-label-sm text-on-surface-variant mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm font-bold" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export function LineChart({ title, subtitle, data, className, height = 300 }: ChartBaseProps) {
  return (
    <GlassPanel className={cn("p-6", className)}>
      <div className="mb-6">
        <Headline level={4}>{title}</Headline>
        {subtitle && <BodyText variant="sm">{subtitle}</BodyText>}
      </div>
      <div style={{ height, width: '100%' }}>
        <ResponsiveContainer>
          <RechartsLineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }} />
            <Line type="monotone" dataKey="value" stroke="var(--primary)" strokeWidth={3} dot={{ r: 4, fill: 'var(--primary)' }} activeDot={{ r: 6, fill: 'var(--on-primary)' }} />
          </RechartsLineChart>
        </ResponsiveContainer>
      </div>
    </GlassPanel>
  )
}

export function BarChart({ title, subtitle, data, className, height = 300 }: ChartBaseProps) {
  return (
    <GlassPanel className={cn("p-6", className)}>
      <div className="mb-6">
        <Headline level={4}>{title}</Headline>
        {subtitle && <BodyText variant="sm">{subtitle}</BodyText>}
      </div>
      <div style={{ height, width: '100%' }}>
        <ResponsiveContainer>
          <RechartsBarChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
            <Bar dataKey="value" fill="var(--primary)" radius={[4, 4, 0, 0]} />
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>
    </GlassPanel>
  )
}
