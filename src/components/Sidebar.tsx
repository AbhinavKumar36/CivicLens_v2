import React from "react"
import { NavLink } from "react-router-dom"
import { cn } from "@/utils/utils"
import { useAuth } from "@/contexts/AuthContext"

const CITIZEN_ITEMS = [
  { label: "Dashboard", icon: "dashboard", path: "/dashboard" },
  { label: "AI Hub", icon: "auto_awesome", path: "/ai" },
  { label: "Map", icon: "map", path: "/map" },
  { label: "Services", icon: "business_center", path: "/services" },
  { label: "Report Issue", icon: "bug_report", path: "/report" },
  { label: "Rewards", icon: "emoji_events", path: "/rewards" },
  { label: "Notifications", icon: "notifications", path: "/notifications" },
]

const OPERATOR_ITEMS = [
  { label: "Control Center", icon: "admin_panel_settings", path: "/admin" },
  { label: "Development Planning", icon: "account_tree", path: "/admin/planning" },
  { label: "Emergency SOS", icon: "emergency", path: "/emergency" },
  { label: "Map Overview", icon: "map", path: "/map" },
  { label: "AI Hub", icon: "auto_awesome", path: "/ai" },
]

const WORKER_ITEMS = [
  { label: "My Tasks", icon: "engineering", path: "/worker" },
  { label: "Field Map", icon: "map", path: "/map" },
  { label: "AI Assistant", icon: "auto_awesome", path: "/ai" },
]

export function Sidebar() {
  const { user } = useAuth()
  
  let currentNavItems = CITIZEN_ITEMS
  let roleTitle = "Citizen"
  
  if (user?.role === 'OPERATOR') {
    currentNavItems = OPERATOR_ITEMS
    roleTitle = "Operator"
  } else if (user?.role === 'WORKER') {
    currentNavItems = WORKER_ITEMS
    roleTitle = "Worker"
  }

  return (
    <aside className="h-screen w-sidebar-width fixed left-0 top-0 bg-surface/60 backdrop-blur-xl border-r border-foreground/10 shadow-md flex flex-col py-base z-50 hidden md:flex overflow-y-auto select-none">
      <div className="px-6 mb-12 flex items-center gap-3" role="banner">
        <img src={`${import.meta.env.BASE_URL}logo.png`} alt="CivicLens Logo" className="w-10 h-10 rounded-xl object-contain bg-white p-0.5" />
        <div className="flex flex-col gap-0.5">
          <span className="font-headline-md text-lg font-bold text-on-surface leading-none">CivicLens</span>
          <span className="font-label-sm text-[9px] text-primary tracking-widest uppercase leading-none">Smart City AI</span>
        </div>
      </div>
      
      <div className="px-4 mb-4">
        <span className="px-2 text-[10px] text-primary bg-primary/10 rounded-md py-1 font-label-sm uppercase tracking-widest">
          {roleTitle} Portal
        </span>
      </div>
      
      <nav className="flex-1 px-4 space-y-2" aria-label="Main Navigation" role="navigation">
        {currentNavItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            aria-label={`Go to ${item.label}`}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-4 py-3 transition-all duration-300 rounded-lg",
                isActive 
                  ? "text-primary border-l-4 border-primary bg-primary/10 rounded-l-none" 
                  : "text-on-surface-variant hover:text-on-surface hover:bg-foreground/5"
              )
            }
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span className="font-body-md text-body-md">{item.label}</span>
          </NavLink>
        ))}
      </nav>
      
      <div className="mt-auto px-4 space-y-2 pb-6 border-t border-foreground/5 pt-6" role="navigation" aria-label="Secondary Navigation">
        <NavLink 
          to="/profile" 
          aria-label="Open Profile" 
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 px-4 py-3 transition-all duration-300 rounded-lg",
              isActive 
                ? "text-primary border-l-4 border-primary bg-primary/10 rounded-l-none" 
                : "text-on-surface-variant hover:text-on-surface hover:bg-foreground/5"
            )
          }
        >
          <span className="material-symbols-outlined" aria-hidden="true">person</span>
          <span className="font-body-md text-body-md">Profile</span>
        </NavLink>
        <NavLink 
          to="/settings" 
          aria-label="Open Settings" 
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 px-4 py-3 transition-all duration-300 rounded-lg",
              isActive 
                ? "text-primary border-l-4 border-primary bg-primary/10 rounded-l-none" 
                : "text-on-surface-variant hover:text-on-surface hover:bg-foreground/5"
            )
          }
        >
          <span className="material-symbols-outlined" aria-hidden="true">settings</span>
          <span className="font-body-md text-body-md">Settings</span>
        </NavLink>
        <NavLink 
          to="/support" 
          aria-label="Get Support" 
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 px-4 py-3 transition-all duration-300 rounded-lg",
              isActive 
                ? "text-primary border-l-4 border-primary bg-primary/10 rounded-l-none" 
                : "text-on-surface-variant hover:text-on-surface hover:bg-foreground/5"
            )
          }
        >
          <span className="material-symbols-outlined" aria-hidden="true">help_outline</span>
          <span className="font-body-md text-body-md">Support</span>
        </NavLink>
      </div>
    </aside>
  )
}
