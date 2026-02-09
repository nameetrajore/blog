import { getObject, putObject, deleteObject } from "@/lib/s3/client";
import { revalidateBlog } from "@/lib/s3/content";

export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";

// Publish: copy draft to published key, delete draft
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const draftKey = `blog/${slug}.draft.mdx`;
    const publishedKey = `blog/${slug}.mdx`;

    const content = await getObject(draftKey);
    await putObject(publishedKey, content);
    await deleteObject(draftKey);
    revalidateBlog();
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Failed to publish post:", e);
    return NextResponse.json({ error: "Failed to publish post" }, { status: 500 });
  }
}

// Unpublish: copy published to draft, then delete published key
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const publishedKey = `blog/${slug}.mdx`;
    const draftKey = `blog/${slug}.draft.mdx`;

    // Preserve content as draft before removing published version
    const content = await getObject(publishedKey);
    await putObject(draftKey, content);
    await deleteObject(publishedKey);
    revalidateBlog();
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Failed to unpublish post:", e);
    return NextResponse.json({ error: "Failed to unpublish post" }, { status: 500 });
  }
}
