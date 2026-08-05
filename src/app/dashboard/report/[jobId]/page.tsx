"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { toast } from "react-hot-toast";

export default function ReportPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.jobId as string;
  const [htmlContent, setHtmlContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    if (!jobId) return;

    const fetchReport = async () => {
      try {
        const { data, error } = await supabase
          .from("background_jobs")
          .select("result_data")
          .eq("id", jobId)
          .single();

        if (error) throw error;
        
        const url = data?.result_data?.url;
        if (!url) throw new Error("No URL found");

        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch HTML");

        const html = await response.text();
        setHtmlContent(html);
      } catch (err: any) {
        console.error("Error fetching report:", err);
        toast.error("Failed to load report. It may have expired.");
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [jobId]);

  const downloadPdf = async () => {
    if (!reportRef.current) return;
    setIsGenerating(true);
    toast.loading("Generating PDF...", { id: "pdf-toast" });
    
    try {
      // We load html2pdf dynamically so it doesn't break SSR
      const html2pdf = (await import('html2pdf.js')).default;
      
      const opt: any = {
        margin:       0.5,
        filename:     `meetsense_report_${Date.now()}.pdf`,
        image:        { type: 'jpeg' as const, quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
      };

      await html2pdf().set(opt).from(reportRef.current).save();
      toast.success("PDF Downloaded successfully!", { id: "pdf-toast" });
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate PDF.", { id: "pdf-toast" });
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!htmlContent) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold mb-4">Report Not Found</h1>
        <button onClick={() => router.push("/dashboard/settings")} className="text-primary hover:underline">
          Go back to Data Management
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 animate-in fade-in">
      <div className="flex items-center justify-between mb-8 bg-surface-container p-4 rounded-xl shadow-sm">
        <div>
          <h1 className="text-xl font-bold">Data Report</h1>
          <p className="text-sm text-on-surface-variant">Review your data before downloading.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => router.push("/dashboard/settings")}
            className="px-4 py-2 text-sm font-medium border border-outline rounded-lg hover:bg-surface-variant transition-colors"
          >
            Back
          </button>
          <button 
            onClick={downloadPdf}
            disabled={isGenerating}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-lg font-medium shadow-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[20px]">
              {isGenerating ? "hourglass_empty" : "download"}
            </span>
            {isGenerating ? "Processing..." : "Download as PDF"}
          </button>
        </div>
      </div>

      <div 
        ref={reportRef} 
        className="bg-white rounded-xl shadow-sm p-4 overflow-x-auto" 
        dangerouslySetInnerHTML={{ __html: htmlContent }} 
      />
    </div>
  );
}
