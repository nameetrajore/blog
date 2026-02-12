import { sendMagicLink } from "@/lib/auth/email";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const email = process.env.ADMIN_EMAIL;
  if (!email) {
    return NextResponse.json({ error: "Admin email not configured" }, { status: 500 });
  }

  const proto = request.headers.get("x-forwarded-proto") || "https";
  const host = request.headers.get("host") || request.nextUrl.host;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${proto}://${host}`;

  try {
    await sendMagicLink(email, baseUrl);
  } catch (e) {
    console.error("Failed to send magic link:", e);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
