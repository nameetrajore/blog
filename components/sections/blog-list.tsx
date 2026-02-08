"use client";

import Link from "next/link";
import { useRef, useState } from "react";

type Post = {
  slug: string;
  title: string;
  description: string;
};

export function BlogList({ posts }: { posts: Post[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [highlight, setHighlight] = useState<{
    top: number;
    height: number;
    opacity: number;
  }>({ top: 0, height: 0, opacity: 0 });

  function handleMouseEnter(e: React.MouseEvent<HTMLAnchorElement>) {
    const container = containerRef.current;
    if (!container) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    setHighlight({
      top: rect.top - containerRect.top,
      height: rect.height,
      opacity: 1,
    });
  }

  function handleMouseLeave() {
    setHighlight((prev) => ({ ...prev, opacity: 0 }));
  }

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseLeave={handleMouseLeave}
    >
      <div
        className="absolute -left-4 -right-4 rounded-lg bg-muted/50 pointer-events-none transition-all duration-150 ease-out"
        style={{
          top: highlight.top,
          height: highlight.height,
          opacity: highlight.opacity,
        }}
      />
      <div className="relative space-y-1">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="block rounded-lg px-4 py-3 -mx-4"
            onMouseEnter={handleMouseEnter}
          >
            <h3 className="font-medium">{post.title}</h3>
            {post.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {post.description}
              </p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
