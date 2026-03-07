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
      return <MdCheckCircle size={size} className="text-emerald-600" />;
    case "error":
      return <MdError size={size} className="text-red-500" />;
    case "info":
      return <MdInfo size={size} className="text-primary" />;
    default:
      return <MdInfo size={size} className="text-secondary" />;
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
      className={`group pointer-events-auto relative flex w-full max-w-sm items-start gap-3 overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 p-4 shadow-[0_16px_40px_-20px_rgba(15,23,42,0.6)] backdrop-blur transition-all duration-300 ${isClosing ? "translate-x-6 opacity-0" : "translate-x-0 opacity-100"}`}
    >
      <div
        className={`absolute top-0 left-0 h-full w-1 ${
          item.variant === "success"
            ? "bg-emerald-500"
            : item.variant === "error"
              ? "bg-red-500"
              : item.variant === "info"
                ? "bg-primary"
                : "bg-secondary"
        }`}
      />

      <div
        className={`flex size-9 items-center justify-center rounded-full ${
          item.variant === "success"
            ? "bg-emerald-50"
            : item.variant === "error"
              ? "bg-red-50"
              : item.variant === "info"
                ? "bg-primary/10"
                : "bg-secondary/10"
        }`}
      >
        <ToastIcon variant={item.variant} />
      </div>

      <div className="flex flex-1 flex-col gap-1">
        <h3 className="text-sm leading-none font-semibold text-slate-900">
          {item.title}
        </h3>
        {item.description && (
          <p className="text-xs leading-tight text-slate-500">
            {item.description}
          </p>
        )}
      </div>

      <button
        onClick={handleClose}
        className="cursor-pointer rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-900"
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
      <div className="pointer-events-none fixed top-4 right-4 z-40 flex w-[90%] max-w-sm flex-col gap-3">
        {items.map((item) => (
          <ToastCard key={item.id} item={item} />
        ))}
      </div>
    </>
  );
}
