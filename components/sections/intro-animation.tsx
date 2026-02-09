"use client";

import { useEffect, useState } from "react";

export function IntroAnimation({
  name,
  subtitle,
}: {
  name: string;
  subtitle: string;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="space-y-2">
      <h1 className="text-xl font-light tracking-tight">
        {name.split("").map((char, i) => (
          <span
            key={i}
            className="inline-block transition-all duration-500"
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? "translateY(0)" : "translateY(4px)",
              transitionDelay: `${i * 25}ms`,
            }}
          >
            {char === " " ? "\u00A0" : char}
          </span>
        ))}
      </h1>
      <p
        className="text-sm text-muted-foreground transition-all duration-500"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(4px)",
          transitionDelay: `${name.length * 25 + 100}ms`,
        }}
      >
        {subtitle}
      </p>
    </div>
  );
}
