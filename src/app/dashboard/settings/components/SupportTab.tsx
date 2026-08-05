"use client";

import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createBrowserClient } from "@supabase/ssr";

const supportSchema = z.object({
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(20, "Message must be at least 20 characters"),
});
type SupportValues = z.infer<typeof supportSchema>;

export default function SupportTab() {
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [globalSuccess, setGlobalSuccess] = useState<string | null>(null);

  const [userId, setUserId] = useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
    });
  }, [supabase]);

  const supportForm = useForm<SupportValues>({ resolver: zodResolver(supportSchema) });

  const onSupportSubmit = async (data: SupportValues) => {
    setGlobalError(null); setGlobalSuccess(null);
    try {
      const response = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, userId }),
      });

      if (!response.ok) throw new Error("Failed to send support request");

      setGlobalSuccess("Support request sent successfully!");
      supportForm.reset();
    } catch (err: any) {
      setGlobalError("Failed to send support request");
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

      <h2 className="text-headline-sm font-bold mb-6">Help & Support</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* FAQs */}
        <div>
          <h3 className="text-title-lg font-bold mb-4">Frequently Asked Questions</h3>
          <div className="space-y-4">
            {[
              { q: "How does AI extraction work?", a: "MeetSense analyzes your meeting transcript to automatically identify decisions, action items, and key takeaways using advanced LLMs." },
              { q: "Can I search across all my projects?", a: "Yes, you can use Ask MeetSense with the 'Global' scope to search semantically across every meeting in your account." },
              { q: "What is a semantic search?", a: "Unlike keyword search, semantic search understands the meaning behind your query to find relevant discussions even if exact words weren't used." },
              { q: "Are my meetings private?", a: "Absolutely. We use enterprise-grade encryption and Row Level Security to ensure only you can access your data." },
              { q: "How do I group meetings?", a: "You can assign meetings to Projects (high-level topics) and Series (recurring instances) for easy organization." },
            ].map((faq, i) => (
              <details key={i} className="group glass-panel rounded-xl border border-white/20 overflow-hidden bg-white/10">
                <summary className="flex justify-between items-center font-bold cursor-pointer list-none p-4 hover:bg-white/10 transition-colors">
                  {faq.q}
                  <span className="transition group-open:rotate-180 material-symbols-outlined">expand_more</span>
                </summary>
                <div className="text-on-surface-variant p-4 pt-0 text-body-md bg-white/5">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>

        {/* Contact Form */}
        <div>
          <h3 className="text-title-lg font-bold mb-4">Contact Developer</h3>
          <form onSubmit={supportForm.handleSubmit(onSupportSubmit)} className="space-y-5 glass-panel p-6 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
            <div>
              <label className="block text-label-sm font-bold text-on-surface-variant uppercase tracking-wider mb-2">Subject</label>
              <input {...supportForm.register("subject")} className="w-full glass-input px-4 py-3 rounded-xl text-body-md focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="E.g., Feature Request" />
              {supportForm.formState.errors.subject && <p className="text-error text-body-sm mt-1">{supportForm.formState.errors.subject.message}</p>}
            </div>
            <div>
              <label className="block text-label-sm font-bold text-on-surface-variant uppercase tracking-wider mb-2">Message</label>
              <textarea {...supportForm.register("message")} rows={4} className="w-full glass-input px-4 py-3 rounded-xl text-body-md focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" placeholder="How can we help you?"></textarea>
              {supportForm.formState.errors.message && <p className="text-error text-body-sm mt-1">{supportForm.formState.errors.message.message}</p>}
            </div>
            <button type="submit" disabled={supportForm.formState.isSubmitting} className="w-full bg-primary text-on-primary px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all active:scale-95 disabled:opacity-50">
              {supportForm.formState.isSubmitting ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
