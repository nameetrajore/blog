import { getObject, putObject, deleteObject } from "@/lib/s3/client";
import { revalidateBlog } from "@/lib/s3/content";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const content = await getObject(`blog/${slug}.mdx`);
    return NextResponse.json({ content });
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
    await putObject(`blog/${slug}.mdx`, content);
    revalidateBlog();
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
    await deleteObject(`blog/${slug}.mdx`);
    revalidateBlog();
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Failed to delete post:", e);
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
  }
}
