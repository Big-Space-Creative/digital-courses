"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MdCookie, MdClose } from "react-icons/md";
import { buttonClassName } from "@/components/ui/Button";

const STORAGE_KEY = "cookie_consent";

export type CookieConsent = "accepted" | "declined" | null;

/**
 * CookieBanner — LGPD compliance banner.
 * - Compact on mobile (390x844) to avoid obstructing key authentication CTAs.
 * - Side-by-side buttons on small screens, reduced padding and concise text.
 * - 44px accessible touch target on close button.
 * - Uses foundation button styles and tokens.
 */
export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as CookieConsent;
    if (!stored) {
      const t = setTimeout(() => {
        setVisible(true);
        setAnimating(true);
      }, 800);
      return () => clearTimeout(t);
    }
  }, []);

  function dismiss(choice: "accepted" | "declined") {
    localStorage.setItem(STORAGE_KEY, choice);
    setAnimating(false);
    setTimeout(() => setVisible(false), 250);
  }

  if (!visible) return null;

  return (
    <aside
      role="region"
      aria-label="Aviso de cookies e privacidade"
      className={`fixed right-3 bottom-3 left-3 z-50 transition-[transform,opacity] duration-200 ease-out motion-reduce:translate-y-0 motion-reduce:transition-none sm:right-auto sm:bottom-4 sm:left-4 sm:max-w-md ${
        animating ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      }`}
    >
      <div className="relative overflow-hidden rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--panel)] text-[var(--text)] shadow-[var(--shadow-overlay)]">
        <div className="p-3.5 sm:p-5">
          {/* Botão fechar com área de toque mínima de 44px */}
          <button
            type="button"
            onClick={() => dismiss("declined")}
            className="text-text-muted hover:text-text hover:bg-canvas focus-visible:ring-accent absolute top-1.5 right-1.5 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full transition-colors focus-visible:ring-2 focus-visible:outline-none"
            aria-label="Fechar aviso de cookies"
          >
            <MdClose size={18} aria-hidden="true" />
          </button>

          {/* Cabeçalho */}
          <div className="mb-2 flex items-center gap-2.5 pr-10">
            <span className="bg-accent/15 text-accent-text flex h-8 w-8 shrink-0 items-center justify-center rounded-full sm:h-9 sm:w-9">
              <MdCookie size={18} aria-hidden="true" />
            </span>
            <div>
              <p className="text-text text-xs font-semibold sm:text-sm">
                Privacidade e cookies
              </p>
              <p className="text-text-muted text-[11px] sm:text-xs">
                Aviso conforme a LGPD
              </p>
            </div>
          </div>

          {/* Texto conciso */}
          <p className="text-text-muted mb-3 text-xs leading-relaxed">
            Usamos cookies essenciais para seu acesso e navegação segura. Saiba
            mais em nossa{" "}
            <Link
              href="/politica-de-privacidade"
              className="text-text decoration-accent hover:text-accent-text font-medium underline underline-offset-2 transition-colors"
            >
              Política de Privacidade
            </Link>{" "}
            e{" "}
            <Link
              href="/termos-de-uso"
              className="text-text decoration-accent hover:text-accent-text font-medium underline underline-offset-2 transition-colors"
            >
              Termos de Uso
            </Link>
            .
          </p>

          {/* Ações compactas: lado a lado no mobile para economizar altura */}
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-row">
            <button
              type="button"
              onClick={() => dismiss("accepted")}
              className={buttonClassName({
                variant: "primary",
                size: "sm",
                className:
                  "flex-1 cursor-pointer rounded-full text-xs font-semibold shadow-xs",
              })}
            >
              Aceitar
            </button>
            <button
              type="button"
              onClick={() => dismiss("declined")}
              className={buttonClassName({
                variant: "secondary",
                size: "sm",
                className:
                  "flex-1 cursor-pointer rounded-full border-[var(--control-border)] text-xs font-medium",
              })}
            >
              Essenciais
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
