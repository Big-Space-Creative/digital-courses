type ColorToken = {
  name: string;
  role: string;
  light: string;
  dark: string;
  /** Variável CSS usada na amostra viva, que segue o tema ativo. */
  cssVar: string;
  sampleKind: "text" | "surface" | "fixed";
};

const COLOR_TOKENS: ColorToken[] = [
  {
    name: "--canvas",
    role: "Fundo da página (bg-canvas)",
    light: "#F5F7F8",
    dark: "#141617",
    cssVar: "var(--canvas)",
    sampleKind: "surface",
  },
  {
    name: "--panel",
    role: "Cards, campos e painéis (bg-panel)",
    light: "#FEFEFE",
    dark: "#1D2022",
    cssVar: "var(--panel)",
    sampleKind: "surface",
  },
  {
    name: "--panel-elevated",
    role: "Diálogos e menus flutuantes (bg-panel-elevated)",
    light: "#FFFFFF",
    dark: "#272B2E",
    cssVar: "var(--panel-elevated)",
    sampleKind: "surface",
  },
  {
    name: "--border",
    role: "Bordas de painéis (decorativas, não identificam controles)",
    light: "#929BA1",
    dark: "#535B60",
    cssVar: "var(--border)",
    sampleKind: "surface",
  },
  {
    name: "--control-border",
    role: "Bordas de controles, mínimo 3:1",
    light: "#78838A",
    dark: "#7C878E",
    cssVar: "var(--control-border)",
    sampleKind: "surface",
  },
  {
    name: "--text",
    role: "Texto principal (text-text)",
    light: "#1D1E1F",
    dark: "#F5F7F8",
    cssVar: "var(--text)",
    sampleKind: "text",
  },
  {
    name: "--text-muted",
    role: "Texto auxiliar, cor sólida (text-text-muted)",
    light: "#535B60",
    dark: "#BAC2C7",
    cssVar: "var(--text-muted)",
    sampleKind: "text",
  },
  {
    name: "--accent-text",
    role: "Texto laranja em fundo claro ou escuro",
    light: "#582807",
    dark: "#FFAD76",
    cssVar: "var(--accent-text)",
    sampleKind: "text",
  },
  {
    name: "--success / --on-success",
    role: "Estado de sucesso",
    light: "#166534 / branco",
    dark: "#86EFAC / #10291A",
    cssVar: "var(--success)",
    sampleKind: "text",
  },
  {
    name: "--warning / --on-warning",
    role: "Estado de atenção",
    light: "#854D0E / branco",
    dark: "#FCD34D / #332604",
    cssVar: "var(--warning)",
    sampleKind: "text",
  },
  {
    name: "--danger / --on-danger",
    role: "Erro e ações destrutivas",
    light: "#B91C1C / branco",
    dark: "#FCA5A5 / #3A1111",
    cssVar: "var(--danger)",
    sampleKind: "text",
  },
];

const FIXED_TOKENS: { name: string; role: string; value: string }[] = [
  {
    name: "Laranja pulse (bg-accent)",
    role: "Fundo de CTA e destaque. Recebe texto ink, nunca branco.",
    value: "#FF6B07",
  },
  {
    name: "--on-accent",
    role: "Texto sobre laranja. Fixo nos dois temas.",
    value: "#1D1E1F",
  },
  {
    name: "--media",
    role: "Fundo de vídeo e player. Fixo nos dois temas (bg-media).",
    value: "#101112",
  },
];

const CONTRAST_PAIRS: { pair: string; ratio: string; use: string }[] = [
  {
    pair: "Texto (ink) sobre laranja",
    ratio: "5,9:1",
    use: "Texto normal sobre CTA e destaque.",
  },
  {
    pair: "Accent-ink #582807 sobre laranja",
    ratio: "4,3:1",
    use: "Somente texto grande: 24px, ou 18,66px em negrito.",
  },
  {
    pair: "Branco sobre laranja",
    ratio: "2,9:1",
    use: "Proibido para texto.",
  },
  {
    pair: "Texto muted sobre painel (claro)",
    ratio: "6,9:1",
    use: "Auxiliar em cor sólida.",
  },
  {
    pair: "Texto muted sobre painel (escuro)",
    ratio: "9,1:1",
    use: "Auxiliar em cor sólida.",
  },
  {
    pair: "Accent-text sobre painel (claro)",
    ratio: "12,1:1",
    use: "Texto laranja em fundo claro.",
  },
  {
    pair: "Accent-text sobre painel (escuro)",
    ratio: "9,0:1",
    use: "Texto laranja em fundo escuro.",
  },
  {
    pair: "Control-border sobre painel (claro)",
    ratio: "3,9:1",
    use: "Borda de controle, mínimo 3:1.",
  },
  {
    pair: "Control-border sobre painel (escuro)",
    ratio: "4,5:1",
    use: "Borda de controle, mínimo 3:1.",
  },
  {
    pair: "Border sobre painel (claro)",
    ratio: "2,8:1",
    use: "Abaixo de 3:1 de propósito: borda decorativa de painel. Controles usam control-border.",
  },
];

