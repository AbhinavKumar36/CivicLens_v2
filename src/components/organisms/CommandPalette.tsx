import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Dialog, DialogContent, DialogOverlay, DialogPortal } from "./Dialogs"
import { cn } from "@/utils/utils"

const RECENT_COMMANDS = [
  { id: "ai", label: "AI Assistant", icon: "smart_toy", color: "text-primary", shortcuts: ["A", "I"] },
  { id: "dash", label: "Open Dashboard", icon: "dashboard", color: "text-primary", shortcuts: ["G", "D"] },
]

const ALL_COMMANDS = [
  { id: "emergency", label: "Emergency Protocol", icon: "emergency", color: "text-error", hoverColor: "group-hover:text-error", shortcuts: ["!"] },
  { id: "analytics", label: "View Analytics", icon: "analytics", color: "text-on-surface-variant", hoverColor: "group-hover:text-secondary", shortcuts: ["G", "A"] },
  { id: "report", label: "Report Infrastructure Issue", icon: "flag", color: "text-on-surface-variant", hoverColor: "group-hover:text-primary", shortcuts: ["R", "I"] },
  { id: "services", label: "Government Services", icon: "account_balance", color: "text-on-surface-variant", hoverColor: "group-hover:text-primary", shortcuts: ["G", "S"] },
  { id: "search", label: "Search Public Complaints", icon: "search", color: "text-on-surface-variant", hoverColor: "group-hover:text-primary", shortcuts: ["S", "C"] },
  { id: "theme", label: "Toggle Dark Mode", icon: "dark_mode", color: "text-on-surface-variant", hoverColor: "group-hover:text-primary", shortcuts: ["T", "L"] },
  { id: "settings", label: "User Settings", icon: "settings", color: "text-on-surface-variant", hoverColor: "group-hover:text-primary", shortcuts: ["S", ","] },
]

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    const handleToggle = () => setOpen((open) => !open)
    
    document.addEventListener("keydown", down)
    window.addEventListener("toggle-command-palette", handleToggle)
    return () => {
      document.removeEventListener("keydown", down)
      window.removeEventListener("toggle-command-palette", handleToggle)
    }
  }, [])

  const filteredAll = ALL_COMMANDS.filter((cmd) => cmd.label.toLowerCase().includes(search.toLowerCase()))
  const filteredRecent = RECENT_COMMANDS.filter((cmd) => cmd.label.toLowerCase().includes(search.toLowerCase()))

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogPortal>
        <DialogOverlay className="bg-black/60 backdrop-blur-md" />
        <DialogContent className="p-0 border-foreground/10 bg-surface/80 backdrop-blur-2xl shadow-2xl max-w-2xl gap-0 overflow-hidden sm:rounded-2xl top-[20%] translate-y-0">
          
          {/* Search Header */}
          <div className="flex items-center px-6 py-5 border-b border-foreground/10 relative">
            <span className="material-symbols-outlined text-on-surface-variant mr-4">search</span>
            <input 
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent border-none focus:ring-0 text-body-lg font-headline-md text-on-surface placeholder-on-surface-variant/50 outline-none" 
              placeholder="Search commands..." 
              type="text"
            />
            <div className="flex items-center space-x-1 ml-4 shrink-0">
              <kbd className="px-2 py-1 bg-foreground/5 border border-foreground/10 rounded font-label-sm text-[10px] text-on-surface-variant">ESC</kbd>
            </div>
          </div>

          {/* Content Area */}
          <div className="max-h-[60vh] overflow-y-auto py-4 hide-scrollbar">
            
            {/* Recent */}
            {filteredRecent.length > 0 && (
              <div className="px-3 mb-6">
                <h3 className="px-3 py-2 text-[10px] font-label-sm uppercase tracking-widest text-on-surface-variant/60 mb-1">Recent</h3>
                <div className="space-y-0.5">
                  {filteredRecent.map(cmd => (
                    <CommandItem key={cmd.id} cmd={cmd} />
                  ))}
                </div>
              </div>
            )}

            {/* All Commands */}
            {filteredAll.length > 0 && (
              <div className="px-3">
                <h3 className="px-3 py-2 text-[10px] font-label-sm uppercase tracking-widest text-on-surface-variant/60 mb-1">All Commands</h3>
                <div className="space-y-0.5">
                  {filteredAll.map(cmd => (
                    <CommandItem key={cmd.id} cmd={cmd} />
                  ))}
                </div>
              </div>
            )}

            {filteredAll.length === 0 && filteredRecent.length === 0 && (
              <div className="py-14 text-center text-on-surface-variant font-body-md">
                No commands found.
              </div>
            )}
          </div>

          {/* Footer Meta */}
          <div className="px-6 py-3 border-t border-foreground/10 bg-foreground/5 flex items-center justify-between text-[10px] text-on-surface-variant/60">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <kbd className="px-1 bg-foreground/10 rounded mr-1">↑</kbd>
                <kbd className="px-1 bg-foreground/10 rounded mr-2">↓</kbd>
                <span>Navigate</span>
              </div>
              <div className="flex items-center">
                <kbd className="px-1 bg-foreground/10 rounded mr-2">↵</kbd>
                <span>Select</span>
              </div>
            </div>
            <div className="flex items-center">
              <span className="mr-2">CivicLens Engine v4.2.0</span>
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
            </div>
          </div>

        </DialogContent>
      </DialogPortal>
    </Dialog>
  )
}

function CommandItem({ cmd }: { cmd: any }) {
  return (
    <button className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all group hover:bg-foreground/5 active:scale-[0.99]">
      <div className="flex items-center">
        <span className={cn("material-symbols-outlined transition-transform mr-4 group-hover:scale-110", cmd.color, cmd.hoverColor)}>{cmd.icon}</span>
        <span className="text-body-md font-headline-md text-on-surface">{cmd.label}</span>
      </div>
      <div className="flex space-x-1">
        {cmd.shortcuts.map((key: string, idx: number) => (
          <kbd key={idx} className={cn("px-1.5 py-0.5 bg-foreground/5 border border-foreground/10 rounded font-label-sm text-[10px] text-on-surface-variant transition-colors", cmd.hoverColor)}>
            {key}
          </kbd>
        ))}
      </div>
    </button>
  )
}
