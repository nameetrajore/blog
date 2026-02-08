"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import matter from "gray-matter";
import { MarkdownPreview } from "./markdown-preview";

interface EditorLayoutProps {
  initialContent: string;
  onSave: (content: string) => Promise<void>;
  saveLabel?: string;
  showFrontmatterForm?: boolean;
}

function parseFrontmatter(content: string) {
  try {
    const { data, content: body } = matter(content);
    return {
      title: (data.title as string) || "",
      description: (data.description as string) || "",
      date: (data.date as string) || "",
      body,
    };
  } catch {
    return { title: "", description: "", date: "", body: content };
  }
}

function buildContent(
  title: string,
  description: string,
  date: string,
  body: string,
) {
  return `---\ntitle: "${title}"\ndescription: "${description}"\ndate: "${date}"\n---\n${body}`;
}

export function EditorLayout({
  initialContent,
  onSave,
  saveLabel = "Save",
  showFrontmatterForm = false,
}: EditorLayoutProps) {
  const [content, setContent] = useState(initialContent);
  const [lastSavedContent, setLastSavedContent] = useState(initialContent);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [splitPercent, setSplitPercent] = useState(50);
  const dragging = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Frontmatter state
  const [fmTitle, setFmTitle] = useState("");
  const [fmDescription, setFmDescription] = useState("");
  const [fmDate, setFmDate] = useState("");

  // Initialize frontmatter fields from content
  useEffect(() => {
    if (showFrontmatterForm) {
      const fm = parseFrontmatter(initialContent);
      setFmTitle(fm.title);
      setFmDescription(fm.description);
      setFmDate(fm.date);
    }
  }, [initialContent, showFrontmatterForm]);

  const hasUnsavedChanges = content !== lastSavedContent;

  const handleSave = useCallback(async () => {
    setSaving(true);
    setSaved(false);
    try {
      await onSave(content);
      setLastSavedContent(content);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }, [content, onSave]);

  // Cmd+S / Ctrl+S
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleSave]);

  // beforeunload warning
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [hasUnsavedChanges]);

  // Resizable split pane
  const handleMouseDown = useCallback(() => {
    dragging.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const percent = ((e.clientX - rect.left) / rect.width) * 100;
      setSplitPercent(Math.min(80, Math.max(20, percent)));
    };
    const handleMouseUp = () => {
      if (dragging.current) {
        dragging.current = false;
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  // Keyboard shortcuts in textarea
  const handleTextareaKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    // Tab inserts 2 spaces
    if (e.key === "Tab") {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent =
        content.substring(0, start) + "  " + content.substring(end);
      setContent(newContent);
      requestAnimationFrame(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      });
    }

    // Cmd+/ or Ctrl+/ toggles HTML comment
    if (e.key === "/" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      // Expand selection to full lines
      const lineStart = content.lastIndexOf("\n", start - 1) + 1;
      const lineEnd =
        content.indexOf("\n", end) === -1
          ? content.length
          : content.indexOf("\n", end);
      const selected = content.substring(lineStart, lineEnd);

      // Toggle: unwrap if already commented, wrap if not
      const trimmed = selected.trim();
      const isCommented =
        trimmed.startsWith("<!-- ") && trimmed.endsWith(" -->");

      let replacement: string;
      let cursorStart: number;
      let cursorEnd: number;

      if (isCommented) {
        // Remove comment wrapping
        replacement = selected
          .replace(/<!-- /, "")
          .replace(/ -->$/, "")
          .replace(/ -->(\r?)$/, "$1");
        cursorStart = lineStart;
        cursorEnd = lineStart + replacement.length;
      } else {
        replacement = `<!-- ${selected} -->`;
        cursorStart = lineStart;
        cursorEnd = lineStart + replacement.length;
      }

      const newContent =
        content.substring(0, lineStart) +
        replacement +
        content.substring(lineEnd);
      setContent(newContent);
      requestAnimationFrame(() => {
        textarea.selectionStart = cursorStart;
        textarea.selectionEnd = cursorEnd;
      });
    }
  };

  // Frontmatter form change -> rebuild raw content
  const handleFmChange = (
    field: "title" | "description" | "date",
    value: string,
  ) => {
    const newTitle = field === "title" ? value : fmTitle;
    const newDesc = field === "description" ? value : fmDescription;
    const newDate = field === "date" ? value : fmDate;

    if (field === "title") setFmTitle(value);
    if (field === "description") setFmDescription(value);
    if (field === "date") setFmDate(value);

    const { body } = parseFrontmatter(content);
    setContent(buildContent(newTitle, newDesc, newDate, body));
  };

  // Raw content change -> sync frontmatter fields
  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    if (showFrontmatterForm) {
      const fm = parseFrontmatter(newContent);
      setFmTitle(fm.title);
      setFmDescription(fm.description);
      setFmDate(fm.date);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-57px)]">
      <div className="flex items-center justify-between px-6 py-3 border-b border-border">
        <div className="text-sm text-muted-foreground">
          {saving ? "Saving..." : saved ? "Saved" : ""}
        </div>
        <div className="flex items-center gap-2">
          {hasUnsavedChanges && (
            <span className="w-2 h-2 bg-yellow-400 rounded-full" />
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer"
          >
            {saveLabel}
          </button>
        </div>
      </div>
      <div className="flex flex-1 min-h-0" ref={containerRef}>
        <div
          className="flex flex-col min-h-0"
          style={{ width: `${splitPercent}%` }}
        >
          {showFrontmatterForm && (
            <div className="px-4 py-3 border-b border-border space-y-2">
              <div className="flex items-center gap-2">
                <label className="text-xs text-muted-foreground w-20">
                  Title
                </label>
                <input
                  type="text"
                  value={fmTitle}
                  onChange={(e) => handleFmChange("title", e.target.value)}
                  className="flex-1 px-2 py-1 border border-input rounded text-sm bg-background text-foreground outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-muted-foreground w-20">
                  Description
                </label>
                <input
                  type="text"
                  value={fmDescription}
                  onChange={(e) =>
                    handleFmChange("description", e.target.value)
                  }
                  className="flex-1 px-2 py-1 border border-input rounded text-sm bg-background text-foreground outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-muted-foreground w-20">
                  Date
                </label>
                <input
                  type="date"
                  value={fmDate}
                  onChange={(e) => handleFmChange("date", e.target.value)}
                  className="px-2 py-1 border border-input rounded text-sm bg-background text-foreground outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
          )}
          <textarea
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            onKeyDown={handleTextareaKeyDown}
            className="w-full flex-1 p-4 bg-background text-foreground font-mono text-sm resize-none outline-none"
            spellCheck={false}
          />
        </div>
        <div
          className="w-1 bg-border hover:bg-primary/30 cursor-col-resize transition-colors shrink-0"
          onMouseDown={handleMouseDown}
        />
        <div className="flex-1 overflow-auto p-6 min-w-0">
          <MarkdownPreview content={content} />
        </div>
      </div>
    </div>
  );
}
