"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const passwordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export default function SecurityTab() {
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [globalSuccess, setGlobalSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({ resolver: zodResolver(passwordSchema) });

  const onPasswordSubmit = async (data: z.infer<typeof passwordSchema>) => {
    setIsUpdatingPassword(true);
    setGlobalError(null); setGlobalSuccess(null);
    try {
      const { error } = await supabase.auth.updateUser({ password: data.password });
      if (error) throw error;
      setGlobalSuccess("Password updated successfully!");
      passwordForm.reset();
    } catch (err: any) {
      setGlobalError(err.message || "Failed to update password");
    } finally {
      setIsUpdatingPassword(false);
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

      <h2 className="text-headline-sm font-bold mb-6">Privacy & Security</h2>
      
      <div className="mb-10">
        <h3 className="text-title-lg font-bold mb-2 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">passkey</span>
          Passkeys
        </h3>
        <p className="text-body-md text-on-surface-variant mb-6">Use your device biometrics (fingerprint, face recognition) for passwordless login.</p>
        <button className="bg-surface-container-high hover:bg-surface-container-highest text-on-surface px-6 py-3 rounded-full font-bold shadow-sm transition-all border border-outline-variant/50">
          Register New Passkey
        </button>
      </div>

      <hr className="border-outline-variant/30 my-8" />

      <h3 className="text-title-lg font-bold mb-4 flex items-center gap-2">
        <span className="material-symbols-outlined text-primary">password</span>
        Update Password
      </h3>
      <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6 max-w-md">
        <div>
          <label className="block text-label-md font-semibold text-on-surface-variant uppercase tracking-wider mb-2">New Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              {...passwordForm.register("password")}
              placeholder="••••••••"
              className="w-full glass-input px-5 py-3 rounded-xl text-body-lg focus:outline-none pr-12 focus:ring-2 focus:ring-primary/50"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors focus:outline-none"
            >
              <span className="material-symbols-outlined text-[20px]">{showPassword ? "visibility_off" : "visibility"}</span>
            </button>
          </div>
          {passwordForm.formState.errors.password && <p className="text-error text-body-sm mt-1">{passwordForm.formState.errors.password.message}</p>}
        </div>

        <button type="submit" disabled={isUpdatingPassword} className="bg-primary text-on-primary px-8 py-3 rounded-full font-bold hover:shadow-lg transition-all active:scale-95 disabled:opacity-50 hover:scale-105">
          {isUpdatingPassword ? "Updating..." : "Update Password"}
        </button>
      </form>
    </div>
  );
}
