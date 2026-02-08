import { NextRequest, NextResponse } from "next/server";
import { marked } from "marked";

export async function POST(request: NextRequest) {
  try {
    const { content } = await request.json();
    // Strip frontmatter before rendering
    const stripped = content.replace(/^---[\s\S]*?---\n*/, "");
    const html = await marked(stripped);
    return NextResponse.json({ html });
  } catch {
    return NextResponse.json({ html: "<p>Preview unavailable</p>" });
  }
}
