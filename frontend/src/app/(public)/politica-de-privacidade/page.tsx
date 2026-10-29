import type { Metadata } from "next";
import Link from "next/link";
import {
  MdOutlinePrivacyTip,
  MdArrowBack,
  MdLockOutline,
  MdBarChart,
} from "react-icons/md";
import PulseWave from "@/components/brand/PulseWave";
import ThemeProvider from "@/components/marketing/ThemeProvider";
import ThemeToggle from "@/components/marketing/ThemeToggle";
import SiteFooter from "@/components/marketing/SiteFooter";

export const metadata: Metadata = {
  title: "Política de Privacidade — AulasViolão",
  description:
    "Saiba como a AulasViolão coleta, usa e protege seus dados pessoais em conformidade com a LGPD (Lei nº 13.709/2018).",
};

const lastUpdated = "26 de maio de 2026";

const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim() ?? "";
const SUPPORT_HREF = SUPPORT_EMAIL.startsWith("mailto:")
  ? SUPPORT_EMAIL
  : `mailto:${SUPPORT_EMAIL}`;

const SECTIONS = [
  { id: "controlador", title: "1. Quem somos (Controlador de dados)" },
  { id: "dados", title: "2. Quais dados coletamos" },
  { id: "finalidades", title: "3. Para que usamos seus dados" },
  { id: "base-legal", title: "4. Base legal para o tratamento" },
  { id: "cookies", title: "5. Cookies" },
  { id: "compartilhamento", title: "6. Compartilhamento de dados" },
  { id: "retencao", title: "7. Retenção dos dados" },
  { id: "direitos", title: "8. Seus direitos (Art. 18 da LGPD)" },
  { id: "seguranca", title: "9. Segurança" },
  { id: "alteracoes", title: "10. Alterações nesta política" },
];

