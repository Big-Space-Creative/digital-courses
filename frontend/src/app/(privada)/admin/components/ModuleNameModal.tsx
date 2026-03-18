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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="mt-1 text-sm text-gray-500">{description}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="Fechar modal"
          >
            <MdClose size={20} />
          </button>
        </div>

        <form onSubmit={onSubmit}>
          <label className="block text-xs font-semibold tracking-wide text-gray-500 uppercase">
            {inputLabel}
            <input
              value={value}
              onChange={(event) => onChange(event.target.value)}
              placeholder={inputPlaceholder}
              className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm font-normal text-gray-700 outline-none focus:border-orange-300"
              autoFocus
            />
          </label>

          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-primary hover:bg-primary-dark rounded-lg px-4 py-2 text-sm font-semibold text-white"
            >
              {confirmLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
