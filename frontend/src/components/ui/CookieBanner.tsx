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
      className={`fixed bottom-0 left-0 right-0 z-50 p-4 transition-all duration-300 ease-out sm:bottom-4 sm:left-4 sm:right-auto sm:max-w-md ${
        animating
          ? "translate-y-0 opacity-100"
          : "translate-y-4 opacity-0"
      }`}
    >
      <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
        {/* Faixa decorativa laranja no topo */}
        <div className="h-1 bg-gradient-to-r from-primary to-amber-400" />

        <div className="p-5">
          {/* Botão fechar */}
          <button
            type="button"
            onClick={() => dismiss("declined")}
            className="absolute right-3 top-3 rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            aria-label="Fechar aviso de cookies"
          >
            <MdClose size={16} />
          </button>

          {/* Cabeçalho */}
          <div className="mb-3 flex items-center gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-primary">
              <MdCookie size={20} />
            </span>
            <div>
              <p className="text-sm font-bold text-gray-800">
                Sua privacidade importa
              </p>
              <p className="text-xs text-gray-500">Aviso de cookies — LGPD</p>
            </div>
          </div>

          {/* Texto */}
          <p className="mb-1 text-xs leading-relaxed text-gray-600">
            Utilizamos{" "}
            <strong className="text-gray-700">cookies essenciais</strong> para
            seu login e navegação — sem eles a plataforma não funciona. Com sua
            permissão, também usamos cookies para melhorar a experiência de uso.
          </p>
          <p className="mb-4 text-xs text-gray-400">
            Saiba mais em nossa{" "}
            <Link
              href="/politica-de-privacidade"
              className="text-primary underline hover:text-primary-dark"
            >
              Política de Privacidade
            </Link>{" "}
            e{" "}
            <Link
              href="/termos-de-uso"
              className="text-primary underline hover:text-primary-dark"
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
              className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-primary-dark"
            >
              Aceitar cookies
            </button>
            <button
              type="button"
              onClick={() => dismiss("declined")}
              className="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-50"
            >
              Somente essenciais
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
