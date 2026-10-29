"use client";

import { ReactNode, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  getPreferredTheme,
  THEME_STORAGE_KEY,
  ThemeContext,
  type Theme,
} from "@/hooks/useTheme";

// Static script runs before hydration so global overlays get the initial theme.
const BOOTSTRAP_SCRIPT = `(function () {
  var theme = "light";
  if (location.pathname !== "/admin" && !location.pathname.startsWith("/admin/")) {
    try {
      var stored = localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});
      theme = stored === "dark" || (stored !== "light" && matchMedia("(prefers-color-scheme: dark)").matches) ? "dark" : "light";
    } catch (e) {}
  }
  document.documentElement.dataset.theme = theme;
})();`;

type ThemeProviderProps = { children: ReactNode };

function RootThemeProvider({ children }: ThemeProviderProps) {
  const pathname = usePathname();
  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/");
  const [preference, setPreference] = useState<Theme>("light");
  const [ready, setReady] = useState(false);
  const theme = isAdmin ? "light" : preference;

  useEffect(() => {
    let preferred: Theme;
    try {
      preferred = getPreferredTheme();
    } catch {
      preferred = "light";
    }
    // Browser preference is unavailable during the server render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPreference(preferred);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem(THEME_STORAGE_KEY, preference);
    } catch {
      /* Theme still works when storage is unavailable. */
    }
  }, [theme, preference, ready, pathname]);

  const toggleTheme = () => {
    if (!isAdmin)
      setPreference((current) => (current === "dark" ? "light" : "dark"));
  };
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: BOOTSTRAP_SCRIPT }} />
      <ThemeContext.Provider value={{ theme, toggleTheme }}>
        {children}
      </ThemeContext.Provider>
    </>
  );
}

/** One global source; existing page wrappers reuse it without independent state. */
export default function ThemeProvider({ children }: ThemeProviderProps) {
  const parent = useContext(ThemeContext);
  return parent ? (
    <>{children}</>
  ) : (
    <RootThemeProvider>{children}</RootThemeProvider>
  );
}
