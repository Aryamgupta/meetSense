import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendSystemEmail } from "@/utils/mailer";

// Next.js Cron configuration
export const maxDuration = 60; // 1 minute max
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  // Simple auth check (in production, Vercel cron uses a header secret)
  const authHeader = req.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  try {
    // 1. Find all users who opted into emails
    const { data: profiles, error: profileErr } = await supabase
      .from("profiles")
      .select("id, full_name, notification_email")
      .eq("notification_email", true);
      
    if (profileErr || !profiles) {
      throw new Error("Failed to fetch profiles");
    }

    const today = new Date().toISOString();
    let emailsSent = 0;

    // 2. Process each opted-in user
    for (const profile of profiles) {
      // Find overdue action items for this user
      // Note: we need to join with meetings to get the meeting title if possible,
      // but assuming action_items has meeting_id. We'll do a simple query.
      const { data: overdueItems } = await supabase
        .from("action_items")
        .select(`
          id,
          task_description,
          due_date,
          status,
          meetings ( title )
        `)
        .eq("user_id", profile.id)
        .neq("status", "completed")
        .lt("due_date", today);

      if (overdueItems && overdueItems.length > 0) {
        // Fetch their email address
        const { data: userRecord } = await supabase.auth.admin.getUserById(profile.id);
        const email = userRecord?.user?.email;

        if (email) {
          // Generate the HTML from the template
          const listHtml = overdueItems.map((task: any) => `
            <li style="padding: 16px; border: 1px solid #E5E2D9; border-radius: 8px; margin-bottom: 12px; background-color: #FAFAFA;">
              <div style="font-weight: 600; color: #1C2333; margin-bottom: 4px;">${task.task_description}</div>
              <div style="font-size: 13px; color: #8C92A1;">
                From: <strong>${task.meetings?.title || 'Unknown Meeting'}</strong> • Due: <span style="color: #DC2626; font-weight: 600;">${new Date(task.due_date).toLocaleDateString()}</span>
              </div>
            </li>
          `).join('');

          const htmlBody = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <title>MeetSense: Overdue Tasks Summary</title>
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; background-color: #F7F4EC; margin: 0; padding: 40px 20px; color: #1C2333;">
              <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; padding: 40px; border: 1px solid #D1CDBC;">
                <div style="border-bottom: 1px solid #E5E2D9; padding-bottom: 20px; margin-bottom: 24px;">
                  <h1 style="font-size: 22px; margin-bottom: 8px; color: #1C2333;">Your Overdue Tasks</h1>
                  <p style="font-size: 15px; line-height: 1.6; color: #4A5060; margin-bottom: 24px;">Hello ${profile.full_name || 'there'}, you have some action items from your recent meetings that require your attention.</p>
                </div>
                
                <ul style="list-style: none; padding: 0; margin: 0 0 32px 0;">
                  ${listHtml}
                </ul>

                <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://meetsense.app'}/dashboard" style="display: inline-block; background-color: #C4622D; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 15px; text-align: center; width: calc(100% - 48px);">View Dashboard</a>
                
                <div style="margin-top: 32px; font-size: 12px; color: #8C92A1; text-align: center; border-top: 1px solid #E5E2D9; padding-top: 24px;">
                  You are receiving this email because you have Email Notifications enabled in your Settings.
                </div>
              </div>
            </body>
            </html>
          `;

          await sendSystemEmail(email, `You have ${overdueItems.length} overdue tasks on MeetSense`, htmlBody);
          emailsSent++;
        }
      }
    }

    return NextResponse.json({ success: true, emailsSent });
  } catch (error: any) {
    console.error("Cron Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
