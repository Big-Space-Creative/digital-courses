"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { toast, type ToastVariant } from "@/components/ui/Toast";

const TOAST_VARIANTS: { variant: ToastVariant; label: string }[] = [
  { variant: "default", label: "Padrão" },
  { variant: "success", label: "Sucesso" },
  { variant: "error", label: "Erro" },
  { variant: "info", label: "Informação" },
];

const PENDING_DEMO_MS = 1500;

export function DialogDemo() {
  return (
    <div className="flex flex-col gap-8">
      <DismissibleDialogDemo />
      <NonDismissibleDialogDemo />
    </div>
  );
}

function DismissibleDialogDemo() {
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

function NonDismissibleDialogDemo() {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!pending) return;
    const timer = window.setTimeout(() => {
      setPending(false);
      setOpen(false);
      toast("Ação concluída", {
        description: "Exemplo de ação que não pode ser interrompida.",
        variant: "success",
      });
    }, PENDING_DEMO_MS);
    return () => window.clearTimeout(timer);
  }, [pending]);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Button variant="secondary" onClick={() => setOpen(true)}>
          Abrir diálogo não dispensável
        </Button>
      </div>
      <p className="text-text-muted max-w-[60ch] text-sm">
        Com dismissible=&quot;false&quot;, o × fica desabilitado e Escape não
        fecha. Use quando uma ação já foi enviada e fechar agora deixaria a
        pessoa sem saber o resultado. Enquanto pending, o diálogo bloqueia
        qualquer saída.
      </p>
      <Dialog
        open={open}
        dismissible={!pending}
        onClose={() => setOpen(false)}
        title="Confirmar envio?"
        description="Enquanto a ação roda, o diálogo não pode ser fechado."
      >
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <Button
            variant="secondary"
            disabled={pending}
            onClick={() => setOpen(false)}
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            loading={pending}
            onClick={() => setPending(true)}
          >
            Confirmar
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
