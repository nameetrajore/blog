"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EditorLayout } from "@/components/admin/editor-layout";

const DEFAULT_CONTENT = `---
title: ""
description: ""
date: "${new Date().toISOString().split("T")[0]}"
---

`;

export default function NewPostPage() {
  const [slug, setSlug] = useState("");
  const [created, setCreated] = useState(false);
  const router = useRouter();

  // After creation, redirect to the edit page for the new post
  if (created && slug) {
    router.replace(`/admin/blog/${slug}`);
  }

  return (
    <div>
      <div className="px-6 py-3 border-b border-border flex items-center gap-4">
        <label className="text-sm text-muted-foreground">Slug:</label>
        <input
          type="text"
          value={slug}
          onChange={(e) => setSlug(e.target.value.replace(/[^a-z0-9-]/g, ""))}
          placeholder="my-post-slug"
          disabled={created}
          className="px-2 py-1 border border-input rounded text-sm bg-background text-foreground outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
        />
      </div>
      <EditorLayout
        initialContent={DEFAULT_CONTENT}
        saveLabel="Create Post"
        showFrontmatterForm
        onSave={async (content) => {
          if (!slug) throw new Error("Slug is required");

          const res = await fetch("/api/admin/blog", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ slug, content }),
          });

          if (!res.ok) throw new Error("Failed to create post");
          setCreated(true);
        }}
      />
    </div>
  );
}
