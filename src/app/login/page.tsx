"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("tab") === "signup") {
        setIsLogin(false);
      }
    }
  }, []);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      if (isForgotPassword) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${location.origin}/auth/reset-password`,
        });
        if (error) throw error;
        setSuccessMsg("Password reset email sent! Please check your inbox.");
      } else if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push("/dashboard");
        router.refresh();
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${location.origin}/auth/callback`,
          },
        });
        if (error) throw error;

        if (data.session === null) {
          setSuccessMsg("Account created! Please check your email to confirm your account.");
        } else {
          router.push("/dashboard");
          router.refresh();
        }
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });
    if (error) setError(error.message);
  };

  const handleGithubSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });
    if (error) setError(error.message);
  };

  const handlePasskeySignIn = async () => {
    const { error } = await supabase.auth.signInWithPasskey();
    if (error) setError(error.message);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <main className="w-full max-w-md">
        <header className="flex flex-col items-center mb-stack-lg">
          <div className="flex items-center gap-2 mb-4">
            <img src="/logo.png" alt="MeetSense Logo" className="h-12 object-contain" />
          </div>
        </header>

        <div
          className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden transition-all-200"
          id="auth-card"
        >
          <div className="flex border-b border-outline-variant">
            <button
              type="button"
              onClick={() => { setIsLogin(true); setIsForgotPassword(false); }}
              className={`flex-1 py-4 text-label-md font-label-md transition-all-200 ${isLogin && !isForgotPassword ? "text-primary border-b-2 border-primary" : "text-on-surface-variant"}`}
              id="login-tab"
            >
              SIGN IN
            </button>
            <button
              type="button"
              onClick={() => { setIsLogin(false); setIsForgotPassword(false); }}
              className={`flex-1 py-4 text-label-md font-label-md transition-all-200 hover:text-primary ${!isLogin && !isForgotPassword ? "text-primary border-b-2 border-primary" : "text-on-surface-variant"}`}
              id="signup-tab"
            >
              SIGN UP
            </button>
          </div>
          <div className="p-stack-lg md:p-10">
            <div className="text-center mb-stack-lg">
              <h2
                className="text-headline-md font-headline-md text-on-surface mb-2"
                id="form-title"
              >
                {isForgotPassword ? "Reset your password" : isLogin ? "Welcome back" : "Create your account"}
              </h2>
              <p
                className="text-body-sm font-body-sm text-on-surface-variant"
                id="form-subtitle"
              >
                {isForgotPassword
                  ? "Enter your email and we'll send you a reset link"
                  : isLogin
                    ? "Enter your details to access your account"
                    : "Join thousands of teams using MeetSense today"}
              </p>
            </div>

            {!isForgotPassword && (
              <>
                <div className="flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-outline-variant rounded-lg bg-white text-button font-button text-on-surface-variant hover:bg-surface-container-low hover:border-outline transition-all-200 active:scale-[0.98]">
                    <svg height="20" viewBox="0 0 24 24" width="20" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335"></path>
                    </svg>
                    Continue with Google
                  </button>

                  <button
                    type="button"
                    onClick={handleGithubSignIn}
                    className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-outline-variant rounded-lg bg-white text-button font-button text-on-surface-variant hover:bg-surface-container-low hover:border-outline transition-all-200 active:scale-[0.98]">
                    <svg height="20" viewBox="0 0 24 24" width="20" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" fill="#181717" />
                    </svg>
                    Continue with GitHub
                  </button>

                  <button
                    type="button"
                    onClick={handlePasskeySignIn}
                    className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-outline-variant rounded-lg bg-surface-container-low text-button font-button text-on-surface-variant hover:bg-surface-container hover:border-outline transition-all-200 active:scale-[0.98]">
                    <span className="material-symbols-outlined text-[20px]">fingerprint</span>
                    Sign in with Passkey
                  </button>
                </div>

                <div className="relative my-stack-lg">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-outline-variant"></div>
                  </div>
                  <div className="relative flex justify-center text-label-md">
                    <span className="px-4 bg-surface-container-lowest text-on-surface-variant font-label-md">
                      OR CONTINUE WITH EMAIL
                    </span>
                  </div>
                </div>
              </>
            )}

            <form
              className="space-y-stack-md"
              onSubmit={handleAuth}
              id="auth-form"
            >
              {error && (
                <div className="p-3 bg-error-container text-on-error-container rounded-lg text-sm">
                  {error}
                </div>
              )}
              {successMsg && (
                <div className="p-3 bg-status-success/20 text-status-success rounded-lg text-sm font-medium">
                  {successMsg}
                </div>
              )}
              <div className="space-y-unit">
                <label
                  className="text-label-md font-label-md text-on-surface-variant uppercase tracking-wider"
                  htmlFor="email"
                >
                  Email Address
                </label>
                <input
                  className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-white text-body-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all-200"
                  id="email"
                  placeholder="name@company.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-unit">
                <div className="flex justify-between items-center">
                  <label
                    className="text-label-md font-label-md text-on-surface-variant uppercase tracking-wider"
                    htmlFor="password"
                  >
                    Password
                  </label>
                  {!isForgotPassword && (
                    <button
                      type="button"
                      className="text-body-sm font-body-sm text-primary hover:underline"
                      id="forgot-password"
                      onClick={() => setIsForgotPassword(true)}
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                {!isForgotPassword && (
                  <input
                    className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-white text-body-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all-200"
                    id="password"
                    placeholder="••••••••"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                )}
              </div>
              <button
                className="w-full bg-primary text-on-primary py-3 px-4 rounded-lg text-button font-button hover:bg-primary/90 transition-all-200 shadow-sm active:scale-[0.98] mt-4 disabled:opacity-50"
                id="submit-btn"
                type="submit"
                disabled={loading}
              >
                {loading
                  ? "Please wait..."
                  : isForgotPassword
                    ? "Send Reset Link"
                    : isLogin
                      ? "Sign In"
                      : "Create Account"}
              </button>
            </form>

            <div className="mt-stack-lg text-center">
              <p className="text-body-sm font-body-sm text-on-surface-variant">
                <span id="toggle-text">
                  {isForgotPassword
                    ? "Remember your password?"
                    : isLogin
                      ? "Don't have an account?"
                      : "Already have an account?"}
                </span>
                <button
                  type="button"
                  onClick={() => { setIsLogin(!isLogin); setIsForgotPassword(false); }}
                  className="text-primary font-button hover:underline ml-1"
                  id="toggle-btn"
                >
                  {isForgotPassword ? "Sign in instead" : isLogin ? "Sign up for free" : "Sign in instead"}
                </button>
              </p>
            </div>
          </div>
        </div>


      </main>
    </div>
  );
}
