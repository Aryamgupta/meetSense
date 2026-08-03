"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

export default function SettingsPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    <div className="bg-background-page text-on-surface min-h-screen">
      <header className="w-full sticky top-0 bg-surface-container-lowest border-b border-outline-variant z-40">
        <div className="flex justify-between items-center px-4 md:px-margin-desktop py-4 w-full max-w-full mx-auto">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/dashboard')} className="flex items-center justify-center p-2 rounded-lg hover:bg-surface-container-low transition-all cursor-pointer">
              <span className="material-symbols-outlined text-on-surface-variant">arrow_back</span>
            </button>
            <h1 className="text-headline-sm font-headline-sm font-bold text-primary">Settings</h1>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 md:px-0 py-12">
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm p-8">
          <h2 className="text-headline-sm font-bold text-on-surface mb-6">Account Information</h2>
          
          <div className="mb-8">
            <label className="block text-label-md font-label-md text-on-surface-variant uppercase tracking-wider mb-2">
              Email Address
            </label>
            <input
              type="text"
              value={email}
              disabled
              className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface-variant opacity-70 cursor-not-allowed"
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
            
            <div className="mb-6">
              <label className="block text-label-md font-label-md text-on-surface-variant uppercase tracking-wider mb-2">
                New Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-white text-body-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all-200"
              />
            </div>

            <button
              type="submit"
              disabled={loading || password.length < 6}
              className="bg-primary text-on-primary px-6 py-2.5 rounded-lg font-button hover:opacity-90 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
