"use client";

import { ReactNode } from "react";
import { MdLockOutline, MdOutlineEmail } from "react-icons/md";
import { Input } from "@/components/form/Input";
import PulseWave from "@/components/brand/PulseWave";
import GlassCard from "@/components/ui/GlassCard";
import GradientButton from "@/components/ui/GradientButton";
import { useReveal } from "@/hooks/useReveal";

/** Local reveal-on-scroll wrapper using the shared IntersectionObserver hook. */
function Reveal({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useReveal<HTMLDivElement>();
  return (
    <div ref={ref} className={`reveal ${className}`}>
      {children}
    </div>
  );
}

const TOKENS: { name: string; value: string; role: string }[] = [
  {
    name: "--color-ink",
    value: "#1D1E1F",
    role: "Texto e superfícies escuras",
  },
  { name: "--color-surface", value: "#F5F7F8", role: "Canvas (claro)" },
  { name: "--color-surface-soft", value: "#FEFEFE", role: "Cards e campos" },
  { name: "--color-accent", value: "#FF6B07", role: "Pulso, uso raro" },
  { name: "--color-accent-500", value: "#FB7502", role: "Fim do gradiente" },
  { name: "--color-accent-ink", value: "#582807", role: "Canvas escuro" },
];

const RADII: { name: string; value: string }[] = [
  { name: "bento-sm", value: "12px" },
  { name: "bento-md", value: "20px" },
  { name: "bento-lg", value: "28px" },
  { name: "bento-xl", value: "40px" },
];

const CATALOG: { title: string; body: string }[] = [
  {
    title: "Pulse draw",
    body: "A waveline se desenha e uma cabeça luminosa percorre o traço, o movimento de assinatura.",
  },
  {
    title: "Gradient shift",
    body: "Varredura lenta do gradiente pulse nos CTAs. Desligada com prefers-reduced-motion.",
  },
  {
    title: "Glass lift",
    body: "Superfícies translúcidas (apenas sobreposições) sobem 4px no hover, só com transform.",
  },
  {
    title: "Reveal on scroll",
    body: "Opacity + translate ao entrar na viewport, via um único observer compartilhado.",
  },
];

const PRIMARY_BUTTON =
  "gradient-animate focus-visible:ring-accent inline-flex h-14 items-center justify-center rounded-full px-8 text-sm font-medium text-white shadow-lg transition-transform duration-150 ease-out hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none";

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="mb-6 text-[length:var(--text-h2)] leading-tight font-semibold text-balance">
      {children}
    </h2>
  );
}

