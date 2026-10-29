import Image from "next/image";
import { MdOutlinePlayCircle, MdStar } from "react-icons/md";
import { ButtonLink } from "@/components/ui/ButtonLink";
import PulseWave from "@/components/brand/PulseWave";
import PullseLogo from "@/components/brand/PullseLogo";

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
 * Hero Section — Pullse Bento Grid.
 * - H1 typography: text-[length:var(--text-hero)] clamp(2.25rem, 1.75rem + 2.5vw, 3.75rem)
 * - Radius: 28px max (rounded-[var(--radius-hero)])
 * - Contrast AA: Ink text (#1D1E1F) over orange #FF6B07 (never white over orange)
 * - Semantic surfaces: panel / panel-elevated (no fixed bg-ink)
 * - Photo tile: palhetas da ID visual Pullse (fundo branco de produto)
 */
export default function HeroSection({
  isAuthenticated,
  primaryHref,
}: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden">
      <div className="relative z-10 mx-auto max-w-6xl px-5 pt-24 pb-14 md:px-8 md:pt-32 md:pb-20">
        <div
          className="reveal grid gap-5 md:grid-cols-[1.4fr_1fr] md:gap-6"
          style={{
            gridTemplateAreas: "'headline photo' 'accent photo' 'stats photo'",
          }}
        >
          {/* Headline tile */}
          <div
            className="rounded-[var(--radius-hero)] border border-[var(--border)] bg-[var(--panel)] p-7 shadow-[var(--shadow-panel)] md:p-10"
            style={{ gridArea: "headline" }}
          >
            <h1 className="text-text text-[length:var(--text-hero)] leading-[1.08] font-semibold tracking-[-0.03em] text-balance">
              Domine o violão com uma trilha clara, do primeiro acorde à
              apresentação
            </h1>
            <p className="text-text-muted mt-4 max-w-lg text-sm leading-relaxed text-pretty md:text-base">
              Aulas em vídeo organizadas por módulo, prática guiada e
              acompanhamento de progresso — para você tocar com confiança, no
              seu ritmo.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <ButtonLink
                href={primaryHref}
                variant="primary"
                size="md"
                className="gap-2 rounded-full shadow-sm"
              >
                <MdOutlinePlayCircle size={20} aria-hidden="true" />
                <span>
                  {isAuthenticated ? "Ir para minha área" : "Começar agora"}
                </span>
              </ButtonLink>
              <ButtonLink
                href="/login"
                variant="secondary"
                size="md"
                className="rounded-full"
              >
                Já tenho conta
              </ButtonLink>
            </div>
          </div>

          {/* Accent tile — High contrast: ink text and stars over orange (#FF6B07) */}
          <div
            className="rounded-[var(--radius-hero)] bg-[#FF6B07] p-6 shadow-sm md:p-8"
            style={{ gridArea: "accent" }}
          >
            <div className="flex items-center gap-1 text-[var(--on-accent)]">
              {Array.from({ length: 5 }).map((_, index) => (
                <MdStar key={index} size={18} aria-hidden="true" />
              ))}
            </div>
            <p className="mt-3 text-sm leading-relaxed font-semibold text-[var(--on-accent)] md:text-base">
              Método aprovado por alunos iniciantes e avançados.
            </p>
          </div>

          {/* Stats tile — Semantic surface (panel-elevated) */}
          <div
            className="rounded-[var(--radius-hero)] border border-[var(--border)] bg-[var(--panel-elevated)] p-6 shadow-[var(--shadow-panel)] md:p-8"
            style={{ gridArea: "stats" }}
          >
            <div className="grid grid-cols-2 gap-x-4 gap-y-5">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <p className="text-text text-xl font-semibold md:text-2xl">
                    {stat.value}
                  </p>
                  <p className="text-text-muted mt-1 text-xs">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Photo tile — palhetas da marca sobre o branco da fotografia de produto */}
          <div
            className="relative flex min-h-[420px] flex-col overflow-hidden rounded-[var(--radius-hero)] border border-[var(--border)] bg-[#FEFEFE] shadow-[var(--shadow-panel)] md:min-h-0"
            style={{ gridArea: "photo" }}
          >
            {/* Versão "logo branco no laranja" da ID visual */}
            <div className="flex items-center justify-center bg-[#FF6B07] px-8 py-10 text-[#1D1E1F]">
              <PullseLogo
                tone="inverse"
                className="h-auto w-full max-w-[280px]"
              />
            </div>
            <div className="relative min-h-[200px] flex-1">
              <Image
                src="/brand/palhetas-pullse.webp"
                alt="Palhetas pretas e laranja com o logo Pullse ao lado de uma lata personalizada"
                fill
                sizes="(min-width: 768px) 40vw, 100vw"
                className="object-contain p-4"
                priority
              />
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-black/10 px-5 py-4">
              <p className="text-sm font-medium text-[#1D1E1F]">
                Pegue a palheta. A gente cuida da trilha.
              </p>
              <PulseWave className="h-7 w-7 shrink-0" title="" loop={false} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
