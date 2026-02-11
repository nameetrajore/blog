"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { useTheme } from "next-themes";

function MermaidToolbar({
  title,
  fullscreen,
  onZoomIn,
  onZoomOut,
  onReset,
  onToggleFullscreen,
}: {
  title: string | null;
  fullscreen: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onToggleFullscreen: () => void;
}) {
  return (
    <div className="flex items-center justify-between px-3 py-1.5 border-b border-border/50 bg-muted/50">
      <span className="text-xs text-muted-foreground">{title ?? "mermaid"}</span>
      <div className="flex items-center gap-2">
        <button
          onClick={onZoomIn}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          +
        </button>
        <button
          onClick={onZoomOut}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          −
        </button>
        <button
          onClick={onReset}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          Reset
        </button>
        <button
          onClick={onToggleFullscreen}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          {fullscreen ? "Exit" : "Expand"}
        </button>
      </div>
    </div>
  );
}

function MermaidCanvas({
  svg,
  scale,
  translate,
  dragging,
  height,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onScaleChange,
}: {
  svg: string;
  scale: number;
  translate: { x: number; y: number };
  dragging: boolean;
  height?: string;
  onPointerDown: (e: React.PointerEvent) => void;
  onPointerMove: (e: React.PointerEvent) => void;
  onPointerUp: () => void;
  onScaleChange: (delta: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      onScaleChange(delta);
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, [onScaleChange]);

  return (
    <div
      ref={ref}
      className="relative overflow-hidden bg-muted/30"
      style={{ height: height ?? "100%", cursor: dragging ? "grabbing" : "grab" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      <div
        className="absolute inset-0 flex items-center justify-center [&_svg]:max-w-none"
        style={{
          transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
          transformOrigin: "center center",
        }}
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    </div>
  );
}

export function Mermaid({ code: rawCode }: { code: string }) {
  const titleMatch = rawCode.match(/^%%title:\s*(.+)$/m);
  const title = titleMatch ? titleMatch[1].trim() : null;
  const code = titleMatch ? rawCode.replace(titleMatch[0], "").trim() : rawCode;
  const [svg, setSvg] = useState("");
  const { resolvedTheme } = useTheme();
  const [fullscreen, setFullscreen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Inline view state
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const translateStart = useRef({ x: 0, y: 0 });

  // Fullscreen view state (independent)
  const [fsScale, setFsScale] = useState(1);
  const [fsTranslate, setFsTranslate] = useState({ x: 0, y: 0 });
  const [fsDragging, setFsDragging] = useState(false);
  const fsDragStart = useRef({ x: 0, y: 0 });
  const fsTranslateStart = useRef({ x: 0, y: 0 });

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    let cancelled = false;

    async function render() {
      const mermaid = (await import("mermaid")).default;
      mermaid.initialize({
        startOnLoad: false,
        theme: resolvedTheme === "dark" ? "dark" : "default",
        fontFamily: "inherit",
      });

      const id = `mermaid-${Math.random().toString(36).slice(2, 9)}`;
      try {
        const { svg: rendered } = await mermaid.render(id, code);
        if (!cancelled) {
          setSvg(rendered);
          setScale(1);
          setTranslate({ x: 0, y: 0 });
        }
      } catch {
        if (!cancelled) setSvg(`<pre class="text-red-500 text-xs">Failed to render diagram</pre>`);
      }
    }

    render();
    return () => { cancelled = true; };
  }, [code, resolvedTheme]);

  useEffect(() => {
    if (!fullscreen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFullscreen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [fullscreen]);

  useEffect(() => {
    if (fullscreen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [fullscreen]);

  const handleScaleChange = useCallback((delta: number) => {
    setScale((s) => Math.min(Math.max(0.3, s + delta), 3));
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    setDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
    translateStart.current = { ...translate };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [translate]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging) return;
    setTranslate({
      x: translateStart.current.x + (e.clientX - dragStart.current.x),
      y: translateStart.current.y + (e.clientY - dragStart.current.y),
    });
  }, [dragging]);

  const handlePointerUp = useCallback(() => setDragging(false), []);

  const handleFsScaleChange = useCallback((delta: number) => {
    setFsScale((s) => Math.min(Math.max(0.3, s + delta), 3));
  }, []);

  const handleFsPointerDown = useCallback((e: React.PointerEvent) => {
    setFsDragging(true);
    fsDragStart.current = { x: e.clientX, y: e.clientY };
    fsTranslateStart.current = { ...fsTranslate };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [fsTranslate]);

  const handleFsPointerMove = useCallback((e: React.PointerEvent) => {
    if (!fsDragging) return;
    setFsTranslate({
      x: fsTranslateStart.current.x + (e.clientX - fsDragStart.current.x),
      y: fsTranslateStart.current.y + (e.clientY - fsDragStart.current.y),
    });
  }, [fsDragging]);

  const handleFsPointerUp = useCallback(() => setFsDragging(false), []);

  const toggleFullscreen = useCallback(() => {
    setFullscreen((f) => {
      if (!f) {
        setFsScale(1);
        setFsTranslate({ x: 0, y: 0 });
      }
      return !f;
    });
  }, []);

  const fullscreenOverlay = fullscreen && mounted
    ? createPortal(
        <div
          className="fixed inset-0 z-50 bg-background flex flex-col"
          style={{ width: "100vw", height: "100vh" }}
        >
          <MermaidToolbar
            title={title}
            fullscreen
            onZoomIn={() => setFsScale((s) => Math.min(s + 0.2, 3))}
            onZoomOut={() => setFsScale((s) => Math.max(s - 0.2, 0.3))}
            onReset={() => { setFsScale(1); setFsTranslate({ x: 0, y: 0 }); }}
            onToggleFullscreen={toggleFullscreen}
          />
          <div className="flex-1 min-h-0">
            <MermaidCanvas
              svg={svg}
              scale={fsScale}
              translate={fsTranslate}
              dragging={fsDragging}
              onPointerDown={handleFsPointerDown}
              onPointerMove={handleFsPointerMove}
              onPointerUp={handleFsPointerUp}
              onScaleChange={handleFsScaleChange}
            />
          </div>
        </div>,
        document.body
      )
    : null;

  return (
    <>
      <div className="mb-4 rounded-lg border border-border overflow-hidden">
        <MermaidToolbar
          title={title}
          fullscreen={false}
          onZoomIn={() => setScale((s) => Math.min(s + 0.2, 3))}
          onZoomOut={() => setScale((s) => Math.max(s - 0.2, 0.3))}
          onReset={() => { setScale(1); setTranslate({ x: 0, y: 0 }); }}
          onToggleFullscreen={toggleFullscreen}
        />
        <MermaidCanvas
          svg={svg}
          scale={scale}
          translate={translate}
          dragging={dragging}
          height="24rem"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onScaleChange={handleScaleChange}
        />
      </div>
      {fullscreenOverlay}
    </>
  );
}
