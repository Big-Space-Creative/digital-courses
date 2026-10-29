import Image from "next/image";
import { Badge } from "@/components/ui/Badge";

const roadmap = [
  {
    instrument: "Violão",
    status: "Disponível agora",
    available: true,
    variant: "accent" as const,
  },
  {
    instrument: "Teclado",
    status: "Em desenvolvimento",
    available: false,
    variant: "neutral" as const,
  },
  {
    instrument: "Baixo",
    status: "Em breve",
    available: false,
    variant: "neutral" as const,
  },
];

/**
 * AboutSection — Current platform instrument scope and upcoming expansion.
 * Transparent product roadmap without ungrounded promises.
 */
export default function AboutSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="relative z-10 mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
        <div className="reveal grid gap-10 md:grid-cols-[1.1fr_1fr] md:gap-14">
          <div>
            <div className="wave-reading-surface rounded-[var(--radius-panel)] p-6 sm:p-8">
              <h2 className="text-text text-[length:var(--text-h2)] font-semibold tracking-[-0.02em]">
                Hoje é violão. Amanhã, o instrumento que você quiser.
              </h2>
              <p className="text-text-muted mt-4 max-w-lg text-sm leading-relaxed md:text-base">
                A Pullse nasceu focada em violão — sem enrolação, com progressão
                real de módulo em módulo. Estamos construindo a mesma trilha
                para outros instrumentos, e quem já é assinante Premium ganha
                acesso assim que forem lançados, sem custo adicional.
              </p>
            </div>

            {/* Fotos da identidade visual (Figma: ID Visual Pullse) — fundo branco
                da fotografia mantido nos dois temas, como peça de produto. */}
            <div className="mt-6 grid grid-cols-2 gap-3 md:gap-4">
              <figure className="overflow-hidden rounded-[var(--radius-panel)] border border-[var(--border)] bg-[#FEFEFE] shadow-[var(--shadow-panel)]">
                <div className="relative aspect-[4/3]">
                  <Image
                    src="/brand/palhetas-pullse.webp"
                    alt="Palhetas pretas e laranja com o logo Pullse ao lado de uma lata personalizada"
                    fill
                    sizes="(min-width: 768px) 25vw, 50vw"
                    className="object-contain p-2"
                  />
                </div>
                <figcaption className="border-t border-black/10 px-4 py-3 text-xs font-medium text-[#1D1E1F]">
                  A marca em cada palheta
                </figcaption>
              </figure>
              <figure className="overflow-hidden rounded-[var(--radius-panel)] border border-[var(--border)] bg-[#FEFEFE] shadow-[var(--shadow-panel)]">
                <div className="relative aspect-[4/3]">
                  <Image
                    src="/brand/correia-pullse.webp"
                    alt="Correia de violão preta com o logo Pullse bordado em laranja"
                    fill
                    sizes="(min-width: 768px) 25vw, 50vw"
                    className="object-contain p-2"
                  />
                </div>
                <figcaption className="border-t border-black/10 px-4 py-3 text-xs font-medium text-[#1D1E1F]">
                  Presente nos detalhes
                </figcaption>
              </figure>
            </div>
          </div>

          <ul className="flex flex-col gap-3">
            {roadmap.map((item) => (
              <li
                key={item.instrument}
                className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--panel)] px-5 py-4 shadow-[var(--shadow-panel)]"
              >
                <span className="text-text text-sm font-semibold md:text-base">
                  {item.instrument}
                </span>
                <Badge variant={item.variant}>{item.status}</Badge>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
