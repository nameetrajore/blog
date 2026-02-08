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
          className="transition-all duration-700 ease-out"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(12px)",
            transitionDelay: `${i * 150}ms`,
          }}
        >
          {child}
        </div>
      ))}
    </>
  );
}
