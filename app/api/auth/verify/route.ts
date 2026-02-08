import { verifyToken } from "@/lib/auth/jwt";
import { setSession } from "@/lib/auth/session";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/admin/login?error=missing_token", request.url));
  }

  try {
    const { email } = verifyToken(token);

    if (email !== process.env.ADMIN_EMAIL) {
      return NextResponse.redirect(new URL("/admin/login?error=unauthorized", request.url));
    }

    await setSession(email);
    return NextResponse.redirect(new URL("/admin", request.url));
  } catch {
    return NextResponse.redirect(new URL("/admin/login?error=invalid_token", request.url));
  }
}
