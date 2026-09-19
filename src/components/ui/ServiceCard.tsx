import React from "react"
import { motion } from "framer-motion"
import { GlassPanel } from "./GlassPanel"
import { Headline, BodyText, Label } from "../atoms/Typography"
import { Button } from "../atoms/Button"
import { cn } from "@/utils/utils"

export interface ServiceData {
  id: string;
  title: string;
  icon: string;
  desc: string;
  time: string;
  elig: string;
  docs: string[];
  category: string;
}

interface ServiceCardProps {
  service: ServiceData;
  isBookmarked: boolean;
  onBookmark: (id: string) => void;
  onApply: (service: ServiceData) => void;
  onAskAI: (service: ServiceData) => void;
}

export function ServiceCard({ service, isBookmarked, onBookmark, onApply, onAskAI }: ServiceCardProps) {
  return (
    <GlassPanel className="p-6 flex flex-col h-full hover:-translate-y-1 transition-transform hover:shadow-2xl">
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
          <span className="material-symbols-outlined text-[28px]">{service.icon}</span>
        </div>
        <button onClick={() => onBookmark(service.id)} className="transition-colors outline-none">
          <span 
            className={cn("material-symbols-outlined", isBookmarked ? "text-tertiary" : "text-on-surface-variant opacity-40 hover:text-tertiary")}
            style={{ fontVariationSettings: isBookmarked ? "'FILL' 1" : "'FILL' 0" }}
          >
            favorite
          </span>
        </button>
      </div>
      
      <Headline level={4} className="mb-2">{service.title}</Headline>
      <BodyText variant="sm" className="mb-6 flex-1">{service.desc}</BodyText>
      
      <div className="space-y-3 mb-6">
        <div className="flex items-center justify-between border-b border-foreground/5 pb-2">
          <Label className="opacity-60">Processing Time</Label>
          <Label className="text-primary-container">{service.time}</Label>
        </div>
        <div className="flex items-center justify-between border-b border-foreground/5 pb-2">
          <Label className="opacity-60">Eligibility</Label>
          <Label className="text-primary-container">{service.elig}</Label>
        </div>
      </div>
      
      <div className="mb-8">
        <Label className="mb-2 block opacity-60">Required Documents</Label>
        <div className="flex gap-2">
          {service.docs.map((doc, docIdx) => (
            <div key={docIdx} className="w-8 h-8 rounded-lg bg-foreground/5 flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-foreground/10 transition-all cursor-help" title={`Document: ${doc}`}>
              <span className="material-symbols-outlined text-[16px]">{doc}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex items-center gap-2 mt-auto">
        <Button onClick={() => onApply(service)} className="flex-1 rounded-xl">Apply Now</Button>
        <Button onClick={() => onAskAI(service)} className="w-10 h-10 p-0 rounded-full bg-gradient-to-br from-primary to-secondary shadow-lg" title="Ask CivicLens AI">
          <span className="material-symbols-outlined text-white text-[18px]">bolt</span>
        </Button>
      </div>
    </GlassPanel>
  )
}
