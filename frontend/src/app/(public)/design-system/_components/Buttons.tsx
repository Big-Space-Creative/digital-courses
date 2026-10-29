"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { ButtonLink } from "@/components/ui/ButtonLink";

const VARIANTS = [
  {
    variant: "primary",
    use: "Ação principal de cada tela. Texto ink sobre laranja.",
  },
  { variant: "secondary", use: "Ação alternativa, como Cancelar ou Voltar." },
  { variant: "ghost", use: "Ação discreta dentro de cards e barras." },
  { variant: "danger", use: "Ação destrutiva, sempre com confirmação." },
] as const;

const SIZES = ["sm", "md", "lg"] as const;

export default function Buttons() {
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!saving) return;
    const timer = window.setTimeout(() => setSaving(false), 1500);
    return () => window.clearTimeout(timer);
  }, [saving]);

  return (
    <div className="flex flex-col gap-8">
      <div className="bg-panel border-border divide-border divide-y rounded-[var(--radius-panel)] border">
        {VARIANTS.map((item) => (
          <div
            key={item.variant}
            className="grid gap-4 px-5 py-5 md:grid-cols-[12rem_minmax(0,1fr)] md:items-center"
          >
            <div className="flex flex-col gap-1">
              <p className="font-mono text-sm">
                variant=&quot;{item.variant}&quot;
              </p>
              <p className="text-text-muted text-sm">{item.use}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {SIZES.map((size) => (
                <Button key={size} variant={item.variant} size={size}>
                  Salvar alterações
                </Button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-4">
        <h3 className="text-lg font-semibold">Estados</h3>
        <div className="bg-panel border-border flex flex-wrap items-center gap-3 rounded-[var(--radius-panel)] border p-5">
          <Button>Normal</Button>
          <Button disabled>Desabilitado</Button>
          <Button loading={saving} onClick={() => setSaving(true)}>
            Salvar alterações
          </Button>
        </div>
        <p className="text-text-muted text-sm">
          Em loading, o botão fica desabilitado, recebe aria-busy e mantém o
          texto da ação. Quem controla o estado de carregamento é o chamador. O
          exemplo acima dura 1,5 segundo.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <h3 className="text-lg font-semibold">Link com aparência de botão</h3>
        <div className="bg-panel border-border flex flex-wrap items-center gap-3 rounded-[var(--radius-panel)] border p-5">
          <ButtonLink href="#botoes">Abrir curso</ButtonLink>
          <ButtonLink href="#botoes" variant="secondary">
            Ver currículo
          </ButtonLink>
          <ButtonLink href="#botoes" variant="ghost">
            Voltar
          </ButtonLink>
        </div>
        <p className="text-text-muted text-sm">
          Use ButtonLink quando o clique navega. Ele renderiza uma única âncora
          com a mesma aparência de Button. Não coloque Button dentro de Link: o
          resultado é um botão dentro de uma âncora, com dois controles para uma
          ação. Para um link externo, como mailto:, use buttonClassName na
          própria âncora.
        </p>
      </div>
    </div>
  );
}
