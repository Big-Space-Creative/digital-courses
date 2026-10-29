import Link from "next/link";
import PulseWave from "@/components/brand/PulseWave";
import ThemeToggle from "@/components/marketing/ThemeToggle";

type SiteHeaderProps = {
  isAuthenticated: boolean;
  dashboardHref: string;
};

/**
 * Floating frosted navbar — fixed to the viewport top, `.glass-strong` so it
 * reads over both the dark accent-ink hero canvas and the light surface
 * sections beneath it as the page scrolls (glass is background-agnostic by
 * design; see DESIGN.md's overlay scope). Mounted once at the page level,
 * not per-section.
 */
export default function SiteHeader({
  isAuthenticated,
  dashboardHref,
}: SiteHeaderProps) {
  return (
    <header className="fixed inset-x-0 top-4 z-40 px-5 md:top-6 md:px-8">
      <div className="glass-strong mx-auto flex max-w-6xl items-center justify-between rounded-full px-4 py-2.5 md:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <PulseWave className="pulse-glow h-8 w-8" title="" />
          <span className="text-ink text-lg font-semibold tracking-tight">
            Pullse
          </span>
        </Link>

        <nav className="flex items-center gap-2">
          <ThemeToggle />
          {isAuthenticated ? (
            <Link
              href={dashboardHref}
              className="gradient-animate rounded-full px-5 py-2 text-sm font-medium text-white transition-transform duration-150 ease-out hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:outline-none"
              style={{ backgroundImage: "var(--gradient-pulse)" }}
            >
              Ir para minha área
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-ink/75 hover:text-ink rounded-full px-4 py-2 text-sm font-medium transition-colors"
              >
                Entrar
              </Link>
              <Link
                href="/register"
                className="gradient-animate rounded-full px-5 py-2 text-sm font-medium text-white transition-transform duration-150 ease-out hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:outline-none"
                style={{ backgroundImage: "var(--gradient-pulse)" }}
              >
                Criar conta
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
