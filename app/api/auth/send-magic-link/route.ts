import { sendMagicLink } from "@/lib/auth/email";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { email } = await request.json();

  if (!email || email !== process.env.ADMIN_EMAIL) {
    // Return success even for invalid emails to prevent enumeration
    return NextResponse.json({ ok: true });
  }

  try {
    await sendMagicLink(email);
  } catch (e) {
    console.error("Failed to send magic link:", e);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
