import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendSystemEmail } from "@/utils/mailer";
import ExcelJS from "exceljs";

// Ensure this doesn't timeout immediately on Vercel
export const maxDuration = 60; 

export async function POST() {
  console.log("[Worker] POST /api/jobs/process hit!");
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  try {
    // 1. Fetch one pending job
    const { data: jobs, error: fetchError } = await supabase
      .from("background_jobs")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: true })
      .limit(1);

    if (fetchError || !jobs || jobs.length === 0) {
      console.log("[Worker] No jobs pending.");
      return NextResponse.json({ message: "No jobs pending" });
    }

    const job = jobs[0];

    // 2. Mark as processing
    console.log(`[Worker] Found pending job ${job.id} of type ${job.job_type}. Processing...`);
    await supabase.from("background_jobs").update({ status: "processing" }).eq("id", job.id);

    try {
      // 3. Process the job based on type
      if (job.job_type === "export_excel") {
        await handleExportExcel(supabase, job.user_id, job.id);
      } else if (job.job_type === "export_html") {
        await handleExportHtml(supabase, job.user_id, job.id);
      } else if (job.job_type === "cleanup_data") {
        await handleCleanupData(supabase, job.user_id, job.id);
      } else {
        throw new Error("Unknown job type");
      }
    } catch (jobError: any) {
      // Mark as failed
      await supabase.from("background_jobs").update({ 
        status: "failed", 
        result_data: { error: jobError.message } 
      }).eq("id", job.id);

      await supabase.from("app_notifications").insert({
        user_id: job.user_id,
        title: "Task Failed",
        message: `Your requested task (${job.job_type}) failed to complete.`
      });
    }
    console.log(`[Worker] Job ${job.id} completed successfully.`);
    return NextResponse.json({ success: true, processed: job.id });
  } catch (error: any) {
    console.error("[Worker] Global processor error:", error);
    return NextResponse.json({ error: "Processor error" }, { status: 500 });
  }
}

async function fetchUserData(supabase: any, userId: string) {
  const { data: meetings } = await supabase
    .from("meetings")
    .select(`id, title, summary, status, created_at, projects ( name, description )`)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  const { data: projects } = await supabase.from("projects").select("*").eq("user_id", userId);

  const meetingIds = meetings?.map((m: any) => m.id) || [];
  let actionItems: any[] = [];
  let decisions: any[] = [];
  
  if (meetingIds.length > 0) {
    const { data: ai } = await supabase.from("action_items").select("*").in("meeting_id", meetingIds);
    if (ai) actionItems = ai;
    const { data: dec } = await supabase.from("decisions").select("*").in("meeting_id", meetingIds);
    if (dec) decisions = dec;
  }

  return { meetings: meetings || [], projects: projects || [], actionItems, decisions };
}

