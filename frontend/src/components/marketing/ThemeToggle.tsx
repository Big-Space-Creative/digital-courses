"use client";

import { MdDarkMode, MdLightMode } from "react-icons/md";
import { useTheme } from "@/hooks/useTheme";

/**
 * Switch for the public pages' scoped dark theme.
 * High-contrast thumb (ink icon over #FF6B07) and semantic tokens.
 */
export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      onClick={toggleTheme}
      aria-label={
        isDark ? "Alternar para modo claro" : "Alternar para modo escuro"
      }
      className="border-control-border bg-panel focus-visible:ring-accent relative inline-flex h-8 w-14 shrink-0 items-center rounded-full border transition-colors focus-visible:ring-2 focus-visible:outline-none"
    >
      <MdLightMode
        aria-hidden="true"
        size={13}
        className="text-text-muted absolute top-1/2 left-1.5 -translate-y-1/2"
      />
      <MdDarkMode
        aria-hidden="true"
        size={13}
        className="text-text-muted absolute top-1/2 right-1.5 -translate-y-1/2"
      />
      <span
        aria-hidden="true"
        className={`absolute top-1 left-1 grid size-6 place-items-center rounded-full bg-[#FF6B07] text-[var(--on-accent)] shadow-sm transition-transform duration-300 ease-out motion-reduce:transition-none ${
          isDark ? "translate-x-6" : "translate-x-0"
        }`}
      >
        {isDark ? <MdDarkMode size={13} /> : <MdLightMode size={13} />}
      </span>
    </button>
  );
}
