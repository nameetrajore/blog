import Link from "next/link";
import { listBlogPosts } from "@/lib/s3/content";
import { BlogList } from "./blog-list";

export async function BlogSection({ heading }: { heading: string }) {
  const posts = await listBlogPosts();
  const recent = posts.slice(0, 5);

  return (
    <section className="py-8">
      <h2 className="text-lg font-semibold tracking-tight mb-6">{heading}</h2>
      {recent.length === 0 ? (
        <p className="text-sm text-muted-foreground">No posts yet.</p>
      ) : (
        <>
          <BlogList posts={recent} />
          {posts.length > 5 && (
            <Link
              href="/blog"
              className="inline-block text-sm text-muted-foreground hover:text-foreground transition-colors mt-2"
            >
              View all posts →
            </Link>
          )}
        </>
      )}
    </section>
  );
}
