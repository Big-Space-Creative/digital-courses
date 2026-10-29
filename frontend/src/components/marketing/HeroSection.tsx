import Image from "next/image";
import Link from "next/link";
import { MdOutlinePlayCircle, MdStar } from "react-icons/md";

type HeroSectionProps = {
  isAuthenticated: boolean;
  primaryHref: string;
};

const stats = [
  { label: "Aulas objetivas", value: "+120" },
  { label: "Módulos ativos", value: "18" },
  { label: "Prática guiada", value: "100%" },
  { label: "Suporte didático", value: "Sempre" },
];

/**
 * The Pulse Bento grid: light headline tile, accent tile, ink tile (stat
 * grid), and a tall photo tile. Every tile is flat/opaque — no shadow, no
 * blur (Flat Bento Rule). The section itself sits on the page's light
 * surface (matching `<main>`) rather than the drenched accent-ink canvas —
 * dropped so the cursor-ripple field reads consistently everywhere on the
 * page instead of fighting a dark background. The floating `SiteHeader` is
 * mounted at the page level, not here — it needs to stay fixed across every
 * section, not just this one.
 */
export default function HeroSection({
  isAuthenticated,
  primaryHref,
}: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden">
      <div className="relative z-10 mx-auto max-w-6xl px-5 pt-24 pb-16 md:px-8 md:pt-32 md:pb-24">
        <div
          className="reveal grid gap-5 md:grid-cols-[1.4fr_1fr] md:gap-6"
          style={{
            gridTemplateAreas: "'headline photo' 'accent photo' 'stats photo'",
          }}
        >
          <div
            className="rounded-bento-xl bg-surface-soft border-ink/10 border p-7 md:p-10"
            style={{ gridArea: "headline" }}
          >
            <h1 className="text-ink text-3xl leading-[1.05] font-semibold tracking-[-0.02em] text-balance md:text-5xl">
              Domine o violão com uma trilha clara, do primeiro acorde à
              apresentação
            </h1>
            <p className="text-ink/70 mt-4 max-w-lg text-sm leading-relaxed text-pretty md:text-base">
              Aulas em vídeo organizadas por módulo, prática guiada e
              acompanhamento de progresso — para você tocar com confiança, no
              seu ritmo.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href={primaryHref}
                className="gradient-animate inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium text-white shadow-lg transition-transform duration-150 ease-out hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:outline-none"
                style={{ backgroundImage: "var(--gradient-pulse)" }}
              >
                <MdOutlinePlayCircle size={18} />
                {isAuthenticated ? "Ir para minha área" : "Começar agora"}
              </Link>
              <Link
                href="/login"
                className="border-ink/15 text-ink hover:bg-ink/5 focus-visible:ring-accent inline-flex items-center rounded-full border px-5 py-3 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none"
              >
                Já tenho conta
              </Link>
            </div>
          </div>

          <div
            className="rounded-bento-xl bg-accent p-6 md:p-8"
            style={{ gridArea: "accent" }}
          >
            <div className="flex items-center gap-1 text-white">
              {Array.from({ length: 5 }).map((_, index) => (
                <MdStar key={index} size={16} />
              ))}
            </div>
            <p className="mt-3 text-sm leading-relaxed font-medium text-white md:text-base">
              Método aprovado por alunos iniciantes e avançados.
            </p>
          </div>

          <div
            className="rounded-bento-xl bg-ink p-6 md:p-8"
            style={{ gridArea: "stats" }}
          >
            <div className="grid grid-cols-2 gap-x-4 gap-y-5">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <p className="text-surface text-xl font-semibold md:text-2xl">
                    {stat.value}
                  </p>
                  <p className="text-surface/60 mt-1 text-xs">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div
            className="rounded-bento-xl relative min-h-[280px] overflow-hidden md:min-h-0"
            style={{ gridArea: "photo" }}
          >
            <Image
              src="/02.jpg"
              alt="Aluno tocando guitarra elétrica ao vivo, sorrindo"
              fill
              sizes="(min-width: 768px) 40vw, 100vw"
              className="object-cover"
              style={{ objectPosition: "32% 38%" }}
              priority
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 via-black/0 to-transparent p-5 pt-16">
              <p className="text-sm font-medium text-white">
                Alunos reais, resultado real.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
