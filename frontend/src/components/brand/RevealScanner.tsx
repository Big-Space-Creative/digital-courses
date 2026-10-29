"use client";

import { useEffect } from "react";

/**
 * Global safety net for the `.reveal` fade-up pattern. Individual components
 * can opt in to a specific reveal via `useReveal()` (see JourneySection's
 * connector line), but most `.reveal`-classed elements across the page never
 * attach that ref — without an observer, `.reveal`'s default `opacity: 0`
 * never flips to visible and the section ships permanently blank.
 *
 * This scans the whole document once on mount and observes every `.reveal`
 * element that isn't already wired up, so a missing ref never means
 * invisible content again. Mount once, at the page level.
 */
export default function RevealScanner() {
  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>(
      ".reveal:not([data-revealed])",
    );
    if (elements.length === 0) return;

    if (typeof IntersectionObserver === "undefined") {
      elements.forEach((el) => {
        el.dataset.revealed = "true";
      });
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
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return null;
}
