import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="border-ink/10 relative overflow-hidden border-t">
      <div className="text-ink/50 relative z-10 mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-6 gap-y-2 px-5 py-8 text-xs md:px-8">
        <span>
          © {new Date().getFullYear()} Pullse. Todos os direitos reservados.
        </span>
        <a
          href="mailto:contato@pullse.com.br"
          className="hover:text-accent transition-colors"
        >
          contato@pullse.com.br
        </a>
        <Link
          href="/politica-de-privacidade"
          className="hover:text-accent transition-colors"
        >
          Política de Privacidade
        </Link>
        <Link
          href="/termos-de-uso"
          className="hover:text-accent transition-colors"
        >
          Termos de Uso
        </Link>
      </div>
    </footer>
  );
}
