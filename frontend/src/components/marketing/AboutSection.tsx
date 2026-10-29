
const roadmap = [
  { instrument: "Violão", status: "Disponível agora", available: true },
  { instrument: "Teclado", status: "Em desenvolvimento", available: false },
  { instrument: "Baixo", status: "Em breve", available: false },
];

/**
 * Direct answer to "is this just guitar?" before the visitor gets to pricing —
 * transparency about current scope, framed as an early-access roadmap rather
 * than a limitation.
 */
export default function AboutSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="relative z-10 mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
        <div className="reveal grid gap-10 md:grid-cols-[1.1fr_1fr] md:gap-14">
          <div>
            <h2 className="text-ink text-2xl font-semibold tracking-[-0.01em] md:text-3xl">
              Hoje é violão. Amanhã, o instrumento que você quiser.
            </h2>
            <p className="text-ink/70 mt-4 max-w-lg text-sm leading-relaxed md:text-base">
              A Pullse nasceu focada em violão — sem enrolação, com progressão
              real de módulo em módulo. Estamos construindo a mesma trilha para
              outros instrumentos, e quem já é assinante Premium ganha acesso
              assim que forem lançados, sem custo adicional.
            </p>
          </div>

          <ul className="flex flex-col gap-3">
            {roadmap.map((item) => (
              <li
                key={item.instrument}
                className="border-ink/10 flex items-center justify-between rounded-2xl border px-5 py-4"
              >
                <span className="text-ink text-sm font-semibold md:text-base">
                  {item.instrument}
                </span>
                <span
                  className={
                    item.available
                      ? "bg-accent/10 text-accent rounded-full px-3 py-1 text-xs font-medium"
                      : "bg-ink/5 text-ink/60 rounded-full px-3 py-1 text-xs font-medium"
                  }
                >
                  {item.status}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
