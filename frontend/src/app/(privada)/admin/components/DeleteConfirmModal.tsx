type DeleteConfirmModalProps = {
  open: boolean;
  label: string;
  onCancel: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  confirmLabel?: string;
};

export default function DeleteConfirmModal({
  open,
  label,
  onCancel,
  onConfirm,
  title = "Confirmar exclusao",
  description,
  confirmLabel = "Sim, apagar",
}: DeleteConfirmModalProps) {
  if (!open) return null;

  return (
    <div className="bg-ink/40 fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-modal-title"
        className="rounded-bento-lg bg-surface-soft w-full max-w-md p-6 shadow-xl"
      >
        <h3 id="delete-modal-title" className="text-ink text-lg font-semibold">
          {title}
        </h3>
        <p className="text-ink/75 mt-2 text-sm">
          {description ?? `Tem certeza que deseja apagar ${label}?`}
        </p>
        <p className="text-ink/65 mt-1 text-xs">
          Esta acao nao pode ser desfeita.
        </p>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="border-ink/15 text-ink/80 hover:bg-ink/5 focus-visible:ring-accent rounded-full border bg-white px-5 py-2.5 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-full bg-red-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-800 focus-visible:ring-2 focus-visible:ring-red-700 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
