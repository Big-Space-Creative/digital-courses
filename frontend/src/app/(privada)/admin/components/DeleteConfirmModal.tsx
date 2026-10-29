"use client";
import { useRef } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
type Props = {
  open: boolean;
  label: string;
  onCancel: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  confirmLabel?: string;
  pending?: boolean;
};
export default function DeleteConfirmModal({
  open,
  label,
  onCancel,
  onConfirm,
  title = "Confirmar exclusão",
  description,
  confirmLabel = "Excluir",
  pending = false,
}: Props) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  return (
    <Dialog
      open={open}
      onClose={() => {
        if (!pending) onCancel();
      }}
      title={title}
      description={description ?? "Confirme a exclusão do item abaixo."}
      initialFocusRef={cancelRef}
    >
      <p className="border-border bg-canvas text-text my-4 rounded-xl border p-3 text-sm font-medium break-words">
        {label}
      </p>
      <p className="text-text-muted text-sm">
        Esta ação não pode ser desfeita.
      </p>
      <div className="mt-6 flex flex-wrap justify-end gap-2">
        <Button
          ref={cancelRef}
          variant="secondary"
          onClick={onCancel}
          disabled={pending}
        >
          Cancelar
        </Button>
        <Button variant="danger" onClick={onConfirm} loading={pending}>
          {confirmLabel}
        </Button>
      </div>
    </Dialog>
  );
}
