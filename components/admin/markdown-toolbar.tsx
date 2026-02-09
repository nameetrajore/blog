"use client";

import type { CodeMirrorHandle } from "./codemirror-editor";

interface MarkdownToolbarProps {
  editorRef: React.RefObject<CodeMirrorHandle | null>;
}

type ToolbarAction = {
  label: string;
  icon: string;
  action: "wrap" | "prefix" | "insert";
  before?: string;
  after?: string;
  prefix?: string;
  insert?: string;
};

const actions: ToolbarAction[] = [
  { label: "Bold", icon: "B", action: "wrap", before: "**", after: "**" },
  { label: "Italic", icon: "I", action: "wrap", before: "_", after: "_" },
  { label: "Code", icon: "<>", action: "wrap", before: "`", after: "`" },
  { label: "H2", icon: "H2", action: "prefix", prefix: "## " },
  { label: "H3", icon: "H3", action: "prefix", prefix: "### " },
  { label: "Link", icon: "🔗", action: "insert", insert: "[text](url)" },
  { label: "Image", icon: "🖼", action: "insert", insert: "![alt](url)" },
  { label: "List", icon: "—", action: "prefix", prefix: "- " },
  { label: "Ordered", icon: "1.", action: "prefix", prefix: "1. " },
  { label: "Quote", icon: ">", action: "prefix", prefix: "> " },
  { label: "Code block", icon: "```", action: "insert", insert: "```\n\n```" },
];

export function MarkdownToolbar({ editorRef }: MarkdownToolbarProps) {
  const executeAction = (action: ToolbarAction) => {
    const view = editorRef.current?.getView();
    if (!view) return;

    view.focus();
    const { state } = view;
    const range = state.selection.main;
    const from = Math.min(range.from, range.to);
    const to = Math.max(range.from, range.to);

    if (action.action === "wrap") {
      const selected = state.sliceDoc(from, to);
      const wrapped = `${action.before}${selected || action.label.toLowerCase()}${action.after}`;
      view.dispatch({
        changes: { from, to, insert: wrapped },
        selection: selected
          ? { anchor: from, head: from + wrapped.length }
          : { anchor: from + action.before!.length, head: from + wrapped.length - action.after!.length },
      });
    } else if (action.action === "prefix") {
      const line = state.doc.lineAt(from);
      view.dispatch({
        changes: { from: line.from, insert: action.prefix! },
      });
    } else if (action.action === "insert") {
      view.dispatch({
        changes: { from, to, insert: action.insert! },
        selection: { anchor: from + action.insert!.length },
      });
    }
  };

  return (
    <div className="flex items-center gap-0.5 px-4 py-1.5 border-b border-border overflow-x-auto">
      {actions.map((action) => (
        <button
          key={action.label}
          onMouseDown={(e) => {
            e.preventDefault();
            executeAction(action);
          }}
          title={action.label}
          className="px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors cursor-pointer shrink-0 font-mono"
        >
          {action.icon}
        </button>
      ))}
    </div>
  );
}
