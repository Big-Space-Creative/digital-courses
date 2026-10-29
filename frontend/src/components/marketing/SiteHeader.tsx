import Link from "next/link";
import PulseWave from "@/components/brand/PulseWave";
import ThemeToggle from "@/components/marketing/ThemeToggle";

type SiteHeaderProps = {
  isAuthenticated: boolean;
  dashboardHref: string;
};

/**
 * Floating frosted navbar — fixed to the viewport top with >=94% background
 * and 16px blur (DESIGN.md glass-header).
 * Keeps all controls on a single line on mobile (390px) without cramped wrapping.
 */
export default function SiteHeader({
  isAuthenticated,
  dashboardHref,
}: SiteHeaderProps) {
  return (
    <header className="fixed inset-x-0 top-3 z-40 px-3 sm:top-5 sm:px-6 md:px-8">
      <div className="glass-header mx-auto flex max-w-6xl items-center justify-between rounded-full px-3 py-1.5 sm:px-6 sm:py-2.5">
        <Link
          href="/"
          className="flex min-h-[44px] items-center gap-2 pr-1"
          aria-label="Pullse — Início"
        >
          <PulseWave className="h-7 w-7 sm:h-8 sm:w-8" title="" />
          <span className="text-text text-base font-semibold tracking-tight sm:text-lg">
            Pullse
          </span>
        </Link>

        <nav
          className="flex items-center gap-1.5 sm:gap-2"
          aria-label="Navegação principal"
        >
          <ThemeToggle />
          {isAuthenticated ? (
            <Link
              href={dashboardHref}
              className="focus-visible:ring-accent flex min-h-[44px] items-center justify-center rounded-full bg-[#FF6B07] px-3.5 py-2 text-xs font-semibold whitespace-nowrap text-[var(--on-accent)] shadow-sm transition-transform duration-150 ease-out hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none sm:px-5 sm:text-sm"
            >
              Minha área
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-text-muted hover:text-text focus-visible:ring-accent flex min-h-[44px] items-center justify-center rounded-full px-2.5 py-2 text-xs font-medium whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:outline-none sm:px-4 sm:text-sm"
              >
                Entrar
              </Link>
              <Link
                href="/register"
                className="focus-visible:ring-accent flex min-h-[44px] items-center justify-center rounded-full bg-[#FF6B07] px-3.5 py-2 text-xs font-semibold whitespace-nowrap text-[var(--on-accent)] shadow-sm transition-transform duration-150 ease-out hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none sm:px-5 sm:text-sm"
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
