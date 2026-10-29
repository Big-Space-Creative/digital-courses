const SCALE: {
  name: string;
  spec: string;
  style: React.CSSProperties;
  sample: string;
  use: string;
}[] = [
  {
    name: "Página",
    spec: "24–28px / 32–36px, token --text-page",
    style: { fontSize: "var(--text-page)", lineHeight: "1.25" },
    sample: "Minhas aulas",
    use: "Título de página do app. Um h1 por página.",
  },
  {
    name: "Seção",
    spec: "18px / 24px, token --text-section",
    style: { fontSize: "var(--text-section)", lineHeight: "1.5" },
    sample: "Próximas atividades",
    use: "Título de bloco dentro da página.",
  },
  {
    name: "Corpo",
    spec: "14–16px / 20–24px, token --text-body",
    style: { fontSize: "var(--text-body)", lineHeight: "1.5" },
    sample: "Texto corrido para leitura e descrição de ações.",
    use: "Texto principal.",
  },
  {
    name: "Auxiliar",
    spec: "12–13px / 18px, token --text-small",
    style: { fontSize: "var(--text-small)", lineHeight: "1.4" },
    sample: "Ajuda, legenda e metadados.",
    use: "Mínimo de 12px. Use text-text-muted, sem opacity.",
  },
  {
    name: "Hero (marketing)",
    spec: "clamp(2.25rem, 1.75rem + 2.5vw, 3.75rem), entrelinha 1.08, tracking -0.03em",
    style: {
      fontSize: "var(--text-hero)",
      lineHeight: "1.08",
      letterSpacing: "-0.03em",
    },
    sample: "Aprenda violão do jeito certo",
    use: "Somente páginas de marketing.",
  },
  {
    name: "H2 (marketing)",
    spec: "clamp(1.5rem, 1.25rem + 1.2vw, 2.25rem), token --text-h2",
    style: { fontSize: "var(--text-h2)", lineHeight: "1.2" },
    sample: "Um caminho do início ao avançado",
    use: "Subtítulos de seções de marketing.",
  },
];

const WEIGHTS: { weight: number; label: string }[] = [
  { weight: 400, label: "Regular, texto corrido" },
  { weight: 500, label: "Medium, controles e ênfase leve" },
  { weight: 600, label: "Semibold, títulos" },
];

export default function Typography() {
  return (
    <div className="flex flex-col gap-10">
      <p className="text-text-muted text-sm">
        Fonte: Lexend. Pesos 400, 500 e 600. Use os tokens de tamanho em vez de
        valores fixos.
      </p>

      <div className="divide-border border-border bg-panel flex flex-col divide-y rounded-[var(--radius-panel)] border">
        {SCALE.map((item) => (
          <div
            key={item.name}
            className="grid gap-3 px-5 py-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-baseline"
          >
            <div className="flex flex-col gap-1">
              <p className="text-sm font-semibold">{item.name}</p>
              <p className="text-text-muted font-mono text-xs">{item.spec}</p>
              <p className="text-text-muted text-sm">{item.use}</p>
            </div>
            <p style={item.style} className="min-w-0 font-semibold break-words">
              {item.sample}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {WEIGHTS.map((item) => (
          <div
            key={item.weight}
            className="bg-panel border-border flex flex-col gap-2 rounded-[var(--radius-panel)] border p-4"
          >
            <p className="text-2xl" style={{ fontWeight: item.weight }}>
              Aa Bb Cc
            </p>
            <p className="text-text-muted text-sm">
              {item.weight}: {item.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
