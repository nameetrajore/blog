"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Post {
  slug: string;
  title: string;
  date: string;
  published: boolean;
  hasDraft: boolean;
}

function StatusBadge({ post }: { post: Post }) {
  if (post.published && post.hasDraft) {
    return (
      <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
        Edited
      </span>
    );
  }
  if (post.published) {
    return (
      <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
        Published
      </span>
    );
  }
  return (
    <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
      Draft
    </span>
  );
}

export default function BlogListPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/admin/blog")
      .then((res) => res.json())
      .then((data) => setPosts(data.posts ?? []))
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(slug: string) {
    if (!confirm(`Delete "${slug}"?`)) return;

    const res = await fetch(`/api/admin/blog/${slug}`, { method: "DELETE" });
    if (res.ok) {
      setPosts((prev) => prev.filter((p) => p.slug !== slug));
    }
  }

  if (loading) {
    return <div className="p-6 text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Blog Posts</h1>
        <button
          onClick={() => router.push("/admin/blog/new")}
          className="px-4 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity cursor-pointer"
        >
          New Post
        </button>
      </div>

      {posts.length === 0 ? (
        <p className="text-sm text-muted-foreground">No posts yet.</p>
      ) : (
        <div className="space-y-2">
          {posts.map((post) => (
            <div
              key={post.slug}
              className="flex items-center justify-between p-3 border border-border rounded-md"
            >
              <div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/blog/${post.slug}`}
                    className="text-sm font-medium hover:underline"
                  >
                    {post.title}
                  </Link>
                  <StatusBadge post={post} />
                </div>
                <p className="text-xs text-muted-foreground">{post.date}</p>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/admin/blog/${post.slug}`}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(post.slug)}
                  className="text-xs text-destructive hover:text-destructive/80 transition-colors cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
