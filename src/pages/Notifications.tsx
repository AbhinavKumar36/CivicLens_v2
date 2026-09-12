import React, { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { GlassPanel } from "@/components/ui/GlassPanel"
import { Headline, BodyText, Label } from "@/components/atoms/Typography"
import { Button } from "@/components/atoms/Button"
import { api } from "@/services/api"
import { cn } from "@/utils/utils"

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
}

function formatRelativeTime(dateStr: string) {
  try {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  } catch (e) {
    return 'Recently';
  }
}

export function Notifications() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<"all" | "alert" | "insight">("all");

  const { data: rawNotifs = [], isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: api.getNotifications
  });

  const notifications = useMemo(() => {
    return rawNotifs.map((n: any) => ({
      id: n.id,
      type: n.type || 'alert',
      title: n.title,
      time: formatRelativeTime(n.created_at),
      description: n.message,
      isRead: Boolean(n.is_read),
      icon: n.type === 'alert' ? 'emergency_home' : n.type === 'insight' ? 'auto_awesome' : n.type === 'warning' ? 'storm' : 'notifications',
      color: n.type === 'alert' ? 'error' : n.type === 'insight' ? 'primary' : 'amber-500'
    }));
  }, [rawNotifs]);

  const filteredNotifs = useMemo(() => {
    if (filter === 'all') return notifications;
    return notifications.filter(n => n.type === filter);
  }, [notifications, filter]);

  const handleMarkAllRead = async () => {
    await api.markAllNotificationsRead();
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
  };
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 max-w-6xl mx-auto py-6">
      {/* Filter Column */}
      <aside className="lg:col-span-3 space-y-6">
        <GlassPanel className="p-6">
          <div className="flex items-center justify-between mb-6">
            <Headline level={4}>Filter View</Headline>
            <button 
              onClick={handleMarkAllRead} 
              className="text-[11px] text-primary hover:underline font-bold"
            >
              Mark all read
            </button>
          </div>
          <div className="space-y-2">
            <button 
              onClick={() => setFilter('all')}
              className={cn(
                "w-full flex items-center justify-between px-4 py-2 rounded-xl font-medium transition-colors",
                filter === 'all' ? "bg-primary/10 text-primary" : "text-on-surface-variant hover:bg-foreground/5"
              )}
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-sm">list</span>
                <span className="font-body-md">All</span>
              </div>
              <span className="bg-primary/20 px-2 py-0.5 rounded text-xs">{notifications.length}</span>
            </button>
            <button 
              onClick={() => setFilter('alert')}
              className={cn(
                "w-full flex items-center justify-between px-4 py-2 rounded-xl font-medium transition-colors",
                filter === 'alert' ? "bg-error/10 text-error" : "text-on-surface-variant hover:bg-foreground/5"
              )}
            >
              <div className="flex items-center gap-3 text-error">
                <span className="material-symbols-outlined text-sm">notification_important</span>
                <span className="font-body-md">Alerts</span>
              </div>
              <span className="text-xs text-on-surface-variant">{notifications.filter(n => n.type === 'alert').length}</span>
            </button>
            <button 
              onClick={() => setFilter('insight')}
              className={cn(
                "w-full flex items-center justify-between px-4 py-2 rounded-xl font-medium transition-colors",
                filter === 'insight' ? "bg-primary/10 text-primary" : "text-on-surface-variant hover:bg-foreground/5"
              )}
            >
              <div className="flex items-center gap-3 text-primary">
                <span className="material-symbols-outlined text-sm">auto_awesome</span>
                <span className="font-body-md">AI Insights</span>
              </div>
              <span className="text-xs text-on-surface-variant">{notifications.filter(n => n.type === 'insight').length}</span>
            </button>
          </div>
        </GlassPanel>

        <GlassPanel className="p-6 relative group cursor-pointer overflow-hidden">
          <div className="relative z-10">
            <Headline level={5} className="text-primary mb-2">Network Health</Headline>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <Label className="text-on-surface-variant normal-case tracking-normal">Bhubaneswar Live BMC Grid</Label>
            </div>
            <div className="h-2 w-full bg-foreground/10 rounded-full">
              <div className="h-full w-4/5 bg-gradient-to-r from-primary to-secondary rounded-full"></div>
            </div>
          </div>
        </GlassPanel>
      </aside>

      {/* Timeline View */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="lg:col-span-9 space-y-12"
      >
        <section className="space-y-6">
          <div className="flex items-center gap-4">
            <Headline level={2}>Recent Advisories & Notifications</Headline>
            <div className="flex-1 h-px bg-gradient-to-r from-white/20 to-transparent"></div>
          </div>

          {isLoading ? (
            <p className="text-on-surface-variant p-6">Loading notifications...</p>
          ) : filteredNotifs.length === 0 ? (
            <p className="text-on-surface-variant p-6">No notifications found for selected filter.</p>
          ) : (
            filteredNotifs.map((notif) => (
              <motion.article 
                key={notif.id}
                variants={itemVariants}
                className={cn(
                  "glass-panel rounded-3xl p-8 border-l-4 relative overflow-hidden transition-all hover:bg-foreground/5 cursor-pointer",
                  !notif.isRead && "ring-1 ring-primary/30"
                )}
                style={{ borderColor: notif.color === 'error' ? 'var(--error)' : notif.color === 'primary' ? 'var(--primary)' : '#f59e0b' }}
                onClick={async () => {
                  if (!notif.isRead) {
                    await api.markNotificationRead(notif.id);
                    queryClient.invalidateQueries({ queryKey: ['notifications'] });
                  }
                }}
              >
                {notif.type === 'alert' && <div className="absolute -right-8 -top-8 w-32 h-32 bg-error/10 blur-3xl"></div>}
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div 
                    className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: notif.color === 'error' ? 'rgba(255, 180, 171, 0.2)' : notif.color === 'primary' ? 'rgba(192, 193, 255, 0.2)' : 'rgba(245, 158, 11, 0.2)' }}
                  >
                    <span 
                      className={`material-symbols-outlined ${notif.type === 'alert' ? 'animate-pulse' : ''}`}
                      style={{ color: notif.color === 'error' ? 'var(--error)' : notif.color === 'primary' ? 'var(--primary)' : '#f59e0b' }}
                    >
                      {notif.icon}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <Headline level={3}>{notif.title}</Headline>
                      <Label style={{ color: notif.color === 'error' ? 'var(--error)' : notif.color === 'primary' ? 'var(--primary)' : '#f59e0b' }}>{notif.time}</Label>
                    </div>
                    <BodyText className="mb-6 max-w-2xl">{notif.description}</BodyText>
                    
                    <div className="flex gap-4">
                      <Button variant="outline" onClick={() => navigate('/map')}>
                        View GIS Map
                      </Button>
                      <Button variant="ghost" className="text-primary" onClick={() => navigate('/admin/planning')}>
                        Planning Layers <span className="material-symbols-outlined ml-1 text-sm">arrow_forward</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.article>
            ))
          )}
        </section>
      </motion.div>
    </div>
  )
}
