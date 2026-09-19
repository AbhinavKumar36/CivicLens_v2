import React from "react"
import { cn } from "@/utils/utils"
import { Slot } from "@radix-ui/react-slot"

// -- TYPOGRAPHY ATOMS --

export function Headline({ className, level = 2, children, ...props }: React.HTMLAttributes<HTMLHeadingElement> & { level?: 1 | 2 | 3 | 4 | 5 | 6 }) {
  const Tag = `h${level}` as any
  const sizes = {
    1: "font-display-lg text-[32px] md:text-display-lg font-bold leading-tight",
    2: "font-headline-md text-[24px] md:text-headline-md font-bold leading-tight",
    3: "font-headline-md text-xl font-bold leading-tight",
    4: "font-headline-md text-lg font-bold leading-tight",
    5: "font-headline-md text-base font-bold leading-tight",
    6: "font-headline-md text-sm font-bold leading-tight",
  }
  return (
    <Tag className={cn("text-on-surface", sizes[level], className)} {...props}>
      {children}
    </Tag>
  )
}

export function BodyText({ className, variant = "md", children, ...props }: React.HTMLAttributes<HTMLParagraphElement> & { variant?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: "text-sm",
    md: "text-body-md",
    lg: "text-body-lg",
  }
  return (
    <p className={cn("text-on-surface-variant font-body-md", sizes[variant], className)} {...props}>
      {children}
    </p>
  )
}

export function Label({ className, children, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={cn("font-label-sm text-label-sm tracking-widest uppercase", className)} {...props}>
      {children}
    </span>
  )
}

export function GradientText({ className, children, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={cn("bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary font-bold", className)} {...props}>
      {children}
    </span>
  )
}
