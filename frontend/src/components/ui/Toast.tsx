"use client";
import {
  ReactNode,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { Button } from "./Button";
export type ToastVariant = "default" | "success" | "error" | "info";
export type ToastOptions = {
  description?: string;
  variant?: ToastVariant;
  duration?: number;
};
type ToastItem = ToastOptions & { id: string; title: string; duration: number };
const listeners = new Set<() => void>();
const empty: ToastItem[] = [];
let items: ToastItem[] = [];
function notify() {
  listeners.forEach((listener) => listener());
}
function dismiss(id: string) {
  items = items.filter((item) => item.id !== id);
  notify();
}
export function toast(title: string, options: ToastOptions = {}) {
  const id = crypto.randomUUID();
  items = [
    ...items,
    { ...options, id, title, duration: options.duration ?? 4000 },
  ].slice(-3);
  notify();
  return { id, dismiss: () => dismiss(id) };
}
function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
function ToastCard({ item }: { item: ToastItem }) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const remaining = useRef(item.duration);
  useEffect(() => {
    if (hovered || focused || item.duration <= 0) return;
    const started = Date.now();
    const timer = setTimeout(() => dismiss(item.id), remaining.current);
    return () => {
      clearTimeout(timer);
      remaining.current = Math.max(
        0,
        remaining.current - (Date.now() - started),
      );
    };
  }, [hovered, focused, item.id, item.duration]);
  return (
    <div
      className="ui-toast"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget))
          setFocused(false);
      }}
    >
      <div
        role={item.variant === "error" ? "alert" : "status"}
        className="min-w-0 flex-1"
      >
        <p className="font-medium">{item.title}</p>
        {item.description && <p className="ui-help mt-1">{item.description}</p>}
      </div>
      <Button
        variant="ghost"
        aria-label="Fechar notificação"
        onClick={() => dismiss(item.id)}
      >
        ×
      </Button>
    </div>
  );
}
export function ToastProvider({ children }: { children: ReactNode }) {
  const current = useSyncExternalStore(
    subscribe,
    () => items,
    () => empty,
  );
  return (
    <>
      {children}
      <div className="ui-toasts" role="region" aria-label="Notificações">
        {current.map((item) => (
          <ToastCard key={item.id} item={item} />
        ))}
      </div>
    </>
  );
}
