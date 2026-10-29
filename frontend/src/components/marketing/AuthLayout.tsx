import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";
import {
  MdCheckCircle,
  MdFormatQuote,
  MdHelpOutline,
  MdSecurity,
  MdShield,
  MdStar,
} from "react-icons/md";
import PulseWave from "@/components/brand/PulseWave";
import ThemeProvider from "@/components/marketing/ThemeProvider";
import ThemeToggle from "@/components/marketing/ThemeToggle";

export type AuthContextType = "login" | "register" | "recovery";

type AuthLayoutProps = {
  children: ReactNode;
  contextType?: AuthContextType;
};

/**
 * AuthLayout — Shared chrome for authentication and password recovery pages.
 * - Contextual right panel:
 *   - "login" / "register": highlights student benefits and real testimonial
 *   - "recovery": security instructions and support guidance
 * - Full dark mode support using semantic tokens (no white bands in dark theme)
 * - Accessible header with brand logo and ThemeToggle
 */
export default function AuthLayout({
  children,
  contextType = "login",
}: AuthLayoutProps) {
  const isRecovery = contextType === "recovery";

  return (
    <ThemeProvider>
      <div className="flex min-h-dvh bg-[var(--canvas)] text-[var(--text)]">
        {/* Main form column */}
        <div className="flex flex-1 flex-col px-5 py-6 sm:px-8 md:px-10 lg:px-14">
          <header className="flex items-center justify-between">
            <Link
              href="/"
              className="focus-visible:ring-accent flex min-h-[44px] items-center gap-2.5 rounded-md focus-visible:ring-2 focus-visible:outline-none"
              aria-label="Pullse — Voltar à página inicial"
            >
              <PulseWave className="h-8 w-8" title="" />
              <span className="text-text text-lg font-semibold tracking-tight">
                Pullse
              </span>
            </Link>
            <ThemeToggle />
          </header>

          <main className="flex flex-1 flex-col justify-center py-8 md:mx-auto md:w-full md:max-w-md">
            {children}
          </main>
        </div>

        {/* Contextual side panel */}
        <div className="relative m-3 hidden overflow-hidden rounded-[var(--radius-hero)] border border-[var(--border)] bg-[var(--media)] shadow-[var(--shadow-overlay)] md:m-4 md:flex md:flex-1">
          {isRecovery ? (
            <>
              <Image
                src="/03.jpg"
                alt="Aluna praticando violão clássico ao ar livre"
                fill
                sizes="45vw"
                className="object-cover opacity-35"
                style={{ objectPosition: "50% 30%" }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/30" />
              <div className="relative z-10 flex flex-1 flex-col justify-between p-8 text-white md:p-12">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-9 items-center justify-center rounded-xl bg-[#FF6B07] font-bold text-[var(--on-accent)]">
                    <MdSecurity size={20} aria-hidden="true" />
                  </span>
                  <span className="text-sm font-semibold tracking-wide text-white/90 uppercase">
                    Acesso Seguro
                  </span>
                </div>

                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
                      Orientações de recuperação
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-white/80">
                      Siga estas dicas para redefinir seu acesso com total
                      segurança e rapidez:
                    </p>
                  </div>

                  <ul className="space-y-3.5 text-sm text-white/90">
                    <li className="flex items-start gap-3">
                      <MdCheckCircle
                        className="mt-0.5 size-5 shrink-0 text-[#FF6B07]"
                        aria-hidden="true"
                      />
                      <span>
                        <strong className="text-white">
                          Caixa de entrada:
                        </strong>{" "}
                        Verifique também sua pasta de spam ou promoções.
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <MdShield
                        className="mt-0.5 size-5 shrink-0 text-[#FF6B07]"
                        aria-hidden="true"
                      />
                      <span>
                        <strong className="text-white">Link temporário:</strong>{" "}
                        O link expira por segurança para proteger sua conta.
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <MdHelpOutline
                        className="mt-0.5 size-5 shrink-0 text-[#FF6B07]"
                        aria-hidden="true"
                      />
                      <span>
                        <strong className="text-white">
                          Precisa de ajuda?
                        </strong>{" "}
                        Nossa equipe está pronta para auxiliar no seu acesso.
                      </span>
                    </li>
                  </ul>
                </div>

                <p className="text-xs text-white/60">
                  Pullse Plataforma de Cursos — Ambiente criptografado
                </p>
              </div>
            </>
          ) : (
            <>
              <Image
                src="/02.jpg"
                alt="Aluno tocando guitarra elétrica ao vivo, sorrindo"
                fill
                sizes="45vw"
                className="object-cover opacity-40"
                style={{ objectPosition: "32% 38%" }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/55 to-black/25" />
              <div className="relative z-10 flex flex-1 flex-col justify-between p-8 text-white md:p-12">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-9 items-center justify-center rounded-xl bg-[#FF6B07] font-bold text-[var(--on-accent)]">
                    P
                  </span>
                  <span className="text-sm font-semibold tracking-wide text-white/90 uppercase">
                    Sua jornada musical
                  </span>
                </div>

                <div className="space-y-6">
                  <div>
                    <div className="flex items-center gap-1 text-[#FF6B07]">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <MdStar key={index} size={18} aria-hidden="true" />
                      ))}
                    </div>
                    <MdFormatQuote
                      size={36}
                      className="mt-3 text-white/40"
                      aria-hidden="true"
                    />
                    <blockquote className="text-lg leading-relaxed text-white md:text-xl">
                      &quot;Eu tentei aprender sozinha por anos e sempre travava
                      no mesmo ponto. Aqui os módulos me levaram do zero até
                      tocar minhas músicas favoritas sem pular etapa
                      nenhuma.&quot;
                    </blockquote>
                  </div>

                  <div>
                    <p className="font-semibold text-white">Mariana Duarte</p>
                    <p className="text-sm text-white/75">
                      29 anos, aluna há 8 meses
                    </p>
                  </div>
                </div>

                <div className="border-t border-white/20 pt-4 text-xs text-white/70">
                  Aulas em vídeo com progressão módulo a módulo e material de
                  apoio.
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </ThemeProvider>
  );
}
