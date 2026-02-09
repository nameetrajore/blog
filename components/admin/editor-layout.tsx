"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import matter from "gray-matter";
import { MarkdownPreview } from "./markdown-preview";

interface EditorLayoutProps {
  initialContent: string;
  onSave: (content: string) => Promise<void>;
  saveLabel?: string;
  showFrontmatterForm?: boolean;
  isPublished?: boolean;
  hasDraft?: boolean;
  onPublish?: () => Promise<void>;
  onUnpublish?: () => Promise<void>;
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
  isPublished,
  hasDraft: initialHasDraft,
  onPublish,
  onUnpublish,
}: EditorLayoutProps) {
  const [content, setContent] = useState(initialContent);
  const [lastSavedContent, setLastSavedContent] = useState(initialContent);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [splitPercent, setSplitPercent] = useState(50);
  const [mobileTab, setMobileTab] = useState<"editor" | "preview">("editor");
  const dragging = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [publishing, setPublishing] = useState(false);
  const [hasDraft, setHasDraft] = useState(initialHasDraft ?? false);

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
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [autoSaveStatus, setAutoSaveStatus] = useState<"" | "saving" | "saved">("");

  const handleSave = useCallback(async () => {
    // Clear any pending auto-save
    if (autoSaveTimer.current) {
      clearTimeout(autoSaveTimer.current);
      autoSaveTimer.current = null;
    }
    setSaving(true);
    setSaved(false);
    setAutoSaveStatus("");
    try {
      await onSave(content);
      setLastSavedContent(content);
      setHasDraft(true);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }, [content, onSave]);

  // Auto-save: 3-second debounce after content changes
  useEffect(() => {
    if (content === lastSavedContent) return;
    autoSaveTimer.current = setTimeout(async () => {
      setAutoSaveStatus("saving");
      try {
        await onSave(content);
        setLastSavedContent(content);
        setHasDraft(true);
        setAutoSaveStatus("saved");
        setTimeout(() => setAutoSaveStatus(""), 2000);
      } catch {
        setAutoSaveStatus("");
      }
    }, 3000);
    return () => {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }
    };
  }, [content, lastSavedContent, onSave]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }
    };
  }, []);

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

  // Resizable split pane (mouse + touch)
  const handleDragStart = useCallback(() => {
    dragging.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }, []);

  useEffect(() => {
    const handleMove = (clientX: number) => {
      if (!dragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const percent = ((clientX - rect.left) / rect.width) * 100;
      setSplitPercent(Math.min(80, Math.max(20, percent)));
    };
    const handleEnd = () => {
      if (dragging.current) {
        dragging.current = false;
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      }
    };
    const onMouseMove = (e: MouseEvent) => handleMove(e.clientX);
    const onTouchMove = (e: TouchEvent) => handleMove(e.touches[0].clientX);

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", handleEnd);
    window.addEventListener("touchmove", onTouchMove);
    window.addEventListener("touchend", handleEnd);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", handleEnd);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", handleEnd);
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

  const handlePublish = async () => {
    if (!onPublish) return;
    setPublishing(true);
    try {
      // Save current content first, then publish
      await onSave(content);
      setLastSavedContent(content);
      await onPublish();
      setHasDraft(false);
    } finally {
      setPublishing(false);
    }
  };

  const handleUnpublish = async () => {
    if (!onUnpublish) return;
    setPublishing(true);
    try {
      await onUnpublish();
      setHasDraft(true);
    } finally {
      setPublishing(false);
    }
  };

  const frontmatterForm = showFrontmatterForm && (
    <div className="px-4 py-3 border-b border-border space-y-2">
      <div className="flex items-center gap-2">
        <label className="text-xs text-muted-foreground w-20 shrink-0">
          Title
        </label>
        <input
          type="text"
          value={fmTitle}
          onChange={(e) => handleFmChange("title", e.target.value)}
          className="flex-1 min-w-0 px-2 py-1 border border-input rounded text-sm bg-background text-foreground outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
      <div className="flex items-center gap-2">
        <label className="text-xs text-muted-foreground w-20 shrink-0">
          Description
        </label>
        <input
          type="text"
          value={fmDescription}
          onChange={(e) =>
            handleFmChange("description", e.target.value)
          }
          className="flex-1 min-w-0 px-2 py-1 border border-input rounded text-sm bg-background text-foreground outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
      <div className="flex items-center gap-2">
        <label className="text-xs text-muted-foreground w-20 shrink-0">
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
  );

  return (
    <div className="flex flex-col h-[calc(100dvh-57px)]">
      <div className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-border">
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={() => setMobileTab("editor")}
            className={`px-3 py-1 text-sm rounded-md transition-colors cursor-pointer ${
              mobileTab === "editor"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Editor
          </button>
          <button
            onClick={() => setMobileTab("preview")}
            className={`px-3 py-1 text-sm rounded-md transition-colors cursor-pointer ${
              mobileTab === "preview"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Preview
          </button>
        </div>
        <div className="hidden md:flex items-center gap-3">
          {onPublish && (
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                isPublished && hasDraft
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                  : isPublished
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
              }`}
            >
              {isPublished && hasDraft ? "Edited" : isPublished ? "Published" : "Draft"}
            </span>
          )}
          <span className="text-sm text-muted-foreground">
            {saving ? "Saving..." : saved ? "Saved" : autoSaveStatus === "saving" ? "Auto-saving..." : autoSaveStatus === "saved" ? "Auto-saved" : ""}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground md:hidden">
            {saving ? "Saving..." : saved ? "Saved" : autoSaveStatus === "saving" ? "Auto-saving..." : autoSaveStatus === "saved" ? "Auto-saved" : ""}
          </span>
          {/* Mobile-only status badge */}
          {onPublish && (
            <span
              className={`md:hidden text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                isPublished && hasDraft
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                  : isPublished
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
              }`}
            >
              {isPublished && hasDraft ? "Edited" : isPublished ? "Published" : "Draft"}
            </span>
          )}
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
          {onPublish && hasDraft && (
            <button
              onClick={handlePublish}
              disabled={publishing}
              className="px-4 py-1.5 text-sm bg-green-600 text-white rounded-md hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer"
            >
              {publishing ? "Publishing..." : "Publish"}
            </button>
          )}
          {onUnpublish && isPublished && (
            <button
              onClick={handleUnpublish}
              disabled={publishing}
              className="text-xs text-muted-foreground hover:text-destructive transition-colors cursor-pointer disabled:opacity-50"
            >
              {publishing ? "Unpublishing..." : "Unpublish"}
            </button>
          )}
        </div>
      </div>

      {/* Desktop: side-by-side split pane */}
      <div className="hidden md:flex flex-1 min-h-0" ref={containerRef}>
        <div
          className="flex flex-col min-h-0"
          style={{ width: `${splitPercent}%` }}
        >
          {frontmatterForm}
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
          onMouseDown={handleDragStart}
          onTouchStart={handleDragStart}
        />
        <div className="flex-1 overflow-auto p-6 min-w-0">
          <MarkdownPreview content={content} />
        </div>
      </div>

      {/* Mobile: tabbed editor/preview */}
      <div className="flex flex-col flex-1 min-h-0 md:hidden">
        {mobileTab === "editor" ? (
          <>
            {frontmatterForm}
            <textarea
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              onKeyDown={handleTextareaKeyDown}
              className="w-full flex-1 p-4 bg-background text-foreground font-mono text-sm resize-none outline-none"
              spellCheck={false}
            />
          </>
        ) : (
          <div className="flex-1 overflow-auto p-4">
            <MarkdownPreview content={content} />
          </div>
        )}
      </div>
    </div>
  );
}
