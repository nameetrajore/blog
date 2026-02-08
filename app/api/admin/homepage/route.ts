import { getObject, putObject } from "@/lib/s3/client";
import { revalidateHomepage } from "@/lib/s3/content";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const content = await getObject("homepage.mdx");
    return NextResponse.json({ content });
  } catch (e) {
    console.error("Failed to get homepage:", e);
    return NextResponse.json({ error: "Failed to fetch homepage" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { content } = await request.json();
    await putObject("homepage.mdx", content);
    revalidateHomepage();
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Failed to save homepage:", e);
    return NextResponse.json({ error: "Failed to save homepage" }, { status: 500 });
  }
}
