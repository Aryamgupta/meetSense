"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  message: z.string().min(20, "Message must be at least 20 characters"),
});
type ContactValues = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactValues) => {
    setError(null);
    setSuccess(false);
    try {
      // Mock API call to Resend
      console.log("Sending email to dev via Resend...", data);
      await new Promise((r) => setTimeout(r, 1000));
      setSuccess(true);
      reset();
    } catch (err: any) {
      setError("Failed to send message. Please try again later.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] pointer-events-none -z-10"></div>
      
      <main className="flex-1 max-w-2xl mx-auto px-4 py-32 w-full mt-10 relative z-10">
        <div className="text-center mb-12">
          <h1 className="text-display font-display text-on-surface mb-4 font-bold">Contact Us</h1>
          <p className="text-body-xl text-on-surface-variant">
            Have questions or need support? We'd love to hear from you.
          </p>
        </div>
        
        <div className="glass-panel p-8 md:p-12 rounded-3xl border border-outline-variant/30 shadow-premium">
          {success && (
            <div className="mb-8 p-4 bg-status-success/20 text-status-success border border-status-success/30 rounded-xl flex items-center gap-3 animate-in fade-in">
              <span className="material-symbols-outlined">check_circle</span>
              <p className="font-bold">Your message has been sent successfully! We'll get back to you soon.</p>
            </div>
          )}
          
          {error && (
            <div className="mb-8 p-4 bg-error-container text-on-error-container rounded-xl flex items-center gap-3 animate-in fade-in">
              <span className="material-symbols-outlined">error</span>
              <p className="font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-label-sm font-bold text-on-surface-variant uppercase tracking-wider mb-2">Name</label>
                <input {...register("name")} className="w-full glass-input px-5 py-3.5 rounded-xl text-body-lg focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="John Doe" />
                {errors.name && <p className="text-error text-body-sm mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <label className="block text-label-sm font-bold text-on-surface-variant uppercase tracking-wider mb-2">Email</label>
                <input type="email" {...register("email")} className="w-full glass-input px-5 py-3.5 rounded-xl text-body-lg focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="john@example.com" />
                {errors.email && <p className="text-error text-body-sm mt-1">{errors.email.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-label-sm font-bold text-on-surface-variant uppercase tracking-wider mb-2">Message</label>
              <textarea {...register("message")} rows={6} className="w-full glass-input px-5 py-3.5 rounded-xl text-body-lg focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" placeholder="How can we help you?"></textarea>
              {errors.message && <p className="text-error text-body-sm mt-1">{errors.message.message}</p>}
            </div>

            <button type="submit" disabled={isSubmitting} className="w-full bg-gradient-to-r from-primary to-secondary text-on-primary px-8 py-4 rounded-xl font-bold text-lg hover:shadow-xl transition-all active:scale-95 disabled:opacity-50">
              {isSubmitting ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
