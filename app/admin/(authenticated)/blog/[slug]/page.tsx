"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { EditorLayout } from "@/components/admin/editor-layout";

export default function EditPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const [content, setContent] = useState<string | null>(null);
  const [isPublished, setIsPublished] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/admin/blog/${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then((data) => {
        setContent(data.content);
        setIsPublished(data.hasPublished ?? false);
        setHasDraft(data.hasDraft ?? false);
      })
      .catch(() => setError("Failed to load post"));
  }, [slug]);

  if (error) {
    return <div className="p-6 text-destructive">{error}</div>;
  }

  if (content === null) {
    return <div className="p-6 text-muted-foreground">Loading...</div>;
  }

  return (
    <EditorLayout
      initialContent={content}
      showFrontmatterForm
      isPublished={isPublished}
      hasDraft={hasDraft}
      onSave={async (newContent) => {
        const res = await fetch(`/api/admin/blog/${slug}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: newContent }),
        });
        if (!res.ok) throw new Error("Save failed");
      }}
      onPublish={async () => {
        const res = await fetch(`/api/admin/blog/${slug}/publish`, {
          method: "POST",
        });
        if (!res.ok) throw new Error("Publish failed");
        setIsPublished(true);
      }}
      onUnpublish={async () => {
        const res = await fetch(`/api/admin/blog/${slug}/publish`, {
          method: "DELETE",
        });
        if (!res.ok) throw new Error("Unpublish failed");
        setIsPublished(false);
      }}
    />
  );
}
