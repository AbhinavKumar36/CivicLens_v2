import React from "react"
import { NavLink } from "react-router-dom"
import { cn } from "@/utils/utils"

export function BottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 w-full z-50 rounded-t-xl bg-surface/80 backdrop-blur-xl border-t border-foreground/10 shadow-[0px_-4px_20px_rgba(0,0,0,0.3)] flex justify-around items-center h-20 px-4 pb-2">
      <NavLink 
        to="/dashboard" 
        className={({ isActive }) => cn("flex flex-col items-center justify-center rounded-xl px-4 py-1 active:scale-90 transition-all", isActive ? "bg-primary-container text-on-primary-container" : "text-on-surface-variant hover:text-primary")}
      >
        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>home</span>
        <span className="font-label-sm text-[10px] mt-1">Home</span>
      </NavLink>
      <NavLink 
        to="/map" 
        className={({ isActive }) => cn("flex flex-col items-center justify-center rounded-xl px-4 py-1 active:scale-90 transition-all", isActive ? "bg-primary-container text-on-primary-container" : "text-on-surface-variant hover:text-primary")}
      >
        <span className="material-symbols-outlined">map</span>
        <span className="font-label-sm text-[10px] mt-1">Map</span>
      </NavLink>
      <NavLink 
        to="/ai" 
        className={({ isActive }) => cn("flex flex-col items-center justify-center rounded-xl px-4 py-1 active:scale-90 transition-all", isActive ? "bg-primary-container text-on-primary-container" : "text-on-surface-variant hover:text-primary")}
      >
        <span className="material-symbols-outlined">smart_toy</span>
        <span className="font-label-sm text-[10px] mt-1">AI Assistant</span>
      </NavLink>
      <NavLink 
        to="/profile" 
        className={({ isActive }) => cn("flex flex-col items-center justify-center rounded-xl px-4 py-1 active:scale-90 transition-all", isActive ? "bg-primary-container text-on-primary-container" : "text-on-surface-variant hover:text-primary")}
      >
        <span className="material-symbols-outlined">person</span>
        <span className="font-label-sm text-[10px] mt-1">Profile</span>
      </NavLink>
    </nav>
  )
}
