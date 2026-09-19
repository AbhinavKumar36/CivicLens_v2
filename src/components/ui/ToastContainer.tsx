import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications, type AppNotification } from '@/contexts/NotificationContext';
import { cn } from '@/utils/utils';

export function ToastContainer() {
  const { notifications, markAsRead } = useNotifications();
  // Only show active unread toasts that just arrived
  // To simulate "new" toasts, we'll keep a local state of currently displaying toasts
  const [activeToasts, setActiveToasts] = useState<AppNotification[]>([]);

  // When notifications change, find the newest ones that haven't been shown as a toast yet
  useEffect(() => {
    // We consider a notification "new" if it was created in the last 2 seconds
    const now = Date.now();
    const newNotifs = notifications.filter(n => !n.read && (now - n.timestamp < 2000));
    
    if (newNotifs.length > 0) {
      setActiveToasts(prev => {
        // Add only ones not already in activeToasts
        const toAdd = newNotifs.filter(n => !prev.find(p => p.id === n.id));
        return [...prev, ...toAdd];
      });
    }
  }, [notifications]);

  // Auto-dismiss toasts after 5 seconds
  useEffect(() => {
    if (activeToasts.length > 0) {
      const timers = activeToasts.map(toast => {
        return setTimeout(() => {
          setActiveToasts(prev => prev.filter(t => t.id !== toast.id));
        }, 5000);
      });
      return () => timers.forEach(clearTimeout);
    }
  }, [activeToasts]);

  const handleDismiss = (id: string) => {
    setActiveToasts(prev => prev.filter(t => t.id !== id));
    markAsRead(id);
  };

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'success': return 'border-secondary text-secondary bg-secondary/10';
      case 'error': return 'border-error text-error bg-error/10';
      case 'warning': return 'border-orange-500 text-orange-500 bg-orange-500/10';
      case 'info': 
      default: return 'border-primary text-primary bg-primary/10';
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
    <div className="fixed bottom-24 right-4 md:bottom-8 md:right-8 z-50 flex flex-col gap-3 pointer-events-none w-full max-w-sm">
      <AnimatePresence>
        {activeToasts.map(toast => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className={cn(
              "pointer-events-auto p-4 rounded-2xl shadow-2xl backdrop-blur-xl border-l-4 border-y border-r border-foreground/5",
              "bg-surface-container-high/90",
              getTypeStyles(toast.type).split(' ')[0] // extract just the border color
            )}
          >
            <div className="flex items-start gap-3">
              <span className={cn("material-symbols-outlined mt-0.5", getTypeStyles(toast.type).split(' ')[1])}>
                {getIcon(toast.type)}
              </span>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-on-surface mb-1">{toast.title}</h4>
                <p className="text-xs text-on-surface-variant leading-relaxed">{toast.message}</p>
              </div>
              <button 
                onClick={() => handleDismiss(toast.id)}
                className="text-on-surface-variant hover:text-foreground transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
