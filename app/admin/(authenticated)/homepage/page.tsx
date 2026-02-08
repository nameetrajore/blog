"use client";

import { useEffect, useState } from "react";
import { EditorLayout } from "@/components/admin/editor-layout";

export default function HomepageEditorPage() {
  const [content, setContent] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/homepage")
      .then((res) => res.json())
      .then((data) => setContent(data.content))
      .catch(() => setError("Failed to load homepage content"));
  }, []);

  if (error) {
    return <div className="p-6 text-destructive">{error}</div>;
  }

  if (content === null) {
    return <div className="p-6 text-muted-foreground">Loading...</div>;
  }

  return (
    <EditorLayout
      initialContent={content}
      onSave={async (newContent) => {
        const res = await fetch("/api/admin/homepage", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: newContent }),
        });
        if (!res.ok) throw new Error("Save failed");
      }}
    />
  );
}
