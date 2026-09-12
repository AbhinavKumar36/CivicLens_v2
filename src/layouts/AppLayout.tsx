import React from "react"
import { useOutlet, useLocation } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Sidebar } from "@/components/Sidebar"
import { TopAppBar } from "@/components/TopAppBar"
import { BottomNav } from "@/components/BottomNav"
import { AIOrbFAB } from "@/components/ui/AIOrbFAB"
import { CommandPalette } from "@/components/organisms/CommandPalette"
import { ThemeProvider } from "@/contexts/ThemeContext"
import { SettingsProvider } from "@/contexts/SettingsContext"
import { ToastContainer } from "@/components/ui/ToastContainer"
import { useVoiceNavigation } from "@/hooks/useVoiceNavigation"
import { cn } from "@/utils/utils"

export function AppLayout() {
  const location = useLocation()
  const currentOutlet = useOutlet()
  
  // Initialize global Voice Navigation
  const { isListening, lastCommand } = useVoiceNavigation(true);
  
  const isFullScreenPage = location.pathname === '/map' || location.pathname === '/ai';

  return (
    <SettingsProvider>
      <ThemeProvider defaultTheme="system" storageKey="civiclens-theme">
        <div className="min-h-screen bg-background text-on-surface flex flex-col font-body-md overflow-x-hidden transition-colors duration-300">
          
          {/* Voice Command Feedback overlay */}
          <AnimatePresence>
            {(isListening || lastCommand) && (
              <motion.div 
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-primary/20 backdrop-blur-xl border border-primary/40 px-6 py-3 rounded-full flex items-center gap-3 shadow-[0_0_30px_rgba(192,193,255,0.3)]"
              >
                <span className="material-symbols-outlined text-primary animate-pulse">
                  {isListening ? "mic" : "check_circle"}
                </span>
                <span className="font-bold text-sm text-primary">
                  {isListening ? "Listening for command..." : lastCommand}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Background Decoration */}
          <div className="fixed inset-0 z-0 pointer-events-none">
            <div className="fixed top-[-10%] right-[-5%] w-[40%] h-[60%] bg-primary/5 blur-[120px] rounded-full -z-20"></div>
            <div className="fixed bottom-[-10%] left-[-5%] w-[30%] h-[50%] bg-secondary/5 blur-[120px] rounded-full -z-20"></div>
          </div>
          
          <Sidebar />
          <TopAppBar />
          
          <main className={cn(
            "relative z-10 md:ml-sidebar-width mt-header-height",
            isFullScreenPage 
              ? "h-[calc(100vh-72px)] overflow-hidden p-0 pb-0" 
              : "min-h-screen p-container-padding-mobile md:p-gutter pb-32 md:pb-12"
          )}>
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className={isFullScreenPage ? "h-full w-full" : undefined}
              >
                <React.Suspense fallback={<div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div></div>}>
                  {currentOutlet}
                </React.Suspense>
              </motion.div>
            </AnimatePresence>
          </main>

          <AIOrbFAB />
          <BottomNav />
          <CommandPalette />
          <ToastContainer />
        </div>
      </ThemeProvider>
    </SettingsProvider>
  )
}
