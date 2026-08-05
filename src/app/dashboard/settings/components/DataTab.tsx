"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { toast } from "react-hot-toast";

type Job = {
  id: string;
  job_type: string;
  status: string;
};

export default function DataTab() {
  const [userId, setUserId] = useState<string | null>(null);
  const [activeJobs, setActiveJobs] = useState<Job[]>([]);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserId(user.id);
        fetchJobs(user.id);
      }
    });
  }, [supabase]);

  const fetchJobs = async (uid: string) => {
    const { data } = await supabase
      .from("background_jobs")
      .select("*")
      .eq("user_id", uid)
      .in("status", ["pending", "processing"]);
    if (data) setActiveJobs(data);
  };

  const isJobActive = (type: string) => activeJobs.some(j => j.job_type === type);

  const requestJob = async (jobType: string) => {
    if (!userId) return;
    try {
      const { error } = await supabase.from("background_jobs").insert({
        user_id: userId,
        job_type: jobType,
        status: "pending"
      });
      if (error) throw error;
      
      toast.success("Task queued successfully. You will receive a notification when it finishes.");
      fetchJobs(userId);
      
      // Kick off processing worker
      fetch("/api/jobs/process", { method: "POST" })
        .then(res => res.json())
        .catch(err => console.error("Worker fetch error:", err));
    } catch (err) {
      toast.error("Failed to queue the task.");
    }
  };
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4">
      <h2 className="text-headline-sm font-bold mb-2">Data Management</h2>
      <p className="text-body-md text-on-surface-variant mb-8">Export your data or clean up your workspace.</p>

      <div className="space-y-6">
        <div className="p-6 glass-panel rounded-2xl border border-white/40 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
          <div>
            <h3 className="text-title-md font-bold mb-1">Export My Data</h3>
            <p className="text-body-sm text-on-surface-variant max-w-sm">Download your meetings, projects, and action items in a highly organized format.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button 
              onClick={() => requestJob("export_excel")}
              disabled={isJobActive("export_excel")}
              className="bg-surface-container-high hover:bg-surface-container-highest text-on-surface px-6 py-3 rounded-full font-bold shadow-sm transition-all border border-outline-variant/50 flex items-center justify-center gap-2 flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined">{isJobActive("export_excel") ? "hourglass_empty" : "table_chart"}</span>
              {isJobActive("export_excel") ? "Processing..." : "Export as Excel"}
            </button>
            <button 
              onClick={() => requestJob("export_html")}
              disabled={isJobActive("export_html")}
              className="bg-secondary text-on-secondary px-6 py-3 rounded-full font-bold shadow-sm transition-all hover:bg-secondary/90 flex items-center justify-center gap-2 flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined">{isJobActive("export_html") ? "hourglass_empty" : "picture_as_pdf"}</span>
              {isJobActive("export_html") ? "Processing..." : "Export as PDF"}
            </button>
          </div>
        </div>

        <div className="p-6 bg-error-container/10 border border-error/20 rounded-2xl flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
          <div>
            <h3 className="text-title-md font-bold text-error mb-1">Cleanup Tasks</h3>
            <p className="text-body-sm text-error/80 max-w-sm">Permanently delete empty meetings or unprocessed failed uploads. This action cannot be undone.</p>
          </div>
          <button 
            onClick={() => requestJob("cleanup_data")}
            disabled={isJobActive("cleanup_data")}
            className="bg-error text-on-error px-6 py-3 rounded-full font-bold shadow-sm transition-all hover:bg-error/90 flex items-center gap-2 flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined">{isJobActive("cleanup_data") ? "hourglass_empty" : "delete_sweep"}</span>
            {isJobActive("cleanup_data") ? "Cleaning..." : "Clean Up Now"}
          </button>
        </div>
      </div>
    </div>
  );
}
