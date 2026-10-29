"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { DataList } from "@/components/ui/DataList";
import { Tabs } from "@/components/ui/Tabs";
import { toast } from "@/components/ui/Toast";

type ExampleRow = {
  id: number;
  nome: string;
  status: "success" | "neutral";
  statusLabel: string;
};

// Registros ilustrativos para o layout. Não são dados reais de alunos ou cursos.
const EXAMPLE_ROWS: ExampleRow[] = [
  {
    id: 1,
    nome: "Registro de exemplo A",
    status: "success",
    statusLabel: "Publicado",
  },
  {
    id: 2,
    nome: "Registro de exemplo B",
    status: "neutral",
    statusLabel: "Rascunho",
  },
  {
    id: 3,
    nome: "Registro de exemplo C",
    status: "success",
    statusLabel: "Publicado",
  },
];

export function TabsDemo() {
  const [value, setValue] = useState("visao");

  return (
    <div className="flex flex-col gap-4">
      <Tabs
        label="Exemplo de abas"
        value={value}
        onValueChange={setValue}
        items={[
          {
            value: "visao",
            label: "Visão geral",
            content: (
              <p className="text-text-muted py-4 text-sm">
                Conteúdo da primeira aba. Use setas, Home e End para navegar.
              </p>
            ),
          },
          {
            value: "acoes",
            label: "Ações",
            content: (
              <p className="text-text-muted py-4 text-sm">
                Conteúdo da segunda aba.
              </p>
            ),
          },
          {
            value: "bloqueada",
            label: "Indisponível",
            disabled: true,
            content: null,
          },
        ]}
        className="bg-panel border-border rounded-[var(--radius-panel)] border p-4"
      />
      <p className="text-text-muted text-sm">
        Abas controladas ou não controladas. Cada value é único e precisa ter ao
        menos uma aba habilitada.
      </p>
    </div>
  );
}

export function DataListDemo() {
  return (
    <div className="flex flex-col gap-4">
      <DataList<ExampleRow>
        label="Lista de exemplo"
        items={EXAMPLE_ROWS}
        getKey={(row) => row.id}
        getItemLabel={(row) => row.nome}
        columns={[
          {
            key: "nome",
            label: "Nome",
            render: (row) => <span className="font-medium">{row.nome}</span>,
          },
          {
            key: "status",
            label: "Status",
            render: (row) => (
              <Badge variant={row.status}>{row.statusLabel}</Badge>
            ),
          },
        ]}
        actions={[
          {
            label: "Ver detalhes",
            onClick: (row) =>
              toast("Detalhes de exemplo", {
                description: `${row.nome} é um registro ilustrativo.`,
                variant: "info",
              }),
          },
          {
            label: "Remover",
            danger: true,
            disabled: (row) => row.id === 2,
            onClick: () =>
              toast("Remoção de exemplo", {
                description: "Nenhum registro foi removido.",
              }),
          },
        ]}
      />
      <p className="text-text-muted text-sm">
        Tabela no desktop e linhas com rótulos abaixo de 768px. O menu Ações usa
        details nativo com alvos de 44px. A primeira coluna identifica o
        registro. Ações desabilitadas aparecem com o estado correspondente.
      </p>
    </div>
  );
}
