"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

export default function SettingsPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setEmail(user.email || "");
      } else {
        router.push("/login");
      }
    };
    getUser();
  }, [supabase, router]);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;
      setSuccess(true);
      setPassword("");
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-transparent text-on-surface min-h-screen">
      <main className="max-w-3xl mx-auto px-4 md:px-0 py-12">
        <div className="flex items-center gap-3 mb-8">
          <span className="material-symbols-outlined text-primary text-[32px]">settings</span>
          <h1 className="text-display font-display font-bold gradient-text">Settings</h1>
        </div>

        <div className="glass-panel border border-outline-variant/30 rounded-3xl shadow-premium p-8 animate-in fade-in slide-in-from-bottom-4">
          <h2 className="text-headline-md font-bold text-on-surface mb-6">Account Information</h2>
          
          <div className="mb-8">
            <label className="block text-label-md font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
              Email Address
            </label>
            <input
              type="text"
              value={email}
              disabled
              className="w-full px-5 py-4 rounded-xl border border-outline-variant/50 bg-white/20 text-on-surface-variant opacity-80 cursor-not-allowed"
            />
            <p className="text-body-sm text-on-surface-variant mt-2">
              Your email is managed by your authentication provider.
            </p>
          </div>

          <hr className="border-outline-variant my-8" />

          <h2 className="text-headline-sm font-bold text-on-surface mb-6">Security</h2>
          
          <form onSubmit={handleUpdatePassword}>
            {error && (
              <div className="p-3 bg-error-container text-on-error-container rounded-lg mb-4 text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="p-3 bg-status-success/20 text-status-success rounded-lg mb-4 text-sm font-medium">
                Password updated successfully.
              </div>
            )}
            
            <div className="mb-8">
              <label className="block text-label-md font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={8}
                  className="w-full glass-input px-5 py-4 rounded-xl text-body-lg focus:outline-none pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || password.length < 6}
              className="bg-gradient-to-r from-primary to-secondary text-white px-8 py-3.5 rounded-full font-bold shadow-premium hover:shadow-lg transition-all active:scale-95 disabled:opacity-50 hover:scale-105"
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
