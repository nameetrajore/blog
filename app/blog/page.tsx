import { listBlogPosts } from "@/lib/s3/content";
import { BlogCard } from "@/components/sections/blog-card";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Blog",
};

export default async function BlogListPage() {
  const posts = await listBlogPosts();

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Blog</h1>
      {posts.length === 0 ? (
        <p className="text-muted-foreground">No posts yet.</p>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <BlogCard key={post.slug} {...post} />
          ))}
        </div>
      )}
    </main>
  );
}
