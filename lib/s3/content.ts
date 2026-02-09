import { revalidatePath } from "next/cache";
import { getObject, s3 } from "./client";
import { ListObjectsV2Command } from "@aws-sdk/client-s3";
import matter from "gray-matter";
import readingTime from "reading-time";

export async function getHomepage() {
  return await getObject("homepage.mdx");
}

export async function getBlogPost(slug: string) {
  if (slug.endsWith(".draft")) {
    throw new Error("Not found");
  }
  const raw = await getObject(`blog/${slug}.mdx`);
  const { data: frontmatter, content } = matter(raw);
  const stats = readingTime(content);
  return {
    frontmatter,
    content,
    readingTime: stats.text,
  };
}

export async function listBlogPosts() {
  const command = new ListObjectsV2Command({
    Bucket: process.env.S3_BUCKET_NAME,
    Prefix: "blog/",
  });

  const response = await s3.send(command);
  const keys = (response.Contents ?? [])
    .map((obj) => obj.Key!)
    .filter((key) => key.endsWith(".mdx") && !key.endsWith(".draft.mdx"));

  const posts = await Promise.all(
    keys.map(async (key) => {
      const raw = await getObject(key);
      const { data: frontmatter } = matter(raw);
      const slug = key.replace("blog/", "").replace(".mdx", "");
      const stats = readingTime(raw);
      return {
        slug,
        title: (frontmatter.title as string) ?? slug,
        description: (frontmatter.description as string) ?? "",
        date: (frontmatter.date as string) ?? "",
        readingTime: stats.text,
      };
    })
  );

  return posts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function revalidateHomepage() {
  revalidatePath("/", "layout");
}

export function revalidateBlog() {
  revalidatePath("/blog", "layout");
}
