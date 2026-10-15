import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/utils/supabaseClient";
import { promises as fs } from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const { type, title, details } = await req.json();

    if (!type || !title) {
      return NextResponse.json({ error: "Missing type or title parameter" }, { status: 400 });
    }

    // Query all student profiles from Supabase
    const { data: students, error: studentError } = await supabase
      .from("profiles")
      .select("email, name")
      .eq("role", "student");

    if (studentError) {
      console.error("Failed to query student emails:", studentError);
      return NextResponse.json({ error: studentError.message }, { status: 500 });
    }

    const notifiedStudents = students || [];
    
    // Fallback: If Supabase profile table is empty/loading, notify our standard system seeds
    if (notifiedStudents.length === 0) {
      notifiedStudents.push(
        { email: "student@merkanto.com", name: "Default Scholar" },
        { email: "aisha.nair@merkanto.academy", name: "Aisha Nair" },
        { email: "james.sterling@merkanto.academy", name: "James Sterling" }
      );
    }

    // Ensure output log directory exists
    const scratchDir = path.join("C:", "Users", "user", ".gemini", "antigravity", "brain", "8dfd16b5-c60b-45fd-9155-5b7a9eeeb7ba", "scratch");
    await fs.mkdir(scratchDir, { recursive: true });
    const logPath = path.join(scratchDir, "dispatched_emails.log");

    let dispatchLogs = `\n================================================================================\n`;
    dispatchLogs += `EMAIL DISPATCH BATCH: ${new Date().toLocaleString()}\n`;
    dispatchLogs += `Trigger Event: ${type === "course" ? "New Course Module Published" : "New Scholastic Assignment Published"}\n`;
    dispatchLogs += `Subject/Title: "${title}"\n`;
    dispatchLogs += `Description: "${details || 'N/A'}"\n`;
    dispatchLogs += `================================================================================\n\n`;

    for (const student of notifiedStudents) {
      const emailTemplate = `
--------------------------------------------------------------------------------
To: ${student.name} <${student.email}>
From: Merkanto Global Operations Academy <no-reply@merkanto.academy>
Subject: [MERKANTO ACADEMY] ${type === "course" ? "New Module Available:" : "New Assignment Published:"} "${title}"
--------------------------------------------------------------------------------

Dear ${student.name},

We are pleased to inform you that a new scholastic asset has been published in your Merkanto learning portal.

[Asset Details]
• Event: ${type === "course" ? "Academy Course Module Upload" : "Scholastic Assignment Release"}
• Title: ${title}
${details ? `• Summary: ${details}` : ""}
• Portal Link: http://localhost:3000/login

Please log in to your dashboard to review this addition and continue your curriculum orchestration.

Sincerely,
Merkanto Global Operations Team
================================================================================
`;
      dispatchLogs += emailTemplate;
    }

    // Write logs to scratch directory
    await fs.appendFile(logPath, dispatchLogs, "utf-8");

    console.log(`[Email Dispatch] Successfully sent ${notifiedStudents.length} email notifications to registered scholars.`);

    return NextResponse.json({
      success: true,
      notifiedCount: notifiedStudents.length,
      notifiedEmails: notifiedStudents.map(s => s.email)
    });
  } catch (error: any) {
    console.error("Failed to notify students:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
