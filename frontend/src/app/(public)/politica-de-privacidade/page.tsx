import type { Metadata } from "next";
import Link from "next/link";
import { MdMusicNote, MdOutlinePrivacyTip } from "react-icons/md";

export const metadata: Metadata = {
  title: "Política de Privacidade — AulasViolão",
  description:
    "Saiba como a AulasViolão coleta, usa e protege seus dados pessoais em conformidade com a LGPD (Lei nº 13.709/2018).",
};

const lastUpdated = "26 de maio de 2026";

export default function PrivacyPolicyPage() {
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
              <MdOutlinePrivacyTip size={24} />
            </span>
            <div>
              <h1 className="text-2xl font-bold text-secondary md:text-3xl">
                Política de Privacidade
              </h1>
              <p className="text-sm text-gray-500">
                Última atualização: {lastUpdated}
              </p>
            </div>
          </div>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-gray-600">
            Esta política descreve como a <strong>AulasViolão</strong> trata
            seus dados pessoais em conformidade com a{" "}
            <strong>Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018)</strong>.
          </p>
        </div>
      </div>

      {/* Content */}
      <main className="mx-auto max-w-4xl px-5 py-10">
        <div className="space-y-8">
          <Section title="1. Quem somos (Controlador de dados)">
            <p>
              A <strong>AulasViolão</strong> é a plataforma responsável pelo
              tratamento dos seus dados pessoais. Para dúvidas sobre esta
              política ou sobre o exercício dos seus direitos, entre em contato
              pelo e-mail da plataforma disponibilizado na seção de Ajuda.
            </p>
          </Section>

          <Section title="2. Quais dados coletamos">
            <ul className="list-inside list-disc space-y-1">
              <li>
                <strong>Dados de cadastro:</strong> nome completo e endereço de
                e-mail, fornecidos por você no momento do registro.
              </li>
              <li>
                <strong>Dados de acesso:</strong> tokens de autenticação (JWT)
                armazenados em cookies httpOnly seguros.
              </li>
              <li>
                <strong>Dados de uso:</strong> progresso em aulas e comentários
                enviados nas aulas (quando disponível).
              </li>
              <li>
                <strong>Dados técnicos:</strong> endereço IP e informações do
                navegador/dispositivo, coletados automaticamente para segurança
                e funcionamento.
              </li>
            </ul>
          </Section>

          <Section title="3. Para que usamos seus dados">
            <ul className="list-inside list-disc space-y-1">
              <li>Criação e gerenciamento da sua conta de aluno.</li>
              <li>
                Disponibilização do conteúdo das aulas e materiais de apoio.
              </li>
              <li>Acompanhamento do seu progresso na trilha de aprendizado.</li>
              <li>
                Envio de e-mails transacionais (confirmação de conta, redefinição de
                senha).
              </li>
              <li>Segurança, prevenção de fraudes e integridade da plataforma.</li>
            </ul>
          </Section>

          <Section title="4. Base legal para o tratamento">
            <p>
              O tratamento dos seus dados é realizado com base nas seguintes
              hipóteses previstas na LGPD:
            </p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>
                <strong>Consentimento (Art. 7º, I):</strong> para cookies não
                essenciais e comunicações de marketing.
              </li>
              <li>
                <strong>Execução de contrato (Art. 7º, V):</strong> dados
                necessários para a prestação do serviço de cursos.
              </li>
              <li>
                <strong>Legítimo interesse (Art. 7º, IX):</strong> dados
                técnicos de segurança e prevenção de abusos.
              </li>
            </ul>
          </Section>

          <Section title="5. Cookies">
            <p>Utilizamos dois tipos de cookies:</p>
            <div className="mt-3 space-y-3">
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <p className="font-semibold text-gray-800">
                  🔒 Cookies essenciais (necessários)
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  <code className="rounded bg-gray-100 px-1 text-xs">
                    access_token
                  </code>
                  ,{" "}
                  <code className="rounded bg-gray-100 px-1 text-xs">
                    refresh_token
                  </code>
                  ,{" "}
                  <code className="rounded bg-gray-100 px-1 text-xs">
                    user_role
                  </code>{" "}
                  — necessários para autenticação e navegação. Dispensam
                  consentimento por serem estritamente necessários para o
                  funcionamento do serviço.
                </p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <p className="font-semibold text-gray-800">
                  📊 Cookies analíticos (opcionais)
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  Utilizados para entender como os alunos navegam na plataforma
                  e melhorar a experiência. Exigem seu consentimento prévio,
                  concedido pelo banner de cookies.
                </p>
              </div>
            </div>
          </Section>

          <Section title="6. Compartilhamento de dados">
            <p>
              Seus dados <strong>não são vendidos</strong> a terceiros. Podemos
              compartilhá-los apenas com:
            </p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>
                Provedores de infraestrutura (servidores, armazenamento de
                arquivos) que atuam como operadores de dados sob contrato.
              </li>
              <li>
                Autoridades públicas, quando exigido por lei ou ordem judicial.
              </li>
            </ul>
          </Section>

          <Section title="7. Retenção dos dados">
            <p>
              Seus dados são mantidos enquanto sua conta estiver ativa. Caso
              solicite a exclusão, seus dados pessoais serão removidos em até{" "}
              <strong>30 dias</strong>, salvo obrigação legal de retenção.
            </p>
          </Section>

          <Section title="8. Seus direitos (Art. 18 da LGPD)">
            <p>
              Como titular de dados, você tem direito a:
            </p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>Confirmar a existência de tratamento dos seus dados.</li>
              <li>Acessar seus dados pessoais.</li>
              <li>Corrigir dados incompletos, inexatos ou desatualizados.</li>
              <li>
                Solicitar anonimização, bloqueio ou eliminação de dados
                desnecessários.
              </li>
              <li>Revogar o consentimento a qualquer momento.</li>
              <li>
                Solicitar a portabilidade dos seus dados para outro fornecedor.
              </li>
            </ul>
            <p className="mt-3">
              Para exercer seus direitos, entre em contato pelo e-mail de suporte
              disponível na plataforma.
            </p>
          </Section>

          <Section title="9. Segurança">
            <p>
              Adotamos medidas técnicas de segurança, incluindo cookies{" "}
              <strong>httpOnly</strong> e <strong>Secure</strong> para tokens de
              autenticação, comunicação via HTTPS e separação de dados entre
              ambiente de produção e desenvolvimento.
            </p>
          </Section>

          <Section title="10. Alterações nesta política">
            <p>
              Esta política pode ser atualizada periodicamente. Alterações
              relevantes serão comunicadas por e-mail ou aviso na plataforma.
              Recomendamos revisar esta página regularmente.
            </p>
          </Section>
        </div>

        {/* Footer links */}
        <div className="mt-10 flex flex-wrap gap-4 border-t border-gray-200 pt-6 text-sm">
          <Link
            href="/termos-de-uso"
            className="font-medium text-primary hover:underline"
          >
            Termos de Uso →
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
