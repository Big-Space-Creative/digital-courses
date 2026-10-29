import { PageHeader } from "@/components/ui/PageHeader";
import ThemeProvider from "@/components/marketing/ThemeProvider";
import ThemeToggle from "@/components/marketing/ThemeToggle";
import Section from "./_components/Section";
import ColorTokens from "./_components/ColorTokens";
import Surfaces from "./_components/Surfaces";
import Typography from "./_components/Typography";
import Motion from "./_components/Motion";
import Buttons from "./_components/Buttons";
import FormFields from "./_components/FormFields";
import { DialogDemo, ToastDemo } from "./_components/Overlays";
import Feedback from "./_components/Feedback";
import { DataListDemo, TabsDemo } from "./_components/DataAndTabs";
import Guidelines from "./_components/Guidelines";

const SECTIONS = [
  { id: "cores", label: "Cores e temas" },
  { id: "superficies", label: "Superfícies e forma" },
  { id: "tipografia", label: "Tipografia" },
  { id: "movimento", label: "Movimento" },
  { id: "botoes", label: "Botão" },
  { id: "campos", label: "Campos" },
  { id: "sobreposicoes", label: "Diálogo e notificações" },
  { id: "feedback", label: "Estados" },
  { id: "dados", label: "Abas e listas" },
  { id: "diretrizes", label: "Diretrizes" },
];

export default function DesignSystemPage() {
  return (
    <ThemeProvider>
      <main className="bg-surface text-ink min-h-dvh">
        <div className="mx-auto flex max-w-5xl flex-col gap-8 px-6 pt-16 pb-12">
          <PageHeader
            eyebrow="Referência interna"
            title="Sistema de design Pullse"
            description="Tokens e primitivos da fundação v2, com exemplos dos componentes reais. Alterne o tema no botão ao lado para ver os dois modos."
            actions={<ThemeToggle />}
          />
          <nav aria-label="Seções desta página">
            <ul className="flex flex-wrap gap-2 text-sm">
              {SECTIONS.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="border-border text-text hover:bg-panel focus-visible:ring-ink inline-flex min-h-11 items-center rounded-[var(--radius-control)] border px-4 focus-visible:ring-2 focus-visible:outline-none"
                  >
                    {section.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <Section
          id="cores"
          title="Cores e temas"
          description="Tokens semânticos com par claro e escuro. Os valores vêm de src/app/globals.css. A coluna Amostra segue o tema ativo."
        >
          <ColorTokens />
        </Section>

        <Section
          id="superficies"
          title="Superfícies e forma"
          description="Painéis opacos com borda de 1px. Sombra alta só em sobreposições. Raios seguem a escala de controles, painéis e diálogos."
        >
          <Surfaces />
        </Section>

        <Section
          id="tipografia"
          title="Tipografia"
          description="Escala de app para telas do aluno e do admin, e escala de marketing para páginas públicas."
        >
          <Typography />
        </Section>

        <Section
          id="movimento"
          title="Movimento"
          description="Transições curtas, com transform e opacity. Respeitam prefers-reduced-motion."
        >
          <Motion />
        </Section>

        <Section
          id="botoes"
          title="Botão"
          description="Quatro variantes e três tamanhos. Todos têm alvo mínimo de 44px."
        >
          <Buttons />
        </Section>

        <Section
          id="campos"
          title="Campos"
          description="Input, Textarea, Select e Checkbox associam label, ajuda e erro automaticamente."
        >
          <FormFields />
        </Section>

        <Section
          id="sobreposicoes"
          title="Diálogo e notificações"
          description="Diálogo nativo com foco, Escape e retorno ao gatilho. Notificações no canto inferior direito."
        >
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="bg-panel border-border rounded-[var(--radius-panel)] border p-6">
              <DialogDemo />
            </div>
            <div className="bg-panel border-border rounded-[var(--radius-panel)] border p-6">
              <ToastDemo />
            </div>
          </div>
        </Section>

        <Section
          id="feedback"
          title="Estados"
          description="Badges, estados vazios, erro com nova tentativa e carregamento com skeleton."
        >
          <Feedback />
        </Section>

        <Section
          id="dados"
          title="Abas e listas"
          description="Abas acessíveis com setas e listas que viram linhas com rótulos no celular."
        >
          <div className="grid gap-8">
            <div className="bg-panel border-border rounded-[var(--radius-panel)] border p-6">
              <TabsDemo />
            </div>
            <DataListDemo />
          </div>
        </Section>

        <Section
          id="diretrizes"
          title="Diretrizes de uso"
          description="Regras que valem para todas as telas."
        >
          <Guidelines />
        </Section>
      </main>
    </ThemeProvider>
  );
}
