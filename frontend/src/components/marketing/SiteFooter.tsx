import Link from "next/link";

/**
 * SiteFooter — Semantic footer with accessible contrast (solid text-text-muted, no opacity leaks).
 */
export default function SiteFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-[var(--border)] bg-[var(--panel)]">
      <div className="relative z-10 mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-6 gap-y-3 px-5 py-8 text-xs text-[var(--text-muted)] md:px-8">
        <span>
          © {new Date().getFullYear()} Pullse. Todos os direitos reservados.
        </span>
        <a
          href="mailto:contato@pullse.com.br"
          className="hover:text-accent-text focus-visible:ring-accent rounded-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
        >
          contato@pullse.com.br
        </a>
        <Link
          href="/politica-de-privacidade"
          className="hover:text-accent-text focus-visible:ring-accent rounded-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
        >
          Política de Privacidade
        </Link>
        <Link
          href="/termos-de-uso"
          className="hover:text-accent-text focus-visible:ring-accent rounded-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
        >
          Termos de Uso
        </Link>
      </div>
    </footer>
  );
}
