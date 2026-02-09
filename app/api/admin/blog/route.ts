import { getObject, putObject } from "@/lib/s3/client";
import { revalidateBlog } from "@/lib/s3/content";

export const dynamic = "force-dynamic";
import { ListObjectsV2Command } from "@aws-sdk/client-s3";
import { s3 } from "@/lib/s3/client";
import matter from "gray-matter";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const command = new ListObjectsV2Command({
      Bucket: process.env.S3_BUCKET_NAME,
      Prefix: "blog/",
    });
    const response = await s3.send(command);
    const keys = (response.Contents ?? [])
      .map((obj) => obj.Key!)
      .filter((key) => key.endsWith(".mdx"));

    // Group keys by slug to determine draft/published status
    const slugMap = new Map<string, { hasDraft: boolean; hasPublished: boolean }>();
    for (const key of keys) {
      const isDraft = key.endsWith(".draft.mdx");
      const slug = key
        .replace("blog/", "")
        .replace(".draft.mdx", "")
        .replace(".mdx", "");
      if (!slugMap.has(slug)) {
        slugMap.set(slug, { hasDraft: false, hasPublished: false });
      }
      const entry = slugMap.get(slug)!;
      if (isDraft) entry.hasDraft = true;
      else entry.hasPublished = true;
    }

    const posts = await Promise.all(
      Array.from(slugMap.entries()).map(async ([slug, status]) => {
        // Prefer reading draft for admin metadata
        const key = status.hasDraft
          ? `blog/${slug}.draft.mdx`
          : `blog/${slug}.mdx`;
        const raw = await getObject(key);
        const { data: frontmatter } = matter(raw);
        return {
          slug,
          title: (frontmatter.title as string) ?? slug,
          date: (frontmatter.date as string) ?? "",
          published: status.hasPublished,
          hasDraft: status.hasDraft,
        };
      })
    );

    posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return NextResponse.json({ posts });
  } catch (e) {
    console.error("Failed to list posts:", e);
    return NextResponse.json({ error: "Failed to list posts" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { slug, content } = await request.json();

    if (!slug || !content) {
      return NextResponse.json({ error: "Slug and content are required" }, { status: 400 });
    }

    await putObject(`blog/${slug}.draft.mdx`, content);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Failed to create post:", e);
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}
