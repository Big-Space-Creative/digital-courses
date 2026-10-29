import {
  MdAutoStories,
  MdLibraryMusic,
  MdOutlinePlayCircle,
  MdOutlineQueryStats,
  MdOutlineTimer,
  MdPictureAsPdf,
} from "react-icons/md";
import { Badge } from "@/components/ui/Badge";

const featured = {
  title: "Aulas que respeitam seu tempo",
  description:
    "Conteúdo curto, objetivo e organizado por módulo para você evoluir sem travar — sem enrolação, sem aula de uma hora para ensinar um acorde.",
  icon: MdOutlineTimer,
};

const rest = [
  {
    title: "Trilhas para cada nível",
    description:
      "Do zero ao avançado com um caminho claro, sem pular fundamentos importantes.",
    icon: MdAutoStories,
  },
  {
    title: "Material de apoio incluso",
    description: "PDFs, guias práticos e arquivos complementares em cada aula.",
    icon: MdLibraryMusic,
  },
  {
    title: "Foco em resultado real",
    description:
      "Acompanhe sua progressão e veja sua evolução em ritmo constante.",
    icon: MdOutlineQueryStats,
  },
];

/**
 * HighlightsSection with clearly identified illustrative preview.
 * Complies with Q14: no fake completion status, timestamps or synthetic user metrics.
 */
export default function HighlightsSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="relative z-10 mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
        <div className="reveal grid gap-10 md:grid-cols-[1.1fr_1fr] md:gap-12">
          {/* Featured tile with realistic UI preview */}
          <div className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--panel)] p-6 shadow-[var(--shadow-panel)] sm:p-8">
            <div className="flex items-center gap-3">
              <span className="bg-accent/15 text-accent-text inline-grid size-11 place-items-center rounded-xl">
                <featured.icon size={22} aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-text text-xl font-semibold tracking-tight md:text-2xl">
                  {featured.title}
                </h2>
                <p className="text-text-muted text-xs sm:text-sm">
                  Metodologia direta ao ponto
                </p>
              </div>
            </div>

            <p className="text-text-muted mt-4 text-sm leading-relaxed">
              {featured.description}
            </p>

            {/* UI Preview Card: Clearly marked as an illustrative example */}
            <div className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--canvas)] p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between border-b border-[var(--border)] pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-[#FF6B07]" />
                  <span className="text-text text-xs font-semibold">
                    Estrutura da trilha
                  </span>
                </div>
                <Badge variant="neutral">Exemplo ilustrativo</Badge>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--panel)] px-3 py-2 text-xs">
                  <div className="flex items-center gap-2.5">
                    <MdOutlinePlayCircle
                      className="text-accent-text size-4 shrink-0"
                      aria-hidden="true"
                    />
                    <span className="text-text font-medium">
                      Aulas práticas em vídeo por módulo
                    </span>
                  </div>
                  <span className="text-text-muted text-[11px]">Vídeo</span>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--panel)] px-3 py-2 text-xs">
                  <div className="flex items-center gap-2.5">
                    <MdLibraryMusic
                      className="text-accent-text size-4 shrink-0"
                      aria-hidden="true"
                    />
                    <span className="text-text font-medium">
                      Exercícios guiados de ritmo e dedilhado
                    </span>
                  </div>
                  <span className="text-text-muted text-[11px]">Prática</span>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--panel)] px-3 py-2 text-xs">
                  <div className="flex items-center gap-2.5">
                    <MdPictureAsPdf
                      className="text-text-muted size-4 shrink-0"
                      aria-hidden="true"
                    />
                    <span className="text-text-muted font-medium">
                      Diagramas de acordes e partituras
                    </span>
                  </div>
                  <span className="text-text-muted text-[11px]">PDF</span>
                </div>
              </div>

              <p className="text-text-muted mt-3 text-[11px] italic">
                Representação ilustrativa da organização de conteúdos na
                plataforma.
              </p>
            </div>
          </div>

          {/* Divided list of highlights */}
          <div className="wave-reading-surface divide-border flex flex-col justify-center divide-y rounded-[var(--radius-panel)] p-6 sm:p-8">
            {rest.map(({ title, description, icon: Icon }) => (
              <div key={title} className="flex gap-4 py-6 first:pt-0 last:pb-0">
                <span className="border-border bg-canvas text-accent-text mt-0.5 inline-grid size-11 shrink-0 place-items-center rounded-xl border">
                  <Icon size={20} aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-text text-base font-semibold md:text-lg">
                    {title}
                  </h3>
                  <p className="text-text-muted mt-1.5 text-sm leading-relaxed">
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
