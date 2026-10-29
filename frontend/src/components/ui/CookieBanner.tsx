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
      className={`fixed right-0 bottom-0 left-0 z-50 p-4 transition-[transform,opacity] duration-300 ease-out motion-reduce:translate-y-0 motion-reduce:transition-opacity sm:right-auto sm:bottom-4 sm:left-4 sm:max-w-md ${
        animating ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      }`}
    >
      <div className="glass-strong border-ink/10 rounded-bento-md relative overflow-hidden border shadow-[0_18px_48px_-16px_rgba(29,30,31,0.4)]">
        <div className="p-5">
          {/* Botão fechar */}
          <button
            type="button"
            onClick={() => dismiss("declined")}
            className="text-ink/60 hover:bg-ink/8 hover:text-ink focus-visible:ring-accent absolute top-3 right-3 rounded-full p-1.5 transition-colors focus-visible:ring-2 focus-visible:outline-none"
            aria-label="Fechar aviso de cookies"
          >
            <MdClose size={16} aria-hidden="true" />
          </button>

          {/* Cabeçalho */}
          <div className="mb-3 flex items-center gap-3 pr-8">
            <span className="bg-accent/10 text-accent flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
              <MdCookie size={20} aria-hidden="true" />
            </span>
            <div>
              <p className="text-ink text-sm font-semibold">
                Sua privacidade importa
              </p>
              <p className="text-ink/60 text-xs">Aviso de cookies — LGPD</p>
            </div>
          </div>

          {/* Texto */}
          <p className="text-ink/80 mb-2 text-xs leading-relaxed">
            Utilizamos{" "}
            <strong className="text-ink font-semibold">
              cookies essenciais
            </strong>{" "}
            para seu login e navegação — sem eles a plataforma não funciona. Com
            sua permissão, também usamos cookies para melhorar a experiência de
            uso.
          </p>
          <p className="text-ink/60 mb-4 text-xs">
            Saiba mais em nossa{" "}
            <Link
              href="/politica-de-privacidade"
              className="text-ink decoration-accent hover:text-accent underline underline-offset-2 transition-colors"
            >
              Política de Privacidade
            </Link>{" "}
            e{" "}
            <Link
              href="/termos-de-uso"
              className="text-ink decoration-accent hover:text-accent underline underline-offset-2 transition-colors"
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
              className="gradient-animate focus-visible:ring-accent flex-1 rounded-full px-4 py-2.5 text-xs font-medium text-white transition-transform duration-150 ease-out hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
              style={{ backgroundImage: "var(--gradient-pulse)" }}
            >
              Aceitar cookies
            </button>
            <button
              type="button"
              onClick={() => dismiss("declined")}
              className="border-ink/20 text-ink hover:bg-ink/5 focus-visible:ring-accent flex-1 rounded-full border px-4 py-2.5 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              Somente essenciais
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
