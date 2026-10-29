import {
  MdAutoStories,
  MdLibraryMusic,
  MdOutlineQueryStats,
  MdOutlineTimer,
} from "react-icons/md";

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
 * Deliberately asymmetric: one featured tile carries the weight, the other
 * three read as a plain divided list — not a repeating icon+heading+text
 * card grid (see impeccable's "identical card grids" ban).
 */
export default function HighlightsSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="relative z-10 mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
        <div className="reveal grid gap-10 md:grid-cols-[1fr_1fr] md:gap-14">
          <div className="rounded-bento-lg bg-surface-soft p-8 md:p-10">
            <span className="rounded-bento-sm bg-accent/10 text-accent inline-grid size-12 place-items-center">
              <featured.icon size={24} />
            </span>
            <h2 className="text-ink mt-6 text-2xl font-semibold tracking-[-0.01em] md:text-3xl">
              {featured.title}
            </h2>
            <p className="text-ink/70 mt-3 max-w-md text-sm leading-relaxed md:text-base">
              {featured.description}
            </p>
          </div>

          <div className="divide-ink/10 flex flex-col justify-center divide-y">
            {rest.map(({ title, description, icon: Icon }) => (
              <div key={title} className="flex gap-4 py-5 first:pt-0 last:pb-0">
                <span className="rounded-bento-sm bg-ink/5 text-ink/70 mt-0.5 inline-grid size-10 shrink-0 place-items-center">
                  <Icon size={18} />
                </span>
                <div>
                  <h3 className="text-ink font-semibold">{title}</h3>
                  <p className="text-ink/65 mt-1 text-sm leading-relaxed">
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
