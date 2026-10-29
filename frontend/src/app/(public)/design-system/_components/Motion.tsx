const DURATIONS: { token: string; value: string; use: string }[] = [
  {
    token: "--dur-fast",
    value: "160ms",
    use: "Feedback imediato: pressionar e mudar cor.",
  },
  {
    token: "--dur-normal",
    value: "180ms",
    use: "Padrão: elevação de botões e painéis.",
  },
  {
    token: "--dur-slow",
    value: "200ms",
    use: "Entrada de conteúdo (.reveal) e painéis que abrem.",
  },
  {
    token: "--dur-pulse",
    value: "2600ms",
    use: "Brilho da marca e de ícones de destaque (pulse-glow). Nunca em CTA.",
  },
];

const RULES = [
  "Easing único: cubic-bezier(0.16, 1, 0.3, 1), token --ease-out-expo.",
  "Anime somente transform e opacity.",
  "Sem pulsação contínua em botões ou CTA.",
  "Com prefers-reduced-motion, remova o transform e mantenha o conteúdo visível.",
  "Skeleton é estático. Carregamento se comunica por texto e aria-busy, não por animação decorativa.",
];

export default function Motion() {
  return (
    <div className="flex flex-col gap-8">
      <div className="bg-panel border-border divide-border divide-y rounded-[var(--radius-panel)] border">
        {DURATIONS.map((item) => (
          <div
            key={item.token}
            className="grid gap-2 px-5 py-4 sm:grid-cols-[10rem_6rem_minmax(0,1fr)] sm:items-baseline"
          >
            <p className="font-mono text-sm">{item.token}</p>
            <p className="font-mono text-sm">{item.value}</p>
            <p className="text-text-muted text-sm">{item.use}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div
          className="bg-panel border-border flex h-24 w-full items-center justify-center rounded-[var(--radius-panel)] border p-4 text-sm font-medium transition-transform hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:w-64"
          style={{
            transitionDuration: "var(--dur-normal)",
            transitionTimingFunction: "var(--ease-out-expo)",
          }}
        >
          Passe o mouse aqui
        </div>
        <p className="text-text-muted max-w-[60ch] text-sm">
          Elevação de 2px com transform. Com reduced motion, o elemento fica
          parado e a informação continua disponível.
        </p>
      </div>

      <ul className="text-text-muted flex list-disc flex-col gap-2 pl-5 text-sm">
        {RULES.map((rule) => (
          <li key={rule}>{rule}</li>
        ))}
      </ul>
    </div>
  );
}
