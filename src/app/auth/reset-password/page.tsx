"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (password !== confirmPassword) {
        throw new Error("Passwords do not match");
      }
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;
      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="w-full max-w-md mx-auto mt-20 px-4">
      <header className="flex flex-col items-center mb-stack-lg">
        <div className="flex items-center gap-2 mb-4">
          <img src="/logo.svg" alt="MeetSense Logo" className="h-12 object-contain" />
        </div>
      </header>

      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden p-stack-lg md:p-10">
        <div className="text-center mb-stack-lg">
          <h2 className="text-headline-md font-headline-md text-on-surface mb-2">
            Set new password
          </h2>
          <p className="text-body-sm font-body-sm text-on-surface-variant">
            Please enter your new password below.
          </p>
        </div>

        {success ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-status-success rounded-full flex items-center justify-center text-on-primary mx-auto mb-4">
              <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
            </div>
            <h3 className="text-headline-sm font-bold text-on-surface mb-2">Password Updated</h3>
            <p className="text-body-md text-on-surface-variant">Redirecting to dashboard...</p>
          </div>
        ) : (
          <form className="space-y-stack-md" onSubmit={handleReset}>
            {error && (
              <div className="p-3 bg-error-container text-on-error-container rounded-lg mb-4 text-sm">
                {error}
              </div>
            )}
            <div className="space-y-unit">
              <label className="text-label-md font-label-md text-on-surface-variant uppercase tracking-wider" htmlFor="password">
                New Password
              </label>
              <div className="relative">
                <input
                  className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-white text-body-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all-200 pr-12"
                  id="password"
                  placeholder="••••••••"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
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
            <div className="space-y-unit">
              <label className="text-label-md font-label-md text-on-surface-variant uppercase tracking-wider" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-white text-body-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all-200 pr-12"
                  id="confirmPassword"
                  placeholder="••••••••"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors focus:outline-none"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showConfirmPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>
            <button
              className="w-full bg-primary text-on-primary py-3 px-4 rounded-lg text-button font-button hover:bg-primary/90 transition-all-200 shadow-sm active:scale-[0.98] mt-4 disabled:opacity-50"
              type="submit"
              disabled={loading || password.length < 6}
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
