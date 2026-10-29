const RULES: { title: string; text: string }[] = [
  {
    title: "Tokens semânticos",
    text: "Use bg-panel, text-text-muted e border-border. Nomes antigos (surface, surface-soft, ink) acompanham o tema, mas não recebem opacity em texto novo.",
  },
  {
    title: "Texto auxiliar",
    text: "Use cor sólida (text-text-muted). Nada de text-ink/60 ou opacity em texto.",
  },
  {
    title: "Laranja",
    text: "Fundo laranja recebe texto ink. Branco não aparece sobre laranja. Laranja como texto em fundo claro usa accent-text.",
  },
  {
    title: "Superfícies escuras",
    text: "Não use bg-ink como superfície escura fixa. Para vídeo, use bg-media.",
  },
  {
    title: "Tema",
    text: "Público e aluno suportam claro e escuro pelo wrapper .theme-dark. O admin é somente claro e não recebe o wrapper escuro.",
  },
  {
    title: "Movimento",
    text: "160 a 200ms, somente transform e opacity. Com reduced motion, sem transform.",
  },
  {
    title: "Dados",
    text: "Nenhum dado fictício em tela de produto. Quando não houver API, a interface explica a ausência em vez de prometer.",
  },
  {
    title: "Navegação",
    text: "Clique que navega usa ButtonLink, uma única âncora. Nunca Button dentro de Link.",
  },
  {
    title: "Diálogo",
    text: 'Dispensável por padrão. Use dismissible="false" só enquanto uma ação está pendente.',
  },
  {
    title: "Copy",
    text: "Português com acentos. Um h1 por página.",
  },
];

const IMPORT_EXAMPLE = `import { Button } from "@/components/ui/Button";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { toast } from "@/components/ui/Toast";`;

export default function Guidelines() {
  return (
    <div className="grid gap-8 lg:grid-cols-2 [&>*]:min-w-0">
      <ul className="bg-panel border-border divide-border flex flex-col divide-y rounded-[var(--radius-panel)] border">
        {RULES.map((rule) => (
          <li key={rule.title} className="flex flex-col gap-1 px-5 py-4">
            <p className="font-semibold">{rule.title}</p>
            <p className="text-text-muted text-sm leading-relaxed">
              {rule.text}
            </p>
          </li>
        ))}
      </ul>

      <div className="flex flex-col gap-4">
        <div className="bg-panel border-border flex flex-col gap-3 rounded-[var(--radius-panel)] border p-5">
          <p className="font-semibold">Importe direto de @/components/ui</p>
          <p className="text-text-muted text-sm leading-relaxed">
            Cada primitivo tem export nomeado. Não crie variações locais de
            botão, campo ou diálogo.
          </p>
          <pre className="bg-canvas border-border overflow-x-auto rounded-[var(--radius-xs)] border p-4 font-mono text-xs leading-relaxed">
            <code>{IMPORT_EXAMPLE}</code>
          </pre>
        </div>
        <div className="bg-panel border-border flex flex-col gap-3 rounded-[var(--radius-panel)] border p-5">
          <p className="font-semibold">Compatibilidade</p>
          <p className="text-text-muted text-sm leading-relaxed">
            GradientButton continua disponível para telas antigas. Ele é um
            Button primary com type submit e sem animação contínua. O antigo
            @/components/form/Input reexporta o Input novo.
          </p>
        </div>
      </div>
    </div>
  );
}
