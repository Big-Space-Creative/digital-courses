"use client";

import { ReactNode, useEffect, useState } from "react";
import {
  getPreferredTheme,
  THEME_STORAGE_KEY,
  ThemeContext,
  type Theme,
} from "@/hooks/useTheme";

// Static, compile-time-only content — never interpolates runtime or user
// data, so this dangerouslySetInnerHTML use carries no injection risk.
const BOOTSTRAP_SCRIPT = `(function () {
  try {
    var stored = localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});
    var dark = stored
      ? stored === "dark"
      : window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (dark && document.currentScript) {
      document.currentScript.parentElement.classList.add("theme-dark");
    }
  } catch (e) {}
})();`;

type ThemeProviderProps = {
  children: ReactNode;
};

/**
 * Scopes the dark theme to the marketing home surface only — the class
 * lands on this wrapper div, never on <html>, so /admin and /aluno stay on
 * --color-surface regardless of this toggle (Canvas Split Rule).
 *
 * Theme state starts deterministically "light" so the very first client
 * render matches the server exactly — localStorage/matchMedia genuinely
 * don't exist on the server, so any descendant that renders based on theme
 * (e.g. ThemeToggle's aria-label and icon) would otherwise hydrate
 * mismatched, which React treats as an error, not just a warning. The
 * inline bootstrap script below runs before hydration and sets the class
 * directly on the DOM, so the big visual surfaces (canvas, bento tiles)
 * never flash light-then-dark even though React's own state briefly does;
 * suppressHydrationWarning covers just that one attribute on this element.
 */
export default function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    // Resync to the real preference now that we're on the client — this is
    // the one legitimate exception to "avoid setState in an effect": the
    // data literally does not exist until the browser is available.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- see comment above
    setTheme(getPreferredTheme());
  }, []);

  useEffect(() => {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((current) => (current === "dark" ? "light" : "dark"));
  };

  return (
    <div
      className={theme === "dark" ? "theme-dark" : undefined}
      suppressHydrationWarning
    >
      <script dangerouslySetInnerHTML={{ __html: BOOTSTRAP_SCRIPT }} />
      <ThemeContext.Provider value={{ theme, toggleTheme }}>
        {children}
      </ThemeContext.Provider>
    </div>
  );
}
