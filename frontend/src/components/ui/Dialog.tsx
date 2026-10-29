"use client";
import { ReactNode, RefObject, useEffect, useId, useRef } from "react";
import { Button } from "./Button";
export type DialogProps = {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  initialFocusRef?: RefObject<HTMLElement | null>;
  className?: string;
};
/** Native modal supplies top-layer inertness, focus trapping and Escape semantics. */
export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  initialFocusRef,
  className = "",
}: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog || !open) return;
    const trigger = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = "hidden";
    if (initialFocusRef?.current) initialFocusRef.current.focus();
    return () => {
      dialog.close();
      document.body.style.overflow = overflow;
      if (trigger?.isConnected) trigger.focus();
    };
  }, [open, initialFocusRef]);
  return (
    <dialog
      ref={ref}
      className={`ui-dialog ${className}`}
      aria-labelledby={id + "-title"}
      aria-describedby={description ? id + "-description" : undefined}
      onCancel={(event) => {
        event.preventDefault();
        closeRef.current();
      }}
    >
      <div className="ui-dialog-heading">
        <h2 id={id + "-title"}>{title}</h2>
        <Button variant="ghost" aria-label="Fechar diálogo" onClick={onClose}>
          ×
        </Button>
      </div>
      {description && (
        <p id={id + "-description"} className="ui-help">
          {description}
        </p>
      )}
      {children}
    </dialog>
  );
}
export default Dialog;
