"use client";

import { useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import { EditorView, keymap, placeholder as placeholderExt } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";
import {
  defaultKeymap,
  indentWithTab,
  history,
  historyKeymap,
} from "@codemirror/commands";
import {
  syntaxHighlighting,
  HighlightStyle,
  indentOnInput,
  bracketMatching,
} from "@codemirror/language";
import { tags } from "@lezer/highlight";
import { search, searchKeymap } from "@codemirror/search";

export interface CodeMirrorHandle {
  getView: () => EditorView | null;
}

interface CodeMirrorEditorProps {
  value: string;
  onChange: (value: string) => void;
  onSave?: () => void;
  darkMode?: boolean;
  placeholder?: string;
}

// VS Code Light+ inspired syntax highlighting
const vscodeLightHighlight = HighlightStyle.define([
  { tag: tags.keyword, color: "#AF00DB" },
  { tag: tags.operator, color: "#000000" },
  { tag: tags.typeName, color: "#267F99" },
  { tag: tags.propertyName, color: "#001080" },
  { tag: tags.variableName, color: "#001080" },
  { tag: [tags.string, tags.special(tags.brace)], color: "#A31515" },
  { tag: tags.number, color: "#098658" },
  { tag: tags.bool, color: "#0000FF" },
  { tag: tags.comment, color: "#008000", fontStyle: "italic" },
  { tag: tags.definition(tags.variableName), color: "#0070C1" },
  { tag: tags.function(tags.variableName), color: "#795E26" },
  { tag: tags.heading, color: "#0000FF", fontWeight: "bold" },
  { tag: tags.heading1, color: "#0000FF", fontWeight: "bold", fontSize: "1.2em" },
  { tag: tags.heading2, color: "#0000FF", fontWeight: "bold", fontSize: "1.1em" },
  { tag: tags.heading3, color: "#0000FF", fontWeight: "bold" },
  { tag: tags.emphasis, fontStyle: "italic", color: "#000000" },
  { tag: tags.strong, fontWeight: "bold", color: "#000000" },
  { tag: tags.link, color: "#4078F2", textDecoration: "underline" },
  { tag: tags.url, color: "#4078F2" },
  { tag: tags.monospace, color: "#E45649", backgroundColor: "rgba(0,0,0,0.04)", borderRadius: "3px" },
  { tag: tags.strikethrough, textDecoration: "line-through" },
  { tag: tags.meta, color: "#808080" },
  { tag: tags.processingInstruction, color: "#808080" },
  { tag: tags.quote, color: "#22863A", fontStyle: "italic" },
]);

const lightTheme = EditorView.theme({
  "&": {
    height: "100%",
    fontSize: "13px",
  },
  ".cm-scroller": {
    fontFamily: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace",
    padding: "16px",
    overflow: "auto",
  },
  ".cm-content": {
    caretColor: "var(--foreground)",
  },
  ".cm-gutters": {
    display: "none",
  },
  "&.cm-focused .cm-cursor": {
    borderLeftColor: "var(--foreground)",
  },
  "&.cm-focused": {
    outline: "none",
  },
  ".cm-selectionBackground": {
    backgroundColor: "rgba(0, 0, 0, 0.1) !important",
  },
  "&.cm-focused .cm-selectionBackground": {
    backgroundColor: "rgba(0, 0, 0, 0.15) !important",
  },
  ".cm-activeLine": {
    backgroundColor: "rgba(0, 0, 0, 0.04)",
  },
  ".cm-placeholder": {
    color: "var(--muted-foreground)",
  },
});

// VS Code Dark+ inspired syntax highlighting
const vscodeDarkHighlight = HighlightStyle.define([
  { tag: tags.keyword, color: "#C586C0" },
  { tag: tags.operator, color: "#D4D4D4" },
  { tag: tags.typeName, color: "#4EC9B0" },
  { tag: tags.propertyName, color: "#9CDCFE" },
  { tag: tags.variableName, color: "#9CDCFE" },
  { tag: [tags.string, tags.special(tags.brace)], color: "#CE9178" },
  { tag: tags.number, color: "#B5CEA8" },
  { tag: tags.bool, color: "#569CD6" },
  { tag: tags.comment, color: "#6A9955", fontStyle: "italic" },
  { tag: tags.definition(tags.variableName), color: "#DCDCAA" },
  { tag: tags.function(tags.variableName), color: "#DCDCAA" },
  { tag: tags.heading, color: "#569CD6", fontWeight: "bold" },
  { tag: tags.heading1, color: "#569CD6", fontWeight: "bold", fontSize: "1.2em" },
  { tag: tags.heading2, color: "#569CD6", fontWeight: "bold", fontSize: "1.1em" },
  { tag: tags.heading3, color: "#569CD6", fontWeight: "bold" },
  { tag: tags.emphasis, fontStyle: "italic", color: "#D4D4D4" },
  { tag: tags.strong, fontWeight: "bold", color: "#D4D4D4" },
  { tag: tags.link, color: "#3794FF", textDecoration: "underline" },
  { tag: tags.url, color: "#3794FF" },
  { tag: tags.monospace, color: "#CE9178", backgroundColor: "rgba(255,255,255,0.06)", borderRadius: "3px" },
  { tag: tags.strikethrough, textDecoration: "line-through" },
  { tag: tags.meta, color: "#808080" },
  { tag: tags.processingInstruction, color: "#808080" },
  { tag: tags.quote, color: "#6A9955", fontStyle: "italic" },
]);

const darkTheme = EditorView.theme({
  "&": {
    height: "100%",
    fontSize: "13px",
    backgroundColor: "#1E1E1E",
    color: "#D4D4D4",
  },
  ".cm-scroller": {
    fontFamily: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace",
    padding: "16px",
    overflow: "auto",
  },
  ".cm-content": {
    caretColor: "#AEAFAD",
  },
  ".cm-gutters": {
    display: "none",
  },
  "&.cm-focused .cm-cursor": {
    borderLeftColor: "#AEAFAD",
  },
  "&.cm-focused": {
    outline: "none",
  },
  ".cm-selectionBackground": {
    backgroundColor: "#264F78 !important",
  },
  "&.cm-focused .cm-selectionBackground": {
    backgroundColor: "#264F78 !important",
  },
  ".cm-activeLine": {
    backgroundColor: "rgba(255, 255, 255, 0.04)",
  },
  ".cm-placeholder": {
    color: "#6A6A6A",
  },
  ".cm-searchMatch": {
    backgroundColor: "#515C6A",
  },
  ".cm-searchMatch-selected": {
    backgroundColor: "#2E7D32",
  },
}, { dark: true });

async function uploadAndInsertImage(view: EditorView, file: File) {
  const pos = view.state.selection.main.head;
  const placeholder = `![Uploading ${file.name}...]()`;

  // Insert placeholder
  view.dispatch({
    changes: { from: pos, insert: placeholder },
  });

  try {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/admin/upload", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) throw new Error("Upload failed");
    const { url } = await res.json();

    // Replace placeholder with actual image markdown
    const doc = view.state.doc.toString();
    const placeholderPos = doc.indexOf(placeholder);
    if (placeholderPos !== -1) {
      const name = file.name.replace(/\.[^.]+$/, "");
      view.dispatch({
        changes: {
          from: placeholderPos,
          to: placeholderPos + placeholder.length,
          insert: `![${name}](${url})`,
        },
      });
    }
  } catch {
    // Remove placeholder on failure
    const doc = view.state.doc.toString();
    const placeholderPos = doc.indexOf(placeholder);
    if (placeholderPos !== -1) {
      view.dispatch({
        changes: {
          from: placeholderPos,
          to: placeholderPos + placeholder.length,
          insert: "",
        },
      });
    }
  }
}

export const CodeMirrorEditor = forwardRef<CodeMirrorHandle, CodeMirrorEditorProps>(
  function CodeMirrorEditor({ value, onChange, onSave, darkMode = false, placeholder = "" }, ref) {
    const containerRef = useRef<HTMLDivElement>(null);
    const viewRef = useRef<EditorView | null>(null);
    const onChangeRef = useRef(onChange);
    const onSaveRef = useRef(onSave);

    // Keep refs in sync
    onChangeRef.current = onChange;
    onSaveRef.current = onSave;

    useImperativeHandle(ref, () => ({
      getView: () => viewRef.current,
    }));

    // Create editor
    useEffect(() => {
      if (!containerRef.current) return;

      const wrapSelection = (view: EditorView, before: string, after: string, placeholder: string) => {
        const { state } = view;
        const range = state.selection.main;
        const from = Math.min(range.from, range.to);
        const to = Math.max(range.from, range.to);
        const selected = state.sliceDoc(from, to);
        const wrapped = `${before}${selected || placeholder}${after}`;
        view.dispatch({
          changes: { from, to, insert: wrapped },
          selection: selected
            ? { anchor: from, head: from + wrapped.length }
            : { anchor: from + before.length, head: from + wrapped.length - after.length },
        });
        return true;
      };

      const customKeymap = keymap.of([
        {
          key: "Mod-s",
          run: () => {
            onSaveRef.current?.();
            return true;
          },
        },
        {
          key: "Mod-b",
          run: (view) => wrapSelection(view, "**", "**", "bold"),
        },
        {
          key: "Mod-i",
          run: (view) => wrapSelection(view, "_", "_", "italic"),
        },
        {
          key: "Mod-e",
          run: (view) => wrapSelection(view, "`", "`", "code"),
        },
        {
          key: "Mod-Shift-k",
          run: (view) => wrapSelection(view, "[", "](url)", "text"),
        },
      ]);

      const updateListener = EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          onChangeRef.current(update.state.doc.toString());
        }
      });

      const themeExtensions = darkMode
        ? [darkTheme, syntaxHighlighting(vscodeDarkHighlight)]
        : [syntaxHighlighting(vscodeLightHighlight), lightTheme];

      const state = EditorState.create({
        doc: value,
        extensions: [
          customKeymap,
          keymap.of([...defaultKeymap, ...historyKeymap, ...searchKeymap, indentWithTab]),
          history(),
          search(),
          markdown({ base: markdownLanguage, codeLanguages: languages }),
          indentOnInput(),
          bracketMatching(),
          EditorView.lineWrapping,
          EditorView.contentAttributes.of({ spellcheck: "true" }),
          EditorView.domEventHandlers({
            paste: (event, view) => {
              const items = event.clipboardData?.items;
              if (!items) return false;
              for (const item of items) {
                if (item.type.startsWith("image/")) {
                  event.preventDefault();
                  const file = item.getAsFile();
                  if (file) uploadAndInsertImage(view, file);
                  return true;
                }
              }
              return false;
            },
            drop: (event, view) => {
              const files = event.dataTransfer?.files;
              if (!files) return false;
              for (const file of files) {
                if (file.type.startsWith("image/")) {
                  event.preventDefault();
                  uploadAndInsertImage(view, file);
                  return true;
                }
              }
              return false;
            },
          }),
          updateListener,
          ...themeExtensions,
          ...(placeholder ? [placeholderExt(placeholder)] : []),
        ],
      });

      const view = new EditorView({
        state,
        parent: containerRef.current,
      });

      viewRef.current = view;

      return () => {
        view.destroy();
        viewRef.current = null;
      };
      // Only recreate on darkMode change
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [darkMode]);

    // Sync external value changes (e.g. frontmatter form updates)
    useEffect(() => {
      const view = viewRef.current;
      if (!view) return;
      const currentValue = view.state.doc.toString();
      if (value !== currentValue) {
        view.dispatch({
          changes: {
            from: 0,
            to: currentValue.length,
            insert: value,
          },
        });
      }
    }, [value]);

    return (
      <div
        ref={containerRef}
        data-codemirror-editor
        className="h-full overflow-hidden bg-background text-foreground"
      />
    );
  }
);
