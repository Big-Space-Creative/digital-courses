"use client";

import React, { useEffect, useState } from "react";
import { MdCheckCircle, MdError, MdInfo, MdClose } from "react-icons/md";

// --- Tipos ---
export type ToastVariant = "default" | "success" | "error" | "info";

export type ToastOptions = {
  description?: string;
  variant?: ToastVariant;
  duration?: number;
};

type ToastItem = {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
  duration: number;
};

// --- Lógica Singleton ---
type ToastListener = (items: ToastItem[]) => void;
const listeners = new Set<ToastListener>();
let toastItems: ToastItem[] = [];

const notify = () => listeners.forEach((l) => l([...toastItems]));

export function toast(title: string, options: ToastOptions = {}) {
  const id = Math.random().toString(36).substring(2, 9);
  const item: ToastItem = {
    id,
    title,
    description: options.description,
    variant: options.variant ?? "default",
    duration: options.duration ?? 4000,
  };

  toastItems = [...toastItems, item];
  notify();
  return { id, dismiss: () => removeToast(id) };
}

function removeToast(id: string) {
  toastItems = toastItems.filter((t) => t.id !== id);
  notify();
}

// --- Componente de Ícone ---
const ToastIcon = ({ variant }: { variant: ToastVariant }) => {
  const size = "20px";
  switch (variant) {
    case "success":
      return <MdCheckCircle size={size} className="text-emerald-700" />;
    case "error":
      return <MdError size={size} className="text-red-700" />;
    case "info":
      return <MdInfo size={size} className="text-accent-ink" />;
    default:
      return <MdInfo size={size} className="text-ink/70" />;
  }
};

// --- Componente Card (Individual) ---
function ToastCard({ item }: { item: ToastItem }) {
  const [isPaused, setIsPaused] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // Lógica de fechamento com delay para animação de saída
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => removeToast(item.id), 200); // tempo da animação de fade-out
  };

  useEffect(() => {
    if (item.duration <= 0 || isPaused) return;
    const timer = setTimeout(handleClose, item.duration);
    return () => clearTimeout(timer);
  }, [item.duration, item.id, isPaused]);

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={`group pointer-events-auto relative flex w-full max-w-sm items-start gap-3 overflow-hidden rounded-bento-md border border-ink/10 bg-surface-soft p-4 shadow-[0_16px_40px_-20px_rgba(29,30,31,0.5)] transition-[transform,opacity] duration-300 motion-reduce:transition-opacity ${isClosing ? "translate-x-6 opacity-0" : "translate-x-0 opacity-100"}`}
    >
      <div
        className={`flex size-9 items-center justify-center rounded-full ${
          item.variant === "success"
            ? "bg-emerald-100"
            : item.variant === "error"
              ? "bg-red-100"
              : item.variant === "info"
                ? "bg-accent/15"
                : "bg-ink/8"
        }`}
      >
        <ToastIcon variant={item.variant} />
      </div>

      <div className="flex flex-1 flex-col gap-1">
        <h3 className="text-sm leading-none font-semibold text-ink">
          {item.title}
        </h3>
        {item.description && (
          <p className="text-xs leading-tight text-ink/70">
            {item.description}
          </p>
        )}
      </div>

      <button
        onClick={handleClose}
        aria-label="Fechar notificação"
        className="cursor-pointer rounded-md p-1 text-ink/60 transition-colors hover:bg-ink/5 hover:text-ink focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
      >
        <MdClose size="18px" />
      </button>
    </div>
  );
}

// --- Provider ---
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => {
    const l = (next: ToastItem[]) => setItems(next);
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }, []);

  return (
    <>
      {children}
      <div role="status" aria-live="polite" className="pointer-events-none fixed top-4 right-4 z-[70] flex w-[90%] max-w-sm flex-col gap-3">
        {items.map((item) => (
          <ToastCard key={item.id} item={item} />
        ))}
      </div>
    </>
  );
}
