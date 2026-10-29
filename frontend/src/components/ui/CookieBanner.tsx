"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MdCookie, MdClose } from "react-icons/md";

const STORAGE_KEY = "cookie_consent";

export type CookieConsent = "accepted" | "declined" | null;

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as CookieConsent;
    if (!stored) {
      // Pequeno delay para não travar a primeira renderização
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
    setTimeout(() => setVisible(false), 350);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="Consentimento de cookies"
      className={`fixed right-3 bottom-3 left-3 z-50 transition-[transform,opacity] duration-300 ease-out motion-reduce:translate-y-0 motion-reduce:transition-opacity sm:right-auto sm:bottom-4 sm:left-4 sm:max-w-md ${
        animating ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      }`}
    >
      <div className="relative overflow-hidden rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--panel)] text-[var(--text)] shadow-[var(--shadow-overlay)]">
        <div className="p-4 sm:p-5">
          {/* Botão fechar com área de toque de 44px */}
          <button
            type="button"
            onClick={() => dismiss("declined")}
            className="text-text-muted hover:text-text hover:bg-canvas focus-visible:ring-accent absolute top-2.5 right-2.5 flex h-11 w-11 items-center justify-center rounded-full transition-colors focus-visible:ring-2 focus-visible:outline-none"
            aria-label="Fechar aviso de cookies"
          >
            <MdClose size={18} aria-hidden="true" />
          </button>

          {/* Cabeçalho */}
          <div className="mb-2.5 flex items-center gap-3 pr-10">
            <span className="bg-accent/15 text-accent-text flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
              <MdCookie size={20} aria-hidden="true" />
            </span>
            <div>
              <p className="text-text text-sm font-semibold">
                Sua privacidade importa
              </p>
              <p className="text-text-muted text-xs">Aviso de cookies — LGPD</p>
            </div>
          </div>

          {/* Texto */}
          <p className="text-text-muted mb-2 text-xs leading-relaxed">
            Utilizamos{" "}
            <strong className="text-text font-semibold">
              cookies essenciais
            </strong>{" "}
            para seu login e navegação — sem eles a plataforma não funciona. Com
            sua permissão, também usamos cookies analíticos para melhorar a
            experiência de uso.
          </p>
          <p className="text-text-muted mb-4 text-xs">
            Saiba mais em nossa{" "}
            <Link
              href="/politica-de-privacidade"
              className="text-text decoration-accent hover:text-accent-text underline underline-offset-2 transition-colors"
            >
              Política de Privacidade
            </Link>{" "}
            e{" "}
            <Link
              href="/termos-de-uso"
              className="text-text decoration-accent hover:text-accent-text underline underline-offset-2 transition-colors"
            >
              Termos de Uso
            </Link>
            .
          </p>

          {/* Ações */}
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => dismiss("accepted")}
              className="focus-visible:ring-accent flex min-h-[44px] flex-1 items-center justify-center rounded-full bg-[#FF6B07] px-4 py-2.5 text-xs font-semibold text-[var(--on-accent)] transition-transform duration-150 ease-out hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              Aceitar cookies
            </button>
            <button
              type="button"
              onClick={() => dismiss("declined")}
              className="border-control-border text-text hover:bg-canvas focus-visible:ring-accent flex min-h-[44px] flex-1 items-center justify-center rounded-full border bg-[var(--panel)] px-4 py-2.5 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              Somente essenciais
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
