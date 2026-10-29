const RADII: { name: string; token: string; value: string; use: string }[] = [
  {
    name: "xs",
    token: "--radius-xs",
    value: "8px",
    use: "Miniaturas, amostras e elementos pequenos.",
  },
  {
    name: "control",
    token: "--radius-control",
    value: "12px",
    use: "Botões, campos, selects e badges grandes.",
  },
  {
    name: "panel",
    token: "--radius-panel",
    value: "16px",
    use: "Painéis e cards de aplicativo.",
  },
  {
    name: "dialog",
    token: "--radius-dialog",
    value: "20px",
    use: "Diálogos e cards de destaque.",
  },
  {
    name: "hero",
    token: "--radius-hero",
    value: "28px",
    use: "Máximo, somente hero e marketing.",
  },
  {
    name: "pill",
    token: "--radius-pill",
    value: "9999px",
    use: "Pílulas, avatares e CTA de marketing.",
  },
];

export default function Surfaces() {
  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-4">
        <h3 className="text-lg font-semibold">Raios</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {RADII.map((radius) => (
            <div
              key={radius.name}
              className="bg-panel border-border flex flex-col gap-3 border p-4"
            >
              <div
                className="bg-canvas h-20 w-full border-2 border-[var(--control-border)]"
                style={{ borderRadius: `var(${radius.token})` }}
              />
              <div className="text-sm">
                <p className="font-semibold">
                  {radius.name}{" "}
                  <span className="font-mono text-xs font-normal">
                    {radius.value}
                  </span>
                </p>
                <p className="text-text-muted">{radius.use}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-text-muted text-sm">
          Aposentado: raio de 40px do sistema bento. Os aliases{" "}
          <code className="font-mono text-xs">bento-sm/md/lg/xl</code> ainda
          existem para telas não migradas.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <h3 className="text-lg font-semibold">Superfícies e profundidade</h3>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="bg-canvas border-border flex flex-col gap-2 rounded-[var(--radius-panel)] border p-5">
            <p className="font-semibold">Canvas</p>
            <p className="text-text-muted text-sm">
              Fundo da página. Sem sombra. Use bg-canvas.
            </p>
          </div>
          <div className="bg-panel border-border flex flex-col gap-2 rounded-[var(--radius-panel)] border p-5 shadow-[var(--shadow-panel)]">
            <p className="font-semibold">Painel</p>
            <p className="text-text-muted text-sm">
              Borda de 1px e sombra leve de duas camadas (--shadow-panel).
            </p>
          </div>
          <div className="bg-panel-elevated border-border flex flex-col gap-2 rounded-[var(--radius-panel)] border p-5 shadow-[var(--shadow-panel)]">
            <p className="font-semibold">Painel elevado</p>
            <p className="text-text-muted text-sm">
              Mesma sombra leve, em um plano acima do painel.
            </p>
          </div>
          <div className="bg-panel-elevated border-border flex flex-col gap-2 rounded-[var(--radius-dialog)] border p-5 shadow-[var(--shadow-overlay)]">
            <p className="font-semibold">Sobreposição</p>
            <p className="text-text-muted text-sm">
              Sombra alta (--shadow-overlay). Somente em modais, popovers e
              headers.
            </p>
          </div>
          <div className="bg-media flex flex-col gap-2 rounded-[var(--radius-panel)] p-5 text-white">
            <p className="font-semibold">Mídia</p>
            <p className="text-sm">
              bg-media fica fixo nos dois temas. Use em vídeo e player.
            </p>
          </div>
          <div className="glass-header border-border flex flex-col gap-2 rounded-[var(--radius-panel)] p-5">
            <p className="font-semibold">Header de vidro</p>
            <p className="text-text-muted text-sm">
              .glass-header usa 94% de fundo e blur de 16px. Use só em headers
              fixos.
            </p>
          </div>
        </div>
        <p className="text-text-muted text-sm">
          Classes .glass, .glass-strong e .glass-accent antigas agora são
          painéis opacos. O banner de cookies também é opaco.
        </p>
      </div>
    </div>
  );
}
