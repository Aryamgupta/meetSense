"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";

type AppNotification = {
  id: string;
  title: string;
  message: string;
  link_url: string;
  is_read: boolean;
  created_at: string;
};

export default function NotificationPanel({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  useEffect(() => {
    const fetchUserAndNotifications = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const { data } = await supabase
        .from("app_notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (data) setNotifications(data);
    };

    if (isOpen) {
      fetchUserAndNotifications();
    }
  }, [isOpen, supabase]);

  const markAsRead = async (id: string) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
    await supabase.from("app_notifications").update({ is_read: true }).eq("id", id);
  };

  const markAllAsRead = async () => {
    setNotifications(notifications.map(n => ({ ...n, is_read: true })));
    if (userId) {
      await supabase.from("app_notifications").update({ is_read: true }).eq("user_id", userId);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose}></div>
      <div className="fixed top-20 right-4 w-96 max-w-[90vw] glass-panel border border-white/20 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[80vh] animate-in slide-in-from-right-4 fade-in">
        <div className="p-4 border-b border-outline-variant/30 flex justify-between items-center bg-white/5">
          <h3 className="font-bold text-title-md flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">notifications</span>
            Notifications
          </h3>
          <div className="flex items-center gap-2">
            <button onClick={markAllAsRead} className="text-label-sm text-primary hover:underline font-semibold">Mark all as read</button>
            <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface p-1 rounded-full hover:bg-white/10 transition">
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-2 space-y-2 bg-gradient-to-br from-background-page to-surface">
          {notifications.length === 0 ? (
            <div className="text-center p-8 text-on-surface-variant">
              <span className="material-symbols-outlined text-[48px] mb-2 opacity-50">notifications_paused</span>
              <p className="font-medium text-body-md">You're all caught up!</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div 
                key={n.id} 
                className={`p-4 rounded-xl border transition-all ${n.is_read ? 'bg-white/5 border-transparent opacity-75' : 'bg-primary/5 border-primary/20 shadow-sm'}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <h4 className={`font-bold text-body-md ${n.is_read ? 'text-on-surface' : 'text-primary'}`}>{n.title}</h4>
                  {!n.is_read && <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5"></span>}
                </div>
                {n.message && <p className="text-body-sm text-on-surface-variant mb-3">{n.message}</p>}
                
                <div className="flex items-center justify-between mt-2">
                  <span className="text-label-sm text-on-surface-variant/70">
                    {new Date(n.created_at).toLocaleDateString()} {new Date(n.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                  
                  <div className="flex gap-2">
                    {n.link_url && (
                      <a href={n.link_url} onClick={() => markAsRead(n.id)} className="text-label-sm bg-primary text-on-primary px-3 py-1.5 rounded-lg font-bold hover:shadow-md transition">
                        View
                      </a>
                    )}
                    {!n.is_read && (
                      <button onClick={() => markAsRead(n.id)} className="text-label-sm text-on-surface-variant hover:text-on-surface px-2 py-1.5 rounded-lg border border-outline-variant/30 hover:bg-white/10 transition">
                        Dismiss
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
