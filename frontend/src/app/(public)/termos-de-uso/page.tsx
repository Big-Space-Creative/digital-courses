import type { Metadata } from "next";
import Link from "next/link";
import { MdMusicNote, MdOutlineGavel } from "react-icons/md";

export const metadata: Metadata = {
  title: "Termos de Uso — AulasViolão",
  description:
    "Leia os Termos de Uso da plataforma AulasViolão antes de utilizar nossos serviços de cursos de violão online.",
};

const lastUpdated = "26 de maio de 2026";

export default function TermsOfUsePage() {
  return (
    <div className="min-h-dvh bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-4">
          <Link href="/" className="flex items-center gap-2">
            <MdMusicNote className="text-primary size-5" />
            <span className="font-bold text-gray-800">AulasViolão</span>
          </Link>
          <Link
            href="/"
            className="text-sm font-medium text-gray-500 transition-colors hover:text-primary"
          >
            ← Voltar à home
          </Link>
        </div>
      </header>

      {/* Hero */}
      <div className="border-b border-orange-100 bg-gradient-to-br from-orange-50 to-white py-10">
        <div className="mx-auto max-w-4xl px-5">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-primary">
              <MdOutlineGavel size={24} />
            </span>
            <div>
              <h1 className="text-2xl font-bold text-secondary md:text-3xl">
                Termos de Uso
              </h1>
              <p className="text-sm text-gray-500">
                Última atualização: {lastUpdated}
              </p>
            </div>
          </div>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-gray-600">
            Ao criar uma conta ou utilizar os serviços da{" "}
            <strong>AulasViolão</strong>, você concorda com os termos descritos
            abaixo. Leia com atenção antes de prosseguir.
          </p>
        </div>
      </div>

      {/* Content */}
      <main className="mx-auto max-w-4xl px-5 py-10">
        <div className="space-y-8">
          <Section title="1. Aceitação dos Termos">
            <p>
              Ao se cadastrar e utilizar a plataforma <strong>AulasViolão</strong>,
              você declara ter lido, entendido e concordado com estes Termos de
              Uso. Caso não concorde com alguma condição, não utilize a
              plataforma.
            </p>
          </Section>

          <Section title="2. Descrição do Serviço">
            <p>
              A AulasViolão é uma plataforma de ensino online de violão que
              disponibiliza aulas em vídeo, materiais de apoio e acompanhamento
              de progresso para seus alunos cadastrados. O acesso ao conteúdo
              está sujeito às condições descritas nestes termos e ao plano de
              assinatura do usuário.
            </p>
          </Section>

          <Section title="3. Cadastro e Conta">
            <ul className="list-inside list-disc space-y-1">
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
                A plataforma pode suspender ou encerrar contas que violem estes
                termos.
              </li>
            </ul>
          </Section>

          <Section title="4. Uso Permitido">
            <p>
              Você pode utilizar a plataforma exclusivamente para fins
              educacionais pessoais. É <strong>expressamente proibido</strong>:
            </p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>
                Reproduzir, distribuir, vender ou compartilhar o conteúdo das
                aulas sem autorização prévia.
              </li>
              <li>
                Utilizar meios automatizados para acessar ou extrair conteúdo da
                plataforma.
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
              Todo o conteúdo disponibilizado na AulasViolão — incluindo vídeos,
              textos, imagens, materiais de apoio e a estrutura da plataforma —
              é de propriedade exclusiva da AulasViolão ou de seus licenciantes,
              protegido pelas leis de direito autoral e propriedade intelectual
              aplicáveis.
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
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>
                <strong>Plano Gratuito (Free):</strong> acesso apenas às aulas
                marcadas como "free preview".
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
                className="text-primary underline hover:text-primary-dark"
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
              Reservamo-nos o direito de alterar estes Termos de Uso a qualquer
              momento. Alterações relevantes serão comunicadas por e-mail ou
              aviso na plataforma com antecedência razoável. O uso continuado da
              plataforma após as alterações implica a aceitação dos novos termos.
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
        <div className="mt-10 flex flex-wrap gap-4 border-t border-gray-200 pt-6 text-sm">
          <Link
            href="/politica-de-privacidade"
            className="font-medium text-primary hover:underline"
          >
            Política de Privacidade →
          </Link>
          <Link
            href="/"
            className="font-medium text-gray-500 hover:text-primary"
          >
            Voltar à home
          </Link>
        </div>
      </main>
    </div>
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
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-3 text-base font-bold text-secondary">{title}</h2>
      <div className="text-sm leading-relaxed text-gray-600">{children}</div>
    </section>
  );
}
