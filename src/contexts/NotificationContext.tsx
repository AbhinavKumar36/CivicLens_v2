import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from "@/services/api";

export type NotificationType = 'info' | 'success' | 'warning' | 'error';
export type NotificationGroup = 'system' | 'alert' | 'message';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  group: NotificationGroup;
  read: boolean;
  timestamp: number;
}

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  addNotification: (notif: Omit<AppNotification, 'id' | 'read' | 'timestamp'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  removeNotification: (id: string) => void;
}


const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'civiclens_notifications';

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Fetch live notifications from backend database on mount
  useEffect(() => {
    let isMounted = true;
    api.getNotifications().then(data => {
      if (isMounted && Array.isArray(data) && data.length > 0) {
        const formatted: AppNotification[] = data.map((n: any) => ({
          id: String(n.id),
          title: n.title,
          message: n.message,
          type: (n.type as NotificationType) || 'info',
          group: (n.group || n.group_type as NotificationGroup) || 'system',
          read: Boolean(n.read || n.is_read),
          timestamp: n.timestamp || (n.created_at ? new Date(n.created_at).getTime() : Date.now())
        }));
        setNotifications(formatted);
      }
    }).catch(err => {
      console.warn("Could not sync notifications from DB:", err.message);
    });
    return () => { isMounted = false; };
  }, []);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(notifications));
  }, [notifications]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const addNotification = useCallback((notif: Omit<AppNotification, 'id' | 'read' | 'timestamp'>) => {
    const newNotif: AppNotification = {
      ...notif,
      id: `notif-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`,
      read: false,
      timestamp: Date.now(),
    };
    setNotifications(prev => [newNotif, ...prev]);
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    api.markNotificationRead(id).catch(() => {});
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    api.markAllNotificationsRead().catch(() => {});
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      addNotification,
      markAsRead,
      markAllAsRead,
      clearAll,
      removeNotification
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    return {
      notifications: [],
      unreadCount: 0,
      addNotification: () => {},
      markAsRead: () => {},
      markAllAsRead: () => {},
      clearAll: () => {},
      removeNotification: () => {}
    };
  }
  return context;
}
