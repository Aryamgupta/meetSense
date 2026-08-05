"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const notificationSchema = z.object({
  inApp: z.boolean(),
  email: z.boolean(),
  frequency: z.enum(["immediate", "daily", "weekly"]),
});
type NotificationValues = z.infer<typeof notificationSchema>;

export default function NotificationsTab() {
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [globalSuccess, setGlobalSuccess] = useState<string | null>(null);
  const [userId, setUserId] = useState("");

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const notificationForm = useForm<NotificationValues>({ 
    resolver: zodResolver(notificationSchema),
    defaultValues: { inApp: true, email: true, frequency: "immediate" }
  });

  useEffect(() => {
    const fetchUserAndProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const { data: profile } = await supabase
        .from('profiles')
        .select('notification_in_app, notification_email, notification_frequency')
        .eq('id', user.id)
        .single();
      
      if (profile) {
        notificationForm.reset({
          inApp: profile.notification_in_app ?? true,
          email: profile.notification_email ?? true,
          frequency: (profile.notification_frequency as any) || "immediate"
        });
      }
    };
    fetchUserAndProfile();
  }, [supabase, notificationForm]);

  const onNotificationSubmit = async (data: NotificationValues) => {
    setGlobalError(null); setGlobalSuccess(null);
    try {
      const { error } = await supabase.from('profiles').upsert({
        id: userId,
        notification_in_app: data.inApp,
        notification_email: data.email,
        notification_frequency: data.frequency
      });
      if (error) throw error;
      setGlobalSuccess("Notification preferences updated!");
    } catch (err: any) {
      setGlobalError(err.message || "Failed to update notifications");
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4">
      {globalError && (
        <div className="mb-6 p-4 bg-error-container text-on-error-container rounded-xl flex items-center gap-3 animate-in fade-in">
          <span className="material-symbols-outlined">error</span>
          <p className="font-medium">{globalError}</p>
        </div>
      )}
      {globalSuccess && (
        <div className="mb-6 p-4 bg-status-success/20 text-status-success border border-status-success/30 rounded-xl flex items-center gap-3 animate-in fade-in">
          <span className="material-symbols-outlined">check_circle</span>
          <p className="font-bold">{globalSuccess}</p>
        </div>
      )}

      <h2 className="text-headline-sm font-bold mb-2">Notification Preferences</h2>
      <p className="text-body-md text-on-surface-variant mb-8">Control how and when you receive task and meeting updates.</p>

      <form onSubmit={notificationForm.handleSubmit(onNotificationSubmit)} className="space-y-8">
        <div className="flex items-center justify-between p-5 rounded-2xl glass-panel border border-white/40">
          <div className="flex flex-col gap-1">
            <span className="font-bold text-body-lg text-on-surface">In-App Notifications</span>
            <span className="text-body-sm text-on-surface-variant">Receive alerts within the dashboard for overdue tasks.</span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" {...notificationForm.register("inApp")} />
            <div className="w-11 h-6 bg-outline-variant/30 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-inner"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-5 rounded-2xl glass-panel border border-white/40">
          <div className="flex flex-col gap-1">
            <span className="font-bold text-body-lg text-on-surface">Email Notifications</span>
            <span className="text-body-sm text-on-surface-variant">Receive task deadlines and system summaries via email.</span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" {...notificationForm.register("email")} />
            <div className="w-11 h-6 bg-outline-variant/30 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-inner"></div>
          </label>
        </div>

        <div>
          <label className="block text-label-md font-semibold text-on-surface-variant uppercase tracking-wider mb-3">Email Digest Frequency</label>
          <div className="flex flex-col sm:flex-row gap-4">
            {["immediate", "daily", "weekly"].map((freq) => (
              <label key={freq} className={`flex-1 p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-3 ${notificationForm.watch("frequency") === freq ? "border-primary bg-primary/5" : "border-outline-variant/30 glass-panel hover:border-primary/50"}`}>
                <input type="radio" value={freq} {...notificationForm.register("frequency")} className="w-4 h-4 text-primary focus:ring-primary" />
                <span className="capitalize font-bold text-on-surface">{freq}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-outline-variant/30 flex justify-end">
          <button type="submit" disabled={notificationForm.formState.isSubmitting} className="bg-primary text-on-primary px-8 py-3 rounded-full font-bold hover:shadow-lg transition-all hover:scale-105 disabled:opacity-50">
            {notificationForm.formState.isSubmitting ? "Saving..." : "Save Preferences"}
          </button>
        </div>
      </form>
    </div>
  );
}