export default function PrivacyPolicyPage() {
  return (
    <ThemeProvider>
      <div className="bg-surface text-text flex min-h-dvh flex-col">
        <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-5 py-6">
          <Link href="/" className="flex items-center gap-2.5">
            <PulseWave className="pulse-glow h-8 w-8" title="" />
            <span className="text-text text-lg font-semibold tracking-tight">
              Pullse
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-text-muted hover:text-accent-text focus-visible:ring-accent inline-flex items-center gap-1 rounded text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none"
            >
              <MdArrowBack aria-hidden="true" /> Voltar à home
            </Link>
            <ThemeToggle />
          </div>
        </header>

        <div className="mx-auto w-full max-w-5xl px-5 pt-6 pb-10 md:pt-10">
          <span className="bg-accent/10 text-accent mb-5 flex h-12 w-12 items-center justify-center rounded-full">
            <MdOutlinePrivacyTip size={24} aria-hidden="true" />
          </span>
          <h1 className="text-text text-3xl font-semibold tracking-[-0.01em] text-balance md:text-4xl">
            Política de Privacidade
          </h1>
          <p className="text-text-muted mt-2 text-sm">
            Última atualização: {lastUpdated}
          </p>
          <p className="text-text-muted mt-5 max-w-[68ch] text-base leading-7 text-pretty">
            Esta política descreve como a <strong>AulasViolão</strong> trata
            seus dados pessoais em conformidade com a{" "}
            <strong>
              Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018)
            </strong>
            .
          </p>
        </div>

        {/* Content */}
        <main className="mx-auto w-full max-w-5xl flex-1 px-5 pb-16">
          <div className="lg:grid lg:grid-cols-[14rem_minmax(0,1fr)] lg:items-start lg:gap-10">
            <details className="bg-surface-soft border-ink/10 rounded-bento-md mb-6 border px-5 lg:hidden">
              <summary className="text-text flex min-h-11 cursor-pointer items-center text-sm font-semibold">
                Nesta página
              </summary>
              <div className="pb-3">
                <TableOfContents />
              </div>
            </details>
            <aside className="hidden lg:sticky lg:top-8 lg:block">
              <p className="text-text-muted mb-3 text-xs font-semibold tracking-wide uppercase">
                Nesta página
              </p>
              <TableOfContents />
            </aside>
            <div className="min-w-0">
              <div className="bg-surface-soft border-ink/10 rounded-bento-md max-w-[72ch] border px-6 md:px-10">
                <div className="divide-ink/10 divide-y">
                  <Section
                    id="controlador"
                    title="1. Quem somos (Controlador de dados)"
                  >
                    <p>
                      A <strong>AulasViolão</strong> é a plataforma responsável
                      pelo tratamento dos seus dados pessoais. Para dúvidas
                      sobre esta política ou sobre o exercício dos seus
                      direitos, entre em contato pelo e-mail da plataforma
                      disponibilizado na seção de Ajuda.
                    </p>
                  </Section>

                  <Section id="dados" title="2. Quais dados coletamos">
                    <ul className="list-disc space-y-1.5 pl-5">
                      <li>
                        <strong>Dados de cadastro:</strong> nome completo e
                        endereço de e-mail, fornecidos por você no momento do
                        registro.
                      </li>
                      <li>
                        <strong>Dados de acesso:</strong> tokens de autenticação
                        (JWT) armazenados em cookies httpOnly seguros.
                      </li>
                      <li>
                        <strong>Dados de uso:</strong> progresso em aulas e
                        comentários enviados nas aulas (quando disponível).
                      </li>
                      <li>
                        <strong>Dados técnicos:</strong> endereço IP e
                        informações do navegador/dispositivo, coletados
                        automaticamente para segurança e funcionamento.
                      </li>
                    </ul>
                  </Section>

                  <Section
                    id="finalidades"
                    title="3. Para que usamos seus dados"
                  >
                    <ul className="list-disc space-y-1.5 pl-5">
                      <li>Criação e gerenciamento da sua conta de aluno.</li>
                      <li>
                        Disponibilização do conteúdo das aulas e materiais de
                        apoio.
                      </li>
                      <li>
                        Acompanhamento do seu progresso na trilha de
                        aprendizado.
                      </li>
                      <li>
                        Envio de e-mails transacionais (confirmação de conta,
                        redefinição de senha).
                      </li>
                      <li>
                        Segurança, prevenção de fraudes e integridade da
                        plataforma.
                      </li>
                    </ul>
                  </Section>

                  <Section
                    id="base-legal"
                    title="4. Base legal para o tratamento"
                  >
                    <p>
                      O tratamento dos seus dados é realizado com base nas
                      seguintes hipóteses previstas na LGPD:
                    </p>
                    <ul className="mt-2 list-disc space-y-1.5 pl-5">
                      <li>
                        <strong>Consentimento (Art. 7º, I):</strong> para
                        cookies não essenciais e comunicações de marketing.
                      </li>
                      <li>
                        <strong>Execução de contrato (Art. 7º, V):</strong>{" "}
                        dados necessários para a prestação do serviço de cursos.
                      </li>
                      <li>
                        <strong>Legítimo interesse (Art. 7º, IX):</strong> dados
                        técnicos de segurança e prevenção de abusos.
                      </li>
                    </ul>
                  </Section>

                  <Section id="cookies" title="5. Cookies">
                    <p>Utilizamos dois tipos de cookies:</p>
                    <div className="mt-3 space-y-3">
                      <div className="rounded-bento-sm border-ink/10 bg-surface-soft border p-4">
                        <p className="text-text flex items-center gap-2 font-semibold">
                          <MdLockOutline
                            className="text-accent"
                            aria-hidden="true"
                          />{" "}
                          Cookies essenciais (necessários)
                        </p>
                        <p className="text-text-muted mt-1 text-sm leading-6">
                          <code className="bg-ink/8 rounded px-1 text-xs">
                            access_token
                          </code>
                          ,{" "}
                          <code className="bg-ink/8 rounded px-1 text-xs">
                            refresh_token
                          </code>
                          ,{" "}
                          <code className="bg-ink/8 rounded px-1 text-xs">
                            user_role
                          </code>{" "}
                          — necessários para autenticação e navegação. Dispensam
                          consentimento por serem estritamente necessários para
                          o funcionamento do serviço.
                        </p>
                      </div>
                      <div className="rounded-bento-sm border-ink/10 bg-surface-soft border p-4">
                        <p className="text-text flex items-center gap-2 font-semibold">
                          <MdBarChart
                            className="text-accent"
                            aria-hidden="true"
                          />{" "}
                          Cookies analíticos (opcionais)
                        </p>
                        <p className="text-text-muted mt-1 text-sm leading-6">
                          Utilizados para entender como os alunos navegam na
                          plataforma e melhorar a experiência. Exigem seu
                          consentimento prévio, concedido pelo banner de
                          cookies.
                        </p>
                      </div>
                    </div>
                  </Section>

                  <Section
                    id="compartilhamento"
                    title="6. Compartilhamento de dados"
                  >
                    <p>
                      Seus dados <strong>não são vendidos</strong> a terceiros.
                      Podemos compartilhá-los apenas com:
                    </p>
                    <ul className="mt-2 list-disc space-y-1.5 pl-5">
                      <li>
                        Provedores de infraestrutura (servidores, armazenamento
                        de arquivos) que atuam como operadores de dados sob
                        contrato.
                      </li>
                      <li>
                        Autoridades públicas, quando exigido por lei ou ordem
                        judicial.
                      </li>
                    </ul>
                  </Section>

                  <Section id="retencao" title="7. Retenção dos dados">
                    <p>
                      Seus dados são mantidos enquanto sua conta estiver ativa.
                      Caso solicite a exclusão, seus dados pessoais serão
                      removidos em até <strong>30 dias</strong>, salvo obrigação
                      legal de retenção.
                    </p>
                  </Section>

                  <Section
                    id="direitos"
                    title="8. Seus direitos (Art. 18 da LGPD)"
                  >
                    <p>Como titular de dados, você tem direito a:</p>
                    <ul className="mt-2 list-disc space-y-1.5 pl-5">
                      <li>
                        Confirmar a existência de tratamento dos seus dados.
                      </li>
                      <li>Acessar seus dados pessoais.</li>
                      <li>
                        Corrigir dados incompletos, inexatos ou desatualizados.
                      </li>
                      <li>
                        Solicitar anonimização, bloqueio ou eliminação de dados
                        desnecessários.
                      </li>
                      <li>Revogar o consentimento a qualquer momento.</li>
                      <li>
                        Solicitar a portabilidade dos seus dados para outro
                        fornecedor.
                      </li>
                    </ul>
                    <p className="mt-3">
                      Para exercer seus direitos, entre em contato pelo{" "}
                      {SUPPORT_EMAIL ? (
                        <a
                          href={SUPPORT_HREF}
                          className="text-text decoration-accent hover:text-text-muted font-medium underline underline-offset-2 transition-colors"
                        >
                          e-mail de suporte
                        </a>
                      ) : (
                        "e-mail de suporte"
                      )}{" "}
                      disponível na plataforma.
                    </p>
                  </Section>

                  <Section id="seguranca" title="9. Segurança">
                    <p>
                      Adotamos medidas técnicas de segurança, incluindo cookies{" "}
                      <strong>httpOnly</strong> e <strong>Secure</strong> para
                      tokens de autenticação, comunicação via HTTPS e separação
                      de dados entre ambiente de produção e desenvolvimento.
                    </p>
                  </Section>

                  <Section
                    id="alteracoes"
                    title="10. Alterações nesta política"
                  >
                    <p>
                      Esta política pode ser atualizada periodicamente.
                      Alterações relevantes serão comunicadas por e-mail ou
                      aviso na plataforma. Recomendamos revisar esta página
                      regularmente.
                    </p>
                  </Section>
                </div>
              </div>

              {/* Footer links */}
              <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                <Link
                  href="/termos-de-uso"
                  className="text-text decoration-accent hover:text-text-muted font-medium underline underline-offset-4 transition-colors"
                >
                  Termos de Uso →
                </Link>
                <Link
                  href="/"
                  className="text-text-muted hover:text-text font-medium transition-colors"
                >
                  Voltar à home
                </Link>
              </div>
            </div>
          </div>
        </main>
        <SiteFooter />
      </div>
    </ThemeProvider>
  );
}

function TableOfContents() {
  return (
    <nav aria-label="Sumário">
      <ol className="space-y-1 text-sm">
        {SECTIONS.map((section) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              className="text-text-muted hover:text-text focus-visible:ring-ink flex min-h-11 items-center rounded focus-visible:ring-2 focus-visible:outline-none"
            >
              {section.title}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-8 py-7">
      <h2 className="text-text mb-3 text-xl font-semibold">{title}</h2>
      <div className="text-text-muted max-w-[68ch] space-y-3 text-base leading-7">
        {children}
      </div>
    </section>
  );
}
