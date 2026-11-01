"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type NavigationStartEvent = CustomEvent<string>;

export default function NavigationLoader() {
  const pathname = usePathname();
  const [navigationTarget, setNavigationTarget] = useState<{
    id: number;
    pathname: string;
    startedAt: number;
  } | null>(() =>
    pathname === "/Home"
      ? { id: 0, pathname, startedAt: Date.now() }
      : null,
  );
  const nextNavigationId = useRef(0);
  const fallbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!navigationTarget || navigationTarget.pathname !== pathname) return;

    const minimumDisplayTime = navigationTarget.id === 0 ? 1000 : 2000;
    const elapsedTime = Date.now() - navigationTarget.startedAt;
    const timer = setTimeout(
      () => setNavigationTarget((target) => (target?.id === navigationTarget.id ? null : target)),
      Math.max(0, minimumDisplayTime - elapsedTime),
    );
    return () => clearTimeout(timer);
  }, [navigationTarget, pathname]);

  useEffect(() => {
    const beginNavigation = (destinationHref: string) => {
      const destination = new URL(destinationHref, window.location.href);
      if (destination.origin !== window.location.origin) return;
      if (
        destination.pathname === window.location.pathname &&
        destination.search === window.location.search
      ) {
        return;
      }

      const id = ++nextNavigationId.current;
      setNavigationTarget({ id, pathname: destination.pathname, startedAt: Date.now() });
      if (fallbackTimer.current) clearTimeout(fallbackTimer.current);
      fallbackTimer.current = setTimeout(() => {
        setNavigationTarget((target) => (target?.id === id ? null : target));
      }, 10000);
    };

    const handleNavigationClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) return;

      const link = target.closest("a[href]");
      if (
        !(link instanceof HTMLAnchorElement) ||
        link.target === "_blank" ||
        link.hasAttribute("download") ||
        link.getAttribute("aria-disabled") === "true"
      ) {
        return;
      }

      beginNavigation(link.href);
    };

    const handleHistoryNavigation = () => setNavigationTarget(null);
    const handleProgrammaticNavigation = (event: Event) => {
      const destination = (event as NavigationStartEvent).detail;
      if (typeof destination === "string") beginNavigation(destination);
    };

    document.addEventListener("click", handleNavigationClick, true);
    window.addEventListener("popstate", handleHistoryNavigation);
    window.addEventListener("sgcst:navigation-start", handleProgrammaticNavigation);
    return () => {
      document.removeEventListener("click", handleNavigationClick, true);
      window.removeEventListener("popstate", handleHistoryNavigation);
      window.removeEventListener("sgcst:navigation-start", handleProgrammaticNavigation);
      if (fallbackTimer.current) clearTimeout(fallbackTimer.current);
    };
  }, []);

  if (!navigationTarget) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/90 backdrop-blur-sm"
      role="status"
      aria-live="polite"
      aria-label="Loading page"
    >
      <div className="flex flex-col items-center gap-4">
        <div className="relative flex h-24 w-24 items-center justify-center">
          <span className="absolute inset-0 rounded-full border-[3px] border-[#FFC107]/25 border-t-[#0D2B45] motion-safe:animate-spin motion-reduce:animate-none" />
          <Image
            src="/logo1.jpg"
            alt=""
            width={68}
            height={68}
            priority
            className="h-[68px] w-[68px] rounded-full object-cover"
          />
        </div>
        <span className="text-sm font-bold tracking-wide text-[#0D2B45]">
          Loading…
        </span>
      </div>
    </div>
  );
}
