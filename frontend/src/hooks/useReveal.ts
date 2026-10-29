"use client";

import { useEffect, useRef } from "react";

/**
 * Reveal-on-scroll via a single IntersectionObserver.
 * Sets `data-revealed="true"` on the element the first time it enters the
 * viewport, then unobserves it (fire-once). Pair with the `.reveal` class.
 *
 * SSR/no-IO safe: if IntersectionObserver is unavailable, content is shown
 * immediately so nothing is ever stuck invisible.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>(
  options?: IntersectionObserverInit,
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      el.dataset.revealed = "true";
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).dataset.revealed = "true";
            obs.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px", ...options },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [options]);

  return ref;
}