export default function DesignSystemPage() {
  return (
    <main className="bg-surface text-ink min-h-screen">
      {/* Intro */}
      <section className="mx-auto flex max-w-5xl flex-col gap-6 px-6 pt-20 pb-16">
        <PulseWave
          className="pulse-glow h-16 w-auto self-start"
          title="Pullse"
          loop
        />
        <h1 className="text-[length:var(--text-hero)] leading-[1.05] font-semibold tracking-[-0.02em] text-balance">
          Pullse design system
        </h1>
        <p className="text-ink/70 max-w-[60ch] text-lg leading-relaxed">
          Página interna de referência. Lexend, laranja pulse usado com
          parcimônia, vidro apenas em sobreposições e movimento somente em{" "}
          <code>transform</code>, <code>opacity</code> e <code>filter</code>,
          sempre respeitando <code>prefers-reduced-motion</code>.
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <GradientButton className="h-14 px-8">Ação primária</GradientButton>
          <button
            type="button"
            className="border-ink/20 hover:bg-ink/5 focus-visible:ring-accent h-14 rounded-full border px-8 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            Ação secundária
          </button>
        </div>
      </section>

      {/* Palette */}
      <section className="mx-auto max-w-5xl px-6 pb-20">
        <Reveal>
          <SectionTitle>Paleta</SectionTitle>
        </Reveal>
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {TOKENS.map((t) => (
            <div key={t.name} className="flex flex-col gap-2">
              <div
                className="border-ink/10 h-20 w-full rounded-[var(--radius-bento-sm)] border"
                style={{ background: t.value }}
              />
              <div className="text-xs">
                <div className="font-mono">{t.value}</div>
                <div className="text-ink/70">{t.name}</div>
                <div className="text-ink/60">{t.role}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Radii */}
      <section className="mx-auto max-w-5xl px-6 pb-20">
        <Reveal>
          <SectionTitle>Raios bento</SectionTitle>
        </Reveal>
        <div className="flex flex-wrap gap-4">
          {RADII.map((r) => (
            <div
              key={r.name}
              className="bg-surface-soft border-ink/10 flex h-28 w-36 flex-col justify-end border p-3 text-xs"
              style={{ borderRadius: `var(--radius-${r.name})` }}
            >
              <span className="font-semibold">{r.name}</span>
              <span className="text-ink/60">{r.value}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Auth pattern */}
      <section className="mx-auto max-w-5xl px-6 pb-20">
        <Reveal>
          <SectionTitle>Autenticação e fluxos</SectionTitle>
          <p className="text-ink/70 mb-8 max-w-[60ch]">
            Login, cadastro, recuperação de senha e verificação de e-mail usam o
            mesmo <code>AuthLayout</code>: título, texto de apoio, campos em
            pílula bento e um único CTA com o gradiente pulse.
          </p>
        </Reveal>
        <div className="bg-surface-soft border-ink/10 rounded-[var(--radius-bento-lg)] border p-8 md:max-w-md">
          <div className="flex flex-col gap-1.5">
            <h3 className="text-3xl font-semibold tracking-[-0.01em]">
              Bem-vindo de volta
            </h3>
            <p className="text-ink/60 text-sm">
              Insira seus dados para acessar suas aulas.
            </p>
          </div>
          <div className="mt-6 flex flex-col gap-5">
            <Input
              label="Email"
              type="email"
              icon={MdOutlineEmail}
              placeholder="email@exemplo.com"
              readOnly
            />
            <Input
              label="Senha"
              type="password"
              icon={MdLockOutline}
              placeholder="******"
              error="A senha deve conter pelo menos 8 caracteres"
              readOnly
            />
            <button
              type="button"
              className={`${PRIMARY_BUTTON} w-full`}
              style={{ backgroundImage: "var(--gradient-pulse)" }}
            >
              Entrar
            </button>
          </div>
        </div>
      </section>

      {/* Glass (overlays only) */}
      <section className="mx-auto max-w-5xl px-6 pb-20">
        <Reveal>
          <SectionTitle>Vidro: somente sobreposições</SectionTitle>
        </Reveal>
        <div
          className="relative overflow-hidden rounded-[var(--radius-bento-lg)] p-8"
          style={{
            background:
              "radial-gradient(60% 60% at 20% 10%, rgba(255,107,7,0.35), transparent 60%), linear-gradient(180deg, #582807 0%, #1d1e1f 100%)",
          }}
        >
          <div className="grid gap-5 sm:grid-cols-3">
            <GlassCard>
              <h3 className="mb-2 font-semibold text-white">Vidro padrão</h3>
              <p className="text-sm text-white/80">
                blur(16px) + saturação, borda clara de 1px, sombra suave.
              </p>
            </GlassCard>
            <GlassCard tone="accent">
              <h3 className="mb-2 font-semibold text-white">
                Vidro em destaque
              </h3>
              <p className="text-sm text-white/85">
                Tingido de laranja para o item em foco.
              </p>
            </GlassCard>
            <GlassCard strong>
              <h3 className="mb-2 font-semibold text-white">Vidro forte</h3>
              <p className="text-sm text-white/80">
                blur(28px) para navbar, banner de cookies e modais.
              </p>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* Motion catalog */}
      <section className="mx-auto max-w-5xl px-6 pb-20">
        <Reveal>
          <SectionTitle>Catálogo de movimento</SectionTitle>
        </Reveal>
        <div className="grid gap-5 sm:grid-cols-2">
          {CATALOG.map((item) => (
            <Reveal key={item.title}>
              <article className="bg-surface-soft border-ink/10 rounded-[var(--radius-bento-md)] border p-6">
                <h3 className="mb-1 font-semibold">{item.title}</h3>
                <p className="text-ink/70 text-sm leading-relaxed">
                  {item.body}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Loading */}
      <section className="mx-auto max-w-5xl px-6 pb-28">
        <Reveal>
          <SectionTitle>Estados de carregamento</SectionTitle>
        </Reveal>
        <div className="grid gap-5 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="bg-surface-soft border-ink/10 rounded-[var(--radius-bento-md)] border p-5"
            >
              <div className="shimmer mb-4 h-32 w-full rounded-[var(--radius-bento-sm)]" />
              <div className="shimmer mb-2 h-4 w-3/4 rounded" />
              <div className="shimmer h-4 w-1/2 rounded" />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
