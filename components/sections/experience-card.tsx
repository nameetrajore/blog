"use client";

import { useState, type ReactNode } from "react";

type RenderedExperienceItem = {
  role: string;
  company: string;
  period: string;
  descriptionContent: ReactNode;
};

export function ExperienceCard({ item }: { item: RenderedExperienceItem }) {
  const [open, setOpen] = useState(false);
  const hasDetails = !!item.descriptionContent;

  return (
    <div className="relative pl-6">
      <div className="absolute left-0 top-1.5 h-2 w-2 rounded-full bg-primary -translate-x-[3.5px]" />
      <div
        className={`flex flex-col gap-1 ${hasDetails ? "cursor-pointer" : ""}`}
        onClick={() => hasDetails && setOpen((o) => !o)}
      >
        <div className="flex flex-wrap items-baseline gap-x-2">
          <span className="font-medium">{item.role}</span>
          {item.company && (
            <span className="text-sm text-muted-foreground">
              @ {item.company}
            </span>
          )}
          {hasDetails && (
            <span
              className="text-xs text-muted-foreground transition-transform duration-150 inline-block"
              style={{ transform: open ? "rotate(90deg)" : "rotate(0deg)" }}
            >
              ▶
            </span>
          )}
        </div>
        {item.period && (
          <span className="text-sm text-muted-foreground">{item.period}</span>
        )}
      </div>
      <div
        className="overflow-hidden transition-[grid-template-rows] duration-200 ease-out grid"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="min-h-0">
          {item.descriptionContent && (
            <div className="mt-2">{item.descriptionContent}</div>
          )}
        </div>
      </div>
    </div>
  );
}
