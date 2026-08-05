"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const profileSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  jobTitle: z.string().optional(),
  company: z.string().optional(),
});
type ProfileValues = z.infer<typeof profileSchema>;

export default function AccountTab() {
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [globalSuccess, setGlobalSuccess] = useState<string | null>(null);
  const [userId, setUserId] = useState("");
  const [userEmail, setUserEmail] = useState("");

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const profileForm = useForm<ProfileValues>({ resolver: zodResolver(profileSchema) });

  useEffect(() => {
    const fetchUserAndProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);
      setUserEmail(user.email || "");

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profile) {
        profileForm.reset({
          fullName: profile.full_name || "",
          jobTitle: profile.job_title || "",
          company: profile.company || ""
        });
      }
    };
    fetchUserAndProfile();
  }, [supabase, profileForm]);

  const onProfileSubmit = async (data: ProfileValues) => {
    setGlobalError(null); setGlobalSuccess(null);
    try {
      const { error } = await supabase.from('profiles').upsert({
        id: userId,
        full_name: data.fullName,
        job_title: data.jobTitle,
        company: data.company
      });
      if (error) throw error;
      setGlobalSuccess("Profile updated successfully!");
    } catch (err: any) {
      setGlobalError(err.message || "Failed to update profile");
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

      <h2 className="text-headline-sm font-bold mb-6">Profile Information</h2>
      
      <div className="mb-8 flex items-center gap-6">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-display shadow-lg border-4 border-background-page">
          {profileForm.watch("fullName")?.charAt(0)?.toUpperCase() || userEmail.charAt(0)?.toUpperCase() || "?"}
        </div>
        <div>
          <button className="bg-surface-container-high hover:bg-surface-container-highest text-on-surface px-5 py-2.5 rounded-full font-bold text-label-md transition-colors border border-outline-variant/50 shadow-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">upload</span>
            Upload New Avatar
          </button>
        </div>
      </div>

      <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
        <div>
          <label className="block text-label-md font-semibold text-on-surface-variant uppercase tracking-wider mb-2">Email Address</label>
          <input type="text" value={userEmail} disabled className="w-full px-5 py-3 rounded-xl border border-outline-variant/50 bg-white/20 text-on-surface-variant opacity-80 cursor-not-allowed" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-label-md font-semibold text-on-surface-variant uppercase tracking-wider mb-2">Full Name</label>
            <input {...profileForm.register("fullName")} className="w-full glass-input px-5 py-3 rounded-xl text-body-lg focus:outline-none focus:ring-2 focus:ring-primary/50" />
            {profileForm.formState.errors.fullName && <p className="text-error text-body-sm mt-1">{profileForm.formState.errors.fullName.message}</p>}
          </div>
          <div>
            <label className="block text-label-md font-semibold text-on-surface-variant uppercase tracking-wider mb-2">Job Title</label>
            <input {...profileForm.register("jobTitle")} className="w-full glass-input px-5 py-3 rounded-xl text-body-lg focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </div>
        </div>

        <div>
          <label className="block text-label-md font-semibold text-on-surface-variant uppercase tracking-wider mb-2">Company</label>
          <input {...profileForm.register("company")} className="w-full glass-input px-5 py-3 rounded-xl text-body-lg focus:outline-none focus:ring-2 focus:ring-primary/50" />
        </div>

        <div className="pt-4 border-t border-outline-variant/30 flex justify-end">
          <button type="submit" disabled={profileForm.formState.isSubmitting} className="bg-primary text-on-primary px-8 py-3 rounded-full font-bold hover:shadow-lg transition-all hover:scale-105 disabled:opacity-50">
            {profileForm.formState.isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
