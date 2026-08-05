import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendSystemEmail } from "@/utils/mailer";

export async function POST(req: Request) {
  try {
    const { subject, message, userId } = await req.json();

    if (!subject || !message) {
      return NextResponse.json({ error: "Subject and message are required" }, { status: 400 });
    }

    // Optional: get user details from supabase
    let userEmail = "Unknown User";
    if (userId) {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY! || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { data: user } = await supabase.auth.admin.getUserById(userId).catch(() => ({ data: null }));
      if (user?.user) userEmail = user.user.email || "Unknown User";
    }

    const devEmail = process.env.DEVELOPER_EMAIL || "developer@example.com";
    const subjectLine = `[MeetSense Support] ${subject}`;
    const htmlBody = `
      <h3>New Support Request</h3>
      <p><strong>From:</strong> ${userEmail} (ID: ${userId || 'N/A'})</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <hr />
      <p>${message.replace(/\n/g, '<br/>')}</p>
    `;

    await sendSystemEmail(devEmail, subjectLine, htmlBody);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Support API Error:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
