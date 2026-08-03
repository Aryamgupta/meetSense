"use client";
import { useState } from "react";
import Link from "next/link";

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      message: formData.get("message"),
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error("Failed to send message.");
      }
      setSuccess(true);
      (e.target as HTMLFormElement).reset();
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-xl mx-auto px-4 py-16">
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-8 shadow-sm">
          <h1 className="text-display font-display text-on-surface mb-2">
            Contact Support
          </h1>
          <p className="text-body-md text-on-surface-variant mb-8">
            Have a question or need help? Send us a message and we'll get back
            to you as soon as possible.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-error-container text-on-error-container rounded-lg text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="p-4 bg-status-success/20 text-status-success rounded-lg text-sm font-medium">
                Message sent successfully! We'll be in touch.
              </div>
            )}

            <div className="space-y-2">
              <label
                htmlFor="name"
                className="text-label-md font-label-md text-on-surface-variant uppercase tracking-wider"
              >
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="w-full bg-surface-container-low border-b-2 border-outline-variant px-4 py-3 text-on-surface focus:outline-none focus:border-secondary focus:bg-surface-container transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-label-md font-label-md text-on-surface-variant uppercase tracking-wider"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full bg-surface-container-low border-b-2 border-outline-variant px-4 py-3 text-on-surface focus:outline-none focus:border-secondary focus:bg-surface-container transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="message"
                className="text-label-md font-label-md text-on-surface-variant uppercase tracking-wider"
              >
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows={5}
                required
                className="w-full bg-surface-container-low border-b-2 border-outline-variant px-4 py-3 text-on-surface focus:outline-none focus:border-secondary focus:bg-surface-container transition-colors resize-none"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-secondary text-on-secondary py-4 rounded-xl font-button text-lg hover:shadow-lg hover:shadow-secondary/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
