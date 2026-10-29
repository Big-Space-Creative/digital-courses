"use client";

import { MdDarkMode, MdLightMode } from "react-icons/md";
import { useTheme } from "@/hooks/useTheme";

/**
 * A literal switch for the home page's scoped dark theme (see
 * ThemeProvider): a pill track with light/dark icons fixed at each end and
 * a thumb that slides to whichever side is active, rather than a single
 * button that swaps its own icon. Isolated as its own client island so
 * SiteHeader/AuthLayout can stay Server Components.
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
      className="border-ink/10 bg-surface-soft focus-visible:ring-accent relative inline-flex h-8 w-14 shrink-0 items-center rounded-full border transition-colors focus-visible:ring-2 focus-visible:outline-none"
    >
      <MdLightMode
        aria-hidden="true"
        size={13}
        className="text-ink/35 absolute left-1.5 top-1/2 -translate-y-1/2"
      />
      <MdDarkMode
        aria-hidden="true"
        size={13}
        className="text-ink/35 absolute right-1.5 top-1/2 -translate-y-1/2"
      />
      <span
        aria-hidden="true"
        style={{ backgroundImage: "var(--gradient-pulse)" }}
        className={`absolute top-1 left-1 grid size-6 place-items-center rounded-full text-white shadow-sm transition-transform duration-300 ease-out motion-reduce:transition-none ${
          isDark ? "translate-x-6" : "translate-x-0"
        }`}
      >
        {isDark ? <MdDarkMode size={13} /> : <MdLightMode size={13} />}
      </span>
    </button>
  );
}
