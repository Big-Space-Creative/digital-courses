import type { Metadata } from "next";
import Link from "next/link";
import { MdOutlineGavel, MdArrowBack } from "react-icons/md";
import PulseWave from "@/components/brand/PulseWave";
import ThemeProvider from "@/components/marketing/ThemeProvider";
import ThemeToggle from "@/components/marketing/ThemeToggle";
import SiteFooter from "@/components/marketing/SiteFooter";

export const metadata: Metadata = {
  title: "Termos de Uso — AulasViolão",
  description:
    "Leia os Termos de Uso da plataforma AulasViolão antes de utilizar nossos serviços de cursos de violão online.",
};

const lastUpdated = "26 de maio de 2026";

export default function TermsOfUsePage() {
  return (
    <ThemeProvider>
      <div className="bg-surface text-ink flex min-h-dvh flex-col">
        <header className="mx-auto flex w-full max-w-3xl items-center justify-between px-5 py-6">
          <Link href="/" className="flex items-center gap-2.5">
            <PulseWave className="pulse-glow h-8 w-8" title="" />
            <span className="text-ink text-lg font-semibold tracking-tight">
              Pullse
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-ink/70 hover:text-accent focus-visible:ring-accent inline-flex items-center gap-1 rounded text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none"
            >
              <MdArrowBack aria-hidden="true" /> Voltar à home
            </Link>
            <ThemeToggle />
          </div>
        </header>

        <div className="mx-auto w-full max-w-3xl px-5 pt-6 pb-10 md:pt-10">
          <span className="bg-accent/10 text-accent mb-5 flex h-12 w-12 items-center justify-center rounded-full">
            <MdOutlineGavel size={24} aria-hidden="true" />
          </span>
          <h1 className="text-ink text-3xl font-semibold tracking-[-0.01em] text-balance md:text-4xl">
            Termos de Uso
          </h1>
          <p className="text-ink/60 mt-2 text-sm">
            Última atualização: {lastUpdated}
          </p>
          <p className="text-ink/80 mt-5 max-w-[68ch] text-base leading-7 text-pretty">
            Ao criar uma conta ou utilizar os serviços da{" "}
            <strong>AulasViolão</strong>, você concorda com os termos descritos
            abaixo. Leia com atenção antes de prosseguir.
          </p>
        </div>

        {/* Content */}
        <main className="mx-auto w-full max-w-3xl flex-1 px-5 pb-16">
          <div className="border-ink/10 divide-ink/10 divide-y border-t">
            <Section title="1. Aceitação dos Termos">
              <p>
                Ao se cadastrar e utilizar a plataforma{" "}
                <strong>AulasViolão</strong>, você declara ter lido, entendido e
                concordado com estes Termos de Uso. Caso não concorde com alguma
                condição, não utilize a plataforma.
              </p>
            </Section>

            <Section title="2. Descrição do Serviço">
              <p>
                A AulasViolão é uma plataforma de ensino online de violão que
                disponibiliza aulas em vídeo, materiais de apoio e
                acompanhamento de progresso para seus alunos cadastrados. O
                acesso ao conteúdo está sujeito às condições descritas nestes
                termos e ao plano de assinatura do usuário.
              </p>
            </Section>

            <Section title="3. Cadastro e Conta">
              <ul className="list-disc space-y-1.5 pl-5">
                <li>
                  Você deve fornecer informações verdadeiras, completas e
                  atualizadas durante o cadastro.
                </li>
                <li>
                  É de sua responsabilidade manter a confidencialidade de sua
                  senha e não compartilhá-la com terceiros.
                </li>
                <li>
                  Cada cadastro é individual e intransferível. É proibido criar
                  contas falsas ou múltiplas contas para o mesmo usuário.
                </li>
                <li>
                  A plataforma pode suspender ou encerrar contas que violem
                  estes termos.
                </li>
              </ul>
            </Section>

            <Section title="4. Uso Permitido">
              <p>
                Você pode utilizar a plataforma exclusivamente para fins
                educacionais pessoais. É <strong>expressamente proibido</strong>
                :
              </p>
              <ul className="mt-2 list-disc space-y-1.5 pl-5">
                <li>
                  Reproduzir, distribuir, vender ou compartilhar o conteúdo das
                  aulas sem autorização prévia.
                </li>
                <li>
                  Utilizar meios automatizados para acessar ou extrair conteúdo
                  da plataforma.
                </li>
                <li>
                  Fazer engenharia reversa, descompilar ou modificar qualquer
                  parte da plataforma.
                </li>
                <li>
                  Praticar qualquer ato que comprometa a segurança ou a
                  disponibilidade do serviço.
                </li>
              </ul>
            </Section>

            <Section title="5. Propriedade Intelectual">
              <p>
                Todo o conteúdo disponibilizado na AulasViolão — incluindo
                vídeos, textos, imagens, materiais de apoio e a estrutura da
                plataforma — é de propriedade exclusiva da AulasViolão ou de
                seus licenciantes, protegido pelas leis de direito autoral e
                propriedade intelectual aplicáveis.
              </p>
              <p className="mt-2">
                O cadastro e o acesso à plataforma não transferem ao usuário
                qualquer direito de propriedade sobre o conteúdo.
              </p>
            </Section>

            <Section title="6. Planos e Acesso ao Conteúdo">
              <p>
                O acesso ao conteúdo pode variar conforme o plano de assinatura
                do usuário:
              </p>
              <ul className="mt-2 list-disc space-y-1.5 pl-5">
                <li>
                  <strong>Plano Gratuito (Free):</strong> acesso apenas às aulas
                  marcadas como &ldquo;free preview&rdquo;.
                </li>
                <li>
                  <strong>Plano Premium:</strong> acesso completo a todos os
                  módulos e materiais do curso.
                </li>
              </ul>
            </Section>

            <Section title="7. Privacidade e Dados Pessoais">
              <p>
                O tratamento dos seus dados pessoais é regido pela nossa{" "}
                <Link
                  href="/politica-de-privacidade"
                  className="text-ink decoration-accent hover:text-accent font-medium underline underline-offset-2 transition-colors"
                >
                  Política de Privacidade
                </Link>
                , que está em conformidade com a Lei Geral de Proteção de Dados
                (LGPD — Lei nº 13.709/2018). Ao utilizar a plataforma, você
                concorda com as práticas descritas nessa política.
              </p>
            </Section>

            <Section title="8. Limitação de Responsabilidade">
              <p>
                A AulasViolão não garante que a plataforma estará disponível de
                forma ininterrupta ou livre de erros. Não somos responsáveis por
                danos decorrentes do uso inadequado do serviço, falhas de
                conexão à internet ou interrupções causadas por terceiros.
              </p>
            </Section>

            <Section title="9. Modificações nos Termos">
              <p>
                Reservamo-nos o direito de alterar estes Termos de Uso a
                qualquer momento. Alterações relevantes serão comunicadas por
                e-mail ou aviso na plataforma com antecedência razoável. O uso
                continuado da plataforma após as alterações implica a aceitação
                dos novos termos.
              </p>
            </Section>

            <Section title="10. Lei Aplicável e Foro">
              <p>
                Estes termos são regidos pelas leis da República Federativa do
                Brasil. Para dirimir quaisquer controvérsias, fica eleito o foro
                da comarca da sede da plataforma, com renúncia a qualquer outro,
                por mais privilegiado que seja.
              </p>
            </Section>
          </div>

          {/* Footer links */}
          <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <Link
              href="/politica-de-privacidade"
              className="text-ink decoration-accent hover:text-accent font-medium underline underline-offset-4 transition-colors"
            >
              Política de Privacidade →
            </Link>
            <Link
              href="/"
              className="text-ink/70 hover:text-accent font-medium transition-colors"
            >
              Voltar à home
            </Link>
          </div>
        </main>
        <SiteFooter />
      </div>
    </ThemeProvider>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="py-7">
      <h2 className="text-ink mb-3 text-xl font-semibold">{title}</h2>
      <div className="text-ink/80 max-w-[68ch] space-y-3 text-base leading-7">
        {children}
      </div>
    </section>
  );
}
