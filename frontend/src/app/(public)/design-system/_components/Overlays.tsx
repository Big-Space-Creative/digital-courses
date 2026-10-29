"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { toast, type ToastVariant } from "@/components/ui/Toast";

const TOAST_VARIANTS: { variant: ToastVariant; label: string }[] = [
  { variant: "default", label: "Padrão" },
  { variant: "success", label: "Sucesso" },
  { variant: "error", label: "Erro" },
  { variant: "info", label: "Informação" },
];

export function DialogDemo() {
  const [open, setOpen] = useState(false);
  const cancelRef = useRef<HTMLButtonElement>(null);

  function handleConfirm() {
    setOpen(false);
    toast("Ação de demonstração", {
      description: "Nenhum registro foi excluído.",
      variant: "info",
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Button variant="secondary" onClick={() => setOpen(true)}>
          Abrir diálogo de exclusão
        </Button>
      </div>
      <p className="text-text-muted max-w-[60ch] text-sm">
        Foco inicial no botão Cancelar (initialFocusRef), Escape fecha, o fundo
        fica inerte e o foco volta ao gatilho. Quem controla pending e decide
        quando fechar é o chamador.
      </p>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Excluir registro de exemplo?"
        description="Esta ação é só uma demonstração. Nenhum dado é alterado."
        initialFocusRef={cancelRef}
      >
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <Button
            ref={cancelRef}
            variant="secondary"
            onClick={() => setOpen(false)}
          >
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleConfirm}>
            Excluir
          </Button>
        </div>
      </Dialog>
    </div>
  );
}

export function ToastDemo() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-3">
        {TOAST_VARIANTS.map((item) => (
          <Button
            key={item.variant}
            variant="secondary"
            onClick={() =>
              toast(`Notificação: ${item.label.toLowerCase()}`, {
                description: "Exemplo de mensagem curta.",
                variant: item.variant,
              })
            }
          >
            {item.label}
          </Button>
        ))}
      </div>
      <p className="text-text-muted max-w-[60ch] text-sm">
        Aparece no canto inferior direito, no máximo três ao mesmo tempo. Pausa
        ao passar o mouse ou focar. Erros são anunciados como alerta. Não deixe
        informação essencial só em toast.
      </p>
    </div>
  );
}
