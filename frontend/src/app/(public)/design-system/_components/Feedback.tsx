"use client";

import { useEffect, useState } from "react";
import { MdOutlineInbox } from "react-icons/md";
import { Badge } from "@/components/ui/Badge";
import { StatusPill } from "@/components/ui/StatusPill";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";

const BADGES = [
  { variant: "neutral", label: "Rascunho" },
  { variant: "success", label: "Publicado" },
  { variant: "warning", label: "Revisar" },
  { variant: "danger", label: "Com erro" },
  { variant: "accent", label: "Novo" },
] as const;

const RETRY_MS = 1500;

export default function Feedback() {
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    if (!retrying) return;
    const timer = window.setTimeout(() => setRetrying(false), RETRY_MS);
    return () => window.clearTimeout(timer);
  }, [retrying]);

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-4">
        <h3 className="text-lg font-semibold">Badge e StatusPill</h3>
        <div className="bg-panel border-border flex flex-wrap items-center gap-3 rounded-[var(--radius-panel)] border p-5">
          {BADGES.map((item) => (
            <Badge key={item.variant} variant={item.variant}>
              {item.label}
            </Badge>
          ))}
          <StatusPill variant="success">
            StatusPill, mesmo componente
          </StatusPill>
        </div>
        <p className="text-text-muted text-sm">
          O texto comunica o estado. A cor reforça, não substitui.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="bg-panel border-border rounded-[var(--radius-panel)] border">
          <EmptyState
            icon={<MdOutlineInbox size={32} />}
            title="Nenhum item por enquanto"
            description="Quando houver conteúdo, ele aparece aqui. Explique o motivo da ausência sempre que possível."
            action={<Button variant="secondary">Adicionar item</Button>}
          />
        </div>

        <div className="bg-panel border-border rounded-[var(--radius-panel)] border">
          <ErrorState
            description="Verifique sua conexão e tente de novo. Se o problema continuar, fale com o suporte."
            onRetry={() => setRetrying(true)}
            loading={retrying}
          />
        </div>
      </div>
      <p className="text-text-muted text-sm">
        EmptyState explica a ausência de dados. ErrorState separa falha de vazio
        e oferece nova tentativa. Quem controla o loading é o chamador.
      </p>

      <div className="flex flex-col gap-4">
        <h3 className="text-lg font-semibold">Skeleton</h3>
        <div
          aria-busy="true"
          className="bg-panel border-border flex flex-col gap-3 rounded-[var(--radius-panel)] border p-5"
        >
          <span className="sr-only">Carregando exemplo de conteúdo</span>
          <Skeleton className="h-24 w-full rounded-[var(--radius-xs)]" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <p className="text-text-muted text-sm">
          Marque a região pai com aria-busy e forneça texto de carregamento
          acessível. O skeleton não tem animação.
        </p>
      </div>
    </div>
  );
}
