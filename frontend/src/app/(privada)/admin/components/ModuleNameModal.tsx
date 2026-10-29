import { FormEvent } from "react";
import { MdClose } from "react-icons/md";

type ModuleNameModalProps = {
  open: boolean;
  value: string;
  onChange: (value: string) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  title?: string;
  description?: string;
  inputLabel?: string;
  inputPlaceholder?: string;
  confirmLabel?: string;
};

export default function ModuleNameModal({
  open,
  value,
  onChange,
  onClose,
  onSubmit,
  title = "Novo Modulo",
  description = "Digite o nome do modulo para criar sua estrutura.",
  inputLabel = "Nome do modulo",
  inputPlaceholder = "Ex.: Introducao e Equipamento",
  confirmLabel = "Criar Modulo",
}: ModuleNameModalProps) {
  if (!open) return null;

  return (
    <div className="bg-ink/40 fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="module-modal-title"
        className="rounded-bento-lg bg-surface-soft w-full max-w-md p-6 shadow-xl"
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h3
              id="module-modal-title"
              className="text-ink text-lg font-semibold"
            >
              {title}
            </h3>
            <p className="text-ink/70 mt-1 text-sm">{description}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-ink/60 hover:bg-ink/5 hover:text-ink focus-visible:ring-accent rounded-lg p-2 focus-visible:ring-2 focus-visible:outline-none"
            aria-label="Fechar modal"
          >
            <MdClose size={20} />
          </button>
        </div>

        <form onSubmit={onSubmit}>
          <label className="text-ink/80 block text-sm font-medium">
            {inputLabel}
            <input
              value={value}
              onChange={(event) => onChange(event.target.value)}
              placeholder={inputPlaceholder}
              className="border-ink/15 text-ink placeholder:text-ink/60 focus:ring-accent rounded-bento-md mt-2 w-full border bg-white px-4 py-3 text-sm font-normal outline-none focus:border-transparent focus:ring-2"
              autoFocus
            />
          </label>

          <div className="mt-6 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="border-ink/15 text-ink/80 hover:bg-ink/5 focus-visible:ring-accent rounded-full border bg-white px-5 py-2.5 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-accent text-accent-ink hover:bg-accent-500 focus-visible:ring-accent rounded-full px-5 py-2.5 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              {confirmLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
