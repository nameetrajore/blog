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
  defaultHighlightStyle,
  indentOnInput,
  bracketMatching,
} from "@codemirror/language";
import { oneDark } from "@codemirror/theme-one-dark";
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

const darkThemeOverride = EditorView.theme({
  "&": {
    height: "100%",
    fontSize: "13px",
  },
  ".cm-scroller": {
    fontFamily: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace",
    padding: "16px",
    overflow: "auto",
  },
  ".cm-gutters": {
    display: "none",
  },
  "&.cm-focused": {
    outline: "none",
  },
});

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
        ? [oneDark, darkThemeOverride]
        : [syntaxHighlighting(defaultHighlightStyle), lightTheme];

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
