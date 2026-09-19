import React from "react"
import { cn } from "@/utils/utils"
import { useNavigate } from "react-router-dom"

export function AIOrbFAB({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const navigate = useNavigate()

  const handleClick = () => {
    navigate("/ai")
  }

  return (
    <div className="fixed right-6 bottom-28 md:bottom-8 md:right-8 z-[60] flex items-center gap-4">

      <button 
        onClick={handleClick}
        className={cn(
          "group relative bg-transparent p-0 border-none outline-none cursor-pointer w-14 h-14 md:w-16 md:h-16 rounded-full ai-orb flex items-center justify-center active:scale-90 transition-transform shadow-2xl",
          className
        )}
        {...props}
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-primary to-secondary rounded-full blur-xl opacity-40 group-hover:opacity-70 transition-opacity animate-pulse"></div>
        <div className="relative w-full h-full bg-gradient-to-tr from-primary to-secondary rounded-full flex items-center justify-center shadow-[0px_0px_30px_rgba(192,193,255,0.4)] transition-transform group-hover:scale-110 active:scale-90">
          <span className="material-symbols-outlined text-on-primary text-3xl animate-breathing" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
        </div>
      </button>
    </div>
  )
}
