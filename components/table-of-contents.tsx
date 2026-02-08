"use client";

import { useState } from "react";

type Heading = { id: string; text: string; level: 2 | 3 };

export function TableOfContents({ headings }: { headings: Heading[] }) {
  const [open, setOpen] = useState(false);

  if (headings.length === 0) return null;

  return (
    <nav className="mb-8 border border-border rounded-lg">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium cursor-pointer"
      >
        <span>Table of Contents</span>
        <span className="text-muted-foreground text-xs">
          {open ? "Hide" : "Show"}
        </span>
      </button>
      {open && (
        <ul className="px-4 pb-3 space-y-1">
          {headings.map((h) => (
            <li key={h.id} className={h.level === 3 ? "pl-4" : ""}>
              <a
                href={`#${h.id}`}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {h.text}
              </a>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
}