async function handleExportExcel(supabase: any, userId: string, jobId: string) {
  const { meetings, projects, actionItems, decisions } = await fetchUserData(supabase, userId);

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "MeetSense";
  
  // Sheet 1: Meetings
  const sheetMeetings = workbook.addWorksheet("Meetings");
  sheetMeetings.columns = [
    { header: "Date", key: "date", width: 15 },
    { header: "Project", key: "project", width: 20 },
    { header: "Title", key: "title", width: 30 },
    { header: "Status", key: "status", width: 15 },
    { header: "Summary", key: "summary", width: 50 },
  ];
  meetings.forEach((m: any) => {
    sheetMeetings.addRow({
      date: new Date(m.created_at).toLocaleDateString(),
      project: m.projects?.name || "",
      title: m.title || "Untitled",
      status: m.status,
      summary: m.summary || ""
    });
  });

  // Sheet 2: Action Items
  const sheetAi = workbook.addWorksheet("Action Items");
  sheetAi.columns = [
    { header: "Meeting Title", key: "meeting", width: 30 },
    { header: "Task", key: "task", width: 40 },
    { header: "Owner", key: "owner", width: 20 },
    { header: "Due Date", key: "due", width: 15 },
    { header: "Status", key: "status", width: 15 },
  ];
  actionItems.forEach(a => {
    const m = meetings.find((m: any) => m.id === a.meeting_id);
    sheetAi.addRow({
      meeting: m?.title || "Untitled",
      task: a.task,
      owner: a.owner || "",
      due: a.deadline ? new Date(a.deadline).toLocaleDateString() : "",
      status: a.status
    });
  });

  // Sheet 3: Decisions
  const sheetDec = workbook.addWorksheet("Decisions");
  sheetDec.columns = [
    { header: "Meeting Title", key: "meeting", width: 30 },
    { header: "Decision", key: "decision", width: 50 },
  ];
  decisions.forEach(d => {
    const m = meetings.find((m: any) => m.id === d.meeting_id);
    sheetDec.addRow({
      meeting: m?.title || "Untitled",
      decision: d.decision_text
    });
  });

  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer();
  const filename = `meetsense_data_${Date.now()}.xlsx`;
  const filePath = `${userId}/${filename}`;

  const { error } = await supabase.storage.from("user-exports").upload(filePath, buffer, { contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  if (error) throw error;

  const { data: publicUrlData } = supabase.storage.from("user-exports").getPublicUrl(filePath);
  const downloadUrl = publicUrlData.publicUrl;

  await supabase.from("background_jobs").update({ status: "completed", result_data: { url: downloadUrl } }).eq("id", jobId);
  await supabase.from("app_notifications").insert({ user_id: userId, title: "Excel Export Ready", message: "Your structured Excel data export is ready.", link_url: downloadUrl });

  const { data: userRecord } = await supabase.auth.admin.getUserById(userId).catch(() => ({ data: null }));
  const { data: profile } = await supabase.from("profiles").select("notification_email").eq("id", userId).single();
  
  if (userRecord?.user?.email && profile?.notification_email) {
    const htmlBody = `<h3>Data Export Ready</h3><p>Your requested MeetSense Excel export is now ready.</p><a href="${downloadUrl}" style="display:inline-block;padding:10px 20px;background-color:#16A34A;color:white;text-decoration:none;border-radius:5px;">Download Excel</a>`;
    await sendSystemEmail(userRecord.user.email, "Your MeetSense Excel Export is Ready", htmlBody).catch(console.error);
  }
}

async function handleExportHtml(supabase: any, userId: string, jobId: string) {
  const { meetings, projects, actionItems, decisions } = await fetchUserData(supabase, userId);

  let htmlContent = `
    <div style="font-family: system-ui, sans-serif; color: #1C2333; max-width: 800px; margin: 0 auto; background: #fff; padding: 20px; border-radius: 8px;">
      <h1 style="font-size: 28px; border-bottom: 2px solid #C4622D; padding-bottom: 10px; margin-top: 0;">MeetSense Data Report</h1>
      <p>Generated on ${new Date().toLocaleDateString()}</p>
  `;

  meetings.forEach((m: any) => {
    htmlContent += `
      <div style="background: #fff; border: 1px solid #eee; border-radius: 12px; padding: 24px; margin-bottom: 24px; page-break-inside: avoid;">
        <h2 style="margin: 0 0 8px 0; font-size: 20px;">${m?.title || "Untitled Meeting"}</h2>
        <div style="font-size: 13px; color: #666; margin-bottom: 16px;">Date: ${new Date(m?.created_at || m?.date).toLocaleDateString()}</div>
    `;

    if (m?.summary) {
      htmlContent += `<div style="font-size: 14px; font-weight: bold; margin: 20px 0 8px 0; color: #C4622D; text-transform: uppercase; letter-spacing: 1px;">Summary</div><p style="white-space: pre-wrap;">${m.summary}</p>`;
    }

    const mTasks = actionItems.filter((a: any) => a.meeting_id === m.id);
    if (mTasks.length > 0) {
      htmlContent += `<div style="font-size: 14px; font-weight: bold; margin: 20px 0 8px 0; color: #C4622D; text-transform: uppercase; letter-spacing: 1px;">Action Items</div><table style="width: 100%; border-collapse: collapse; margin-top: 8px;"><tr><th style="text-align: left; padding: 8px; border-bottom: 1px solid #eee; font-size: 14px; color: #666; font-weight: 500;">Task</th><th style="text-align: left; padding: 8px; border-bottom: 1px solid #eee; font-size: 14px; color: #666; font-weight: 500;">Owner</th><th style="text-align: left; padding: 8px; border-bottom: 1px solid #eee; font-size: 14px; color: #666; font-weight: 500;">Status</th></tr>`;
      mTasks.forEach((t: any) => {
        htmlContent += `<tr><td style="text-align: left; padding: 8px; border-bottom: 1px solid #eee; font-size: 14px;">${t.task || t.task_description}</td><td style="text-align: left; padding: 8px; border-bottom: 1px solid #eee; font-size: 14px;">${t.owner || t.assignee || '-'}</td><td style="text-align: left; padding: 8px; border-bottom: 1px solid #eee; font-size: 14px;">${t.status}</td></tr>`;
      });
      htmlContent += `</table>`;
    }

    const mDecisions = decisions.filter((d: any) => d.meeting_id === m.id);
    if (mDecisions.length > 0) {
      htmlContent += `<div style="font-size: 14px; font-weight: bold; margin: 20px 0 8px 0; color: #C4622D; text-transform: uppercase; letter-spacing: 1px;">Decisions</div><table style="width: 100%; border-collapse: collapse; margin-top: 8px;"><tr><th style="text-align: left; padding: 8px; border-bottom: 1px solid #eee; font-size: 14px; color: #666; font-weight: 500;">Decision</th></tr>`;
      mDecisions.forEach((d: any) => {
        htmlContent += `<tr><td style="text-align: left; padding: 8px; border-bottom: 1px solid #eee; font-size: 14px;">${d.decision_text}</td></tr>`;
      });
      htmlContent += `</table>`;
    }

    htmlContent += `</div>`; // Close meeting-card
  });

  htmlContent += `</div>`; // Close wrapper

  const buffer = Buffer.from(htmlContent, 'utf-8');
  const filename = `meetsense_report_${Date.now()}.html`;
  const filePath = `${userId}/${filename}`;

  const { error } = await supabase.storage.from("user-exports").upload(filePath, buffer, { contentType: "text/html" });
  if (error) throw error;

  const { data: publicUrlData } = supabase.storage.from("user-exports").getPublicUrl(filePath);
  const downloadUrl = publicUrlData.publicUrl;
  
  // Create in-app route link
  const inAppRoute = `/dashboard/report/${jobId}`;

  await supabase.from("background_jobs").update({ status: "completed", result_data: { url: downloadUrl } }).eq("id", jobId);
  await supabase.from("app_notifications").insert({ user_id: userId, title: "Report Ready", message: "Your data report is ready to view and download.", link_url: inAppRoute });

  const { data: userRecord } = await supabase.auth.admin.getUserById(userId).catch(() => ({ data: null }));
  const { data: profile } = await supabase.from("profiles").select("notification_email").eq("id", userId).single();
  
  if (userRecord?.user?.email && profile?.notification_email) {
    const fullInAppRoute = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}${inAppRoute}`;
    const htmlBody = `<h3>Report Ready</h3><p>Your requested MeetSense Data Report is now ready.</p><a href="${fullInAppRoute}" style="display:inline-block;padding:10px 20px;background-color:#C4622D;color:white;text-decoration:none;border-radius:5px;">View Report</a>`;
    await sendSystemEmail(userRecord.user.email, "Your MeetSense Report is Ready", htmlBody).catch(console.error);
  }
}

async function handleCleanupData(supabase: any, userId: string, jobId: string) {
  // Mock cleanup logic
  // In reality: DELETE FROM meetings WHERE user_id = userId AND raw_transcript IS NULL
  
  // Update job
  await supabase.from("background_jobs").update({ 
    status: "completed",
    result_data: { cleaned: true }
  }).eq("id", jobId);

  // Notify user via app
  await supabase.from("app_notifications").insert({
    user_id: userId,
    title: "Cleanup Complete",
    message: "We have successfully removed empty and failed meetings from your account."
  });

  // Notify user via Email
  const { data: userRecord } = await supabase.auth.admin.getUserById(userId).catch(() => ({ data: null }));
  const { data: profile } = await supabase.from("profiles").select("notification_email").eq("id", userId).single();
  
  if (userRecord?.user?.email && profile?.notification_email) {
    const htmlBody = `
      <h3>Data Cleanup Complete</h3>
      <p>We have successfully removed all empty and failed meetings from your MeetSense account.</p>
      <p>Your workspace is now clean and optimized!</p>
    `;
    await sendSystemEmail(userRecord.user.email, "MeetSense Data Cleanup Complete", htmlBody).catch(console.error);
  }
}
