import React, { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/contexts/AuthContext"
import { useNotifications } from "@/contexts/NotificationContext"
import { useTheme } from "@/contexts/ThemeContext"
import { cn } from "@/utils/utils"
import { useTranslation } from 'react-i18next'

function timeAgo(dateInput: string | Date) {
  const date = new Date(dateInput);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function TopAppBar() {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotifications();
  const { theme, setTheme } = useTheme();
  const { i18n } = useTranslation();
  
  const [showDropdown, setShowDropdown] = useState(false);
  const [showThemeDropdown, setShowThemeDropdown] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const themeDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
      if (themeDropdownRef.current && !themeDropdownRef.current.contains(event.target as Node)) {
        setShowThemeDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'success': return 'text-secondary bg-secondary/10';
      case 'error': return 'text-error bg-error/10';
      case 'warning': return 'text-orange-500 bg-orange-500/10';
      case 'info': 
      default: return 'text-primary bg-primary/10';
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return 'check_circle';
      case 'error': return 'error';
      case 'warning': return 'warning';
      case 'info': 
      default: return 'info';
    }
  };

  return (
    <header className="fixed top-0 right-0 w-full md:w-[calc(100%-280px)] h-header-height bg-surface/80 md:bg-surface/40 backdrop-blur-xl border-b border-foreground/10 flex justify-between items-center px-gutter z-40">
      <div className="flex items-center gap-6 flex-1">
        <div className="relative w-full max-w-md hidden lg:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
          <input 
            className="w-full bg-foreground/5 border border-foreground/10 rounded-full py-2 pl-10 pr-4 focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-body-md font-body-md transition-all text-on-surface" 
            placeholder="Command Palette..." 
            type="text"
          />
        </div>
        {/* Mobile Title / Greeting */}
        <div className="md:hidden flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center overflow-hidden">
            <img className="w-full h-full object-cover" src={user?.avatar || ""} alt="User Avatar" />
          </div>
          <div>
            <p className="text-on-surface-variant font-label-sm text-label-sm leading-tight">Welcome back,</p>
            <h1 className="text-primary font-headline-md text-headline-md leading-tight">{user?.name}</h1>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        
        {/* Theme Switcher */}
        <div className="relative hidden md:block" ref={themeDropdownRef}>
          <button 
            onClick={() => setShowThemeDropdown(!showThemeDropdown)}
            className="p-2 text-on-surface-variant hover:bg-foreground/10 rounded-full transition-colors relative active:scale-95 flex items-center justify-center"
            title="Toggle Theme"
          >
            <span className="material-symbols-outlined text-[20px]">
              {theme === 'dark' ? 'dark_mode' : theme === 'light' ? 'light_mode' : 'brightness_auto'}
            </span>
          </button>
          
          <AnimatePresence>
            {showThemeDropdown && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.1 } }}
                className="absolute top-full right-0 mt-2 w-40 bg-surface-container backdrop-blur-2xl border border-foreground/10 shadow-2xl rounded-2xl overflow-hidden flex flex-col p-2 z-50"
              >
                <button 
                  onClick={() => { setTheme('light'); setShowThemeDropdown(false); }}
                  className={cn("flex items-center gap-3 p-2 rounded-lg text-sm transition-colors", theme === 'light' ? "bg-primary/20 text-primary font-bold" : "text-on-surface-variant hover:bg-foreground/5")}
                >
                  <span className="material-symbols-outlined text-[18px]">light_mode</span>
                  Light
                </button>
                <button 
                  onClick={() => { setTheme('dark'); setShowThemeDropdown(false); }}
                  className={cn("flex items-center gap-3 p-2 rounded-lg text-sm transition-colors", theme === 'dark' ? "bg-primary/20 text-primary font-bold" : "text-on-surface-variant hover:bg-foreground/5")}
                >
                  <span className="material-symbols-outlined text-[18px]">dark_mode</span>
                  Dark
                </button>
                <button 
                  onClick={() => { setTheme('system'); setShowThemeDropdown(false); }}
                  className={cn("flex items-center gap-3 p-2 rounded-lg text-sm transition-colors", theme === 'system' ? "bg-primary/20 text-primary font-bold" : "text-on-surface-variant hover:bg-foreground/5")}
                >
                  <span className="material-symbols-outlined text-[18px]">brightness_auto</span>
                  System
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>



        {/* Notification Bell */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            className={cn(
              "p-2 rounded-full transition-colors relative active:scale-95",
              showDropdown ? "bg-foreground/10 text-foreground" : "text-on-surface-variant hover:bg-foreground/10 hover:text-foreground"
            )}
          >
            <span className="material-symbols-outlined">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 bg-error text-white text-[10px] font-bold rounded-full flex items-center justify-center border border-surface shadow-sm">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notification Center Dropdown */}
          <AnimatePresence>
            {showDropdown && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.1 } }}
                className="absolute top-full right-0 mt-2 w-80 md:w-96 bg-surface-container backdrop-blur-2xl border border-foreground/10 shadow-2xl rounded-2xl overflow-hidden flex flex-col max-h-[80vh] z-50"
              >
                <div className="p-4 border-b border-foreground/5 flex items-center justify-between bg-foreground/5">
                  <h3 className="font-bold text-sm">Notification Center</h3>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <button onClick={markAllAsRead} className="text-[10px] text-primary hover:underline font-semibold uppercase tracking-wider">Mark all read</button>
                    )}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-on-surface-variant flex flex-col items-center gap-2">
                      <span className="material-symbols-outlined text-4xl opacity-50">notifications_paused</span>
                      <p className="text-xs">No notifications yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {notifications.map(notif => (
                        <div 
                          key={notif.id} 
                          onClick={() => !notif.read && markAsRead(notif.id)}
                          className={cn(
                            "p-3 rounded-xl flex items-start gap-3 transition-colors cursor-pointer group",
                            notif.read ? "hover:bg-foreground/5 opacity-70" : "bg-foreground/5 hover:bg-foreground/10"
                          )}
                        >
                          <div className={cn("w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5", getTypeStyles(notif.type))}>
                            <span className="material-symbols-outlined text-[16px]">{getIcon(notif.type)}</span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h4 className={cn("text-sm font-semibold", notif.read ? "text-on-surface-variant" : "text-on-surface")}>{notif.title}</h4>
                              {!notif.read && <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5"></span>}
                            </div>
                            <p className="text-xs text-on-surface-variant line-clamp-2">{notif.message}</p>
                            <p className="text-[10px] text-on-surface-variant opacity-60 mt-1 uppercase tracking-wider">
                              {timeAgo(notif.timestamp)} • {notif.group}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {notifications.length > 0 && (
                  <div className="p-2 border-t border-foreground/5 bg-black/20">
                    <button onClick={clearAll} className="w-full py-2 text-xs text-on-surface-variant hover:text-error transition-colors font-semibold">
                      Clear History
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="hidden md:flex items-center gap-4 pl-4 border-l border-foreground/10">
          <div className="text-right">
            <p className="font-body-md text-body-md font-semibold text-on-surface">{user?.name}</p>
            <p className="font-label-sm text-label-sm text-on-surface-variant">{user?.role}</p>
          </div>
          <div className="w-10 h-10 rounded-full border border-primary/20 p-0.5 overflow-hidden">
            <img className="w-full h-full object-cover rounded-full" src={user?.avatar || ""} alt="Avatar" />
          </div>
          <button 
            onClick={logout}
            className="p-2 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-full transition-colors flex items-center justify-center ml-2"
            title="Log Out"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
          </button>
        </div>
      </div>
    </header>
  )
}
