"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useTheme } from "next-themes";

export function Mermaid({ code: rawCode }: { code: string }) {
  const titleMatch = rawCode.match(/^%%title:\s*(.+)$/m);
  const title = titleMatch ? titleMatch[1].trim() : null;
  const code = titleMatch ? rawCode.replace(titleMatch[0], "").trim() : rawCode;
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState("");
  const { resolvedTheme } = useTheme();

  // Pan & zoom state
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const translateStart = useRef({ x: 0, y: 0 });

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
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setScale((s) => Math.min(Math.max(0.3, s + delta), 3));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
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

  const handlePointerUp = useCallback(() => {
    setDragging(false);
  }, []);

  const resetView = useCallback(() => {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
  }, []);

  return (
    <div className="mb-4 rounded-lg border border-border overflow-hidden">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-border/50 bg-muted/50">
        <span className="text-xs text-muted-foreground">{title ?? "mermaid"}</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setScale((s) => Math.min(s + 0.2, 3))}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            +
          </button>
          <button
            onClick={() => setScale((s) => Math.max(s - 0.2, 0.3))}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            −
          </button>
          <button
            onClick={resetView}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            Reset
          </button>
        </div>
      </div>
      <div
        ref={containerRef}
        className="relative overflow-hidden bg-muted/30"
        style={{ height: "24rem", cursor: dragging ? "grabbing" : "grab" }}

        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <div
          ref={svgRef}
          className="absolute inset-0 flex items-center justify-center [&_svg]:max-w-none"
          style={{
            transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
            transformOrigin: "center center",
          }}
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      </div>
    </div>
  );
}
