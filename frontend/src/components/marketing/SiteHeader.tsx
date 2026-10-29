import Link from "next/link";
import PulseWave from "@/components/brand/PulseWave";
import ThemeToggle from "@/components/marketing/ThemeToggle";
import { ButtonLink } from "@/components/ui/ButtonLink";

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
            <ButtonLink
              href={dashboardHref}
              variant="primary"
              size="sm"
              className="rounded-full whitespace-nowrap shadow-sm"
            >
              Minha área
            </ButtonLink>
          ) : (
            <>
              <ButtonLink
                href="/login"
                variant="ghost"
                size="sm"
                className="rounded-full whitespace-nowrap"
              >
                Entrar
              </ButtonLink>
              <ButtonLink
                href="/register"
                variant="primary"
                size="sm"
                className="rounded-full whitespace-nowrap shadow-sm"
              >
                Criar conta
              </ButtonLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