/** Medidos na fundação v2 (WCAG 2.1). Repita a medição se alterar um valor. */
export default function ColorTokens() {
  return (
    <div className="flex flex-col gap-10">
      <div className="bg-panel border-border overflow-x-auto rounded-[var(--radius-panel)] border">
        <table className="w-full min-w-[640px] text-left text-sm">
          <caption className="sr-only">Tokens de cor claro e escuro</caption>
          <thead className="text-text-muted border-border border-b">
            <tr>
              <th scope="col" className="px-4 py-3 font-medium">
                Token
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Uso
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Claro
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Escuro
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Amostra no tema atual
              </th>
            </tr>
          </thead>
          <tbody>
            {COLOR_TOKENS.map((token) => (
              <tr
                key={token.name}
                className="border-border border-b last:border-b-0"
              >
                <th
                  scope="row"
                  className="px-4 py-3 align-top font-mono text-xs font-medium"
                >
                  {token.name}
                </th>
                <td className="text-text-muted px-4 py-3 align-top">
                  {token.role}
                </td>
                <td className="px-4 py-3 align-top">
                  <Swatch color={token.light} />
                  <span className="font-mono text-xs">{token.light}</span>
                </td>
                <td className="px-4 py-3 align-top">
                  <Swatch color={token.dark} />
                  <span className="font-mono text-xs">{token.dark}</span>
                </td>
                <td className="px-4 py-3 align-top">
                  <LiveSample token={token} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {FIXED_TOKENS.map((token) => (
          <div
            key={token.name}
            className="bg-panel border-border flex flex-col gap-3 rounded-[var(--radius-panel)] border p-4"
          >
            <div
              className="flex h-16 items-center justify-center rounded-[var(--radius-xs)] text-sm font-semibold"
              style={{ background: token.value, color: "#1D1E1F" }}
            >
              Aa
            </div>
            <div className="text-sm">
              <p className="font-semibold">{token.name}</p>
              <p className="text-text-muted">{token.role}</p>
              <p className="font-mono text-xs">{token.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Pares de contraste</h3>
        <div className="bg-panel border-border overflow-x-auto rounded-[var(--radius-panel)] border">
          <table className="w-full min-w-[560px] text-left text-sm">
            <caption className="sr-only">Razões de contraste medidas</caption>
            <thead className="text-text-muted border-border border-b">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">
                  Par
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Razão
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Uso
                </th>
              </tr>
            </thead>
            <tbody>
              {CONTRAST_PAIRS.map((row) => (
                <tr
                  key={row.pair}
                  className="border-border border-b last:border-b-0"
                >
                  <th scope="row" className="px-4 py-3 align-top font-medium">
                    {row.pair}
                  </th>
                  <td className="px-4 py-3 align-top font-mono">{row.ratio}</td>
                  <td className="text-text-muted px-4 py-3 align-top">
                    {row.use}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Swatch({ color }: { color: string }) {
  return (
    <span
      aria-hidden="true"
      className="border-border mb-1 block h-8 w-16 rounded-[var(--radius-xs)] border"
      style={{ background: color.split(" / ")[0] }}
    />
  );
}

function LiveSample({ token }: { token: ColorToken }) {
  if (token.sampleKind === "text") {
    return (
      <span className="text-sm font-semibold" style={{ color: token.cssVar }}>
        Texto de exemplo
      </span>
    );
  }

  return (
    <span
      className="text-text-muted flex h-10 w-32 items-center rounded-[var(--radius-xs)] border px-2 text-xs"
      style={{ background: token.cssVar, borderColor: "var(--border)" }}
    >
      Superfície
    </span>
  );
}
