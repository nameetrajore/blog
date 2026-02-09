import { getObject, putObject, deleteObject } from "@/lib/s3/client";
import { revalidateBlog } from "@/lib/s3/content";

export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";

async function objectExists(key: string): Promise<boolean> {
  try {
    await getObject(key);
    return true;
  } catch {
    return false;
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const draftKey = `blog/${slug}.draft.mdx`;
    const publishedKey = `blog/${slug}.mdx`;

    let content: string;
    let hasDraft = false;
    try {
      content = await getObject(draftKey);
      hasDraft = true;
    } catch {
      content = await getObject(publishedKey);
    }

    const hasPublished = await objectExists(publishedKey);
    return NextResponse.json({ content, hasPublished, hasDraft });
  } catch (e) {
    console.error("Failed to get post:", e);
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { content } = await request.json();
    await putObject(`blog/${slug}.draft.mdx`, content);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Failed to update post:", e);
    return NextResponse.json({ error: "Failed to update post" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    // Delete both draft and published keys (ignore errors if one doesn't exist)
    await Promise.allSettled([
      deleteObject(`blog/${slug}.draft.mdx`),
      deleteObject(`blog/${slug}.mdx`),
    ]);
    revalidateBlog();
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Failed to delete post:", e);
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
  }
}
