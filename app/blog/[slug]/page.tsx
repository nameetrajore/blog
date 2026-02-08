import { type Metadata } from "next";
import { notFound } from "next/navigation";
import { getBlogPost, listBlogPosts } from "@/lib/s3/content";
import { renderMDX, extractHeadings } from "@/lib/mdx/processor";
import { TableOfContents } from "@/components/table-of-contents";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const { frontmatter } = await getBlogPost(slug);
    return {
      title: (frontmatter.title as string) ?? slug,
      description: (frontmatter.description as string) ?? "",
    };
  } catch {
    return { title: "Not Found" };
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let post;
  try {
    post = await getBlogPost(slug);
  } catch {
    notFound();
  }

  // Strip leading # heading to avoid duplicate title
  const body = post.content.replace(/^\s*#\s+.+\n*/, "");
  const headings = extractHeadings(body);
  const content = await renderMDX(body);

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <article>
        <header className="mb-8">
          {post.frontmatter.title && (
            <h1 className="text-2xl font-semibold tracking-tight mb-2">
              {post.frontmatter.title as string}
            </h1>
          )}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {post.frontmatter.date && (
              <time>{post.frontmatter.date as string}</time>
            )}
            {post.frontmatter.date && post.readingTime && <span>·</span>}
            {post.readingTime && <span>{post.readingTime}</span>}
          </div>
        </header>
        <TableOfContents headings={headings} />
        <div className="prose-sm">{content}</div>
      </article>
    </main>
  );
}
