"use client";

import { useEffect, useState } from "react";

export default function Reveal({
  children,
  direction = "left",
  className = "",
}: {
  children: React.ReactNode;
  direction?: "left" | "right";
  className?: string;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [element, setElement] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!element) return;

    if (typeof window.IntersectionObserver !== "function") {
      const frame = window.requestAnimationFrame(() => setIsVisible(true));
      return () => window.cancelAnimationFrame(frame);
    }

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.12 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [element]);

  return (
    <div
      ref={setElement}
      className={`${className} transition-[opacity,translate] duration-700 ease-out motion-reduce:duration-300 ${
        isVisible
          ? "translate-x-0 opacity-100"
          : direction === "left"
            ? "-translate-x-16 opacity-0 motion-reduce:-translate-x-8"
            : "translate-x-16 opacity-0 motion-reduce:translate-x-8"
      }`}
    >
      {children}
    </div>
  );
}
