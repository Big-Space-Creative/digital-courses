"use client";
import { type FormEvent, useState } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
type Props = {
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
  title = "Novo módulo",
  description = "Dê um nome ao módulo para organizar suas aulas.",
  inputLabel = "Nome do módulo",
  inputPlaceholder = "Ex.: Introdução e equipamento",
  confirmLabel = "Criar módulo",
}: Props) {
  const [submitted, setSubmitted] = useState(false);
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      description={description}
    >
      <form
        className="mt-5 space-y-5"
        onSubmit={(event) => {
          setSubmitted(true);
          if (!value.trim()) {
            event.preventDefault();
            return;
          }
          onSubmit(event);
          setSubmitted(false);
        }}
      >
        <Input
          label={inputLabel}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={inputPlaceholder}
          error={
            submitted && !value.trim() ? "Informe o nome do módulo." : undefined
          }
        />
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit">{confirmLabel}</Button>
        </div>
      </form>
    </Dialog>
  );
}
