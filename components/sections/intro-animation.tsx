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
    // Small delay so the animation is visible after page load
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-light tracking-tight">
        {name.split("").map((char, i) => (
          <span
            key={i}
            className="inline-block transition-all duration-500"
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? "translateY(0)" : "translateY(8px)",
              filter: mounted ? "blur(0px)" : "blur(4px)",
              transitionDelay: `${i * 40}ms`,
            }}
          >
            {char === " " ? "\u00A0" : char}
          </span>
        ))}
      </h1>
      <p
        className="text-sm text-muted-foreground transition-all duration-700"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(6px)",
          transitionDelay: `${name.length * 40 + 200}ms`,
        }}
      >
        {subtitle}
      </p>
    </div>
  );
}
