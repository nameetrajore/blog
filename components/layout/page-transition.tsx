"use client";

import { useEffect, useState, Children, type ReactNode } from "react";

export function PageTransition({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      {Children.map(children, (child, i) => (
        <div
          className="transition-all duration-500 ease-out"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(6px)",
            transitionDelay: `${i * 80}ms`,
          }}
        >
          {child}
        </div>
      ))}
    </>
  );
}
