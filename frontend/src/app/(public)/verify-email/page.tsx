"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { MdMailOutline, MdMusicNote, MdRefresh, MdCheckCircle } from "react-icons/md";
import { toast } from "@/components/ui/Toast";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

async function callResend(email: string) {
  const res = await fetch(`${API_BASE}/email/resend`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ email }),
  });
  return res.json() as Promise<{ success: boolean; message: string }>;
}

function VerifyEmailContent() {
  const params = useSearchParams();
  const email = params.get("email") ?? "";

  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleResend = async () => {
    if (!email || loading || sent) return;
    setLoading(true);
    try {
      const res = await callResend(email);
      setSent(true);
      toast(res.success ? "E-mail reenviado!" : "Erro ao reenviar", {
        description: res.success
          ? "Verifique sua caixa de entrada e spam."
          : res.message,
        variant: res.success ? "success" : "error",
      });
    } catch {
      toast("Erro de conexão", {
        description: "Tente novamente em instantes.",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-gray-50 px-4">
      {/* Card */}
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-lg">
        {/* Ícone animado */}
        <div className="mb-6 flex justify-center">
          <div className="relative flex h-20 w-20 items-center justify-center">
            {/* Pulso de fundo */}
            <span className="absolute inset-0 animate-ping rounded-full bg-blue-100 opacity-75" />
            <div className="relative rounded-full bg-blue-50 p-4">
              <MdMailOutline className="text-primary text-4xl" />
            </div>
          </div>
        </div>

        <h1 className="mb-2 text-2xl font-bold text-gray-900">
          Verifique seu e-mail
        </h1>
        <p className="mb-1 text-sm text-gray-500">Enviamos um link de confirmação para:</p>
        {email && (
          <p className="mb-6 break-all font-semibold text-gray-800">{email}</p>
        )}

        {/* Passos */}
        <div className="mb-8 rounded-xl bg-gray-50 px-5 py-4 text-left">
          <ol className="space-y-2 text-sm text-gray-600">
            <li className="flex items-center gap-2">
              <span className="bg-primary flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white">
                1
              </span>
              Acesse sua caixa de entrada (ou spam)
            </li>
            <li className="flex items-center gap-2">
              <span className="bg-primary flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white">
                2
              </span>
              Abra o e-mail de confirmação enviado por nós
            </li>
            <li className="flex items-center gap-2">
              <span className="bg-primary flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white">
                3
              </span>
              Clique em <strong className="text-gray-800">"Confirmar e-mail"</strong>
            </li>
          </ol>
          <p className="mt-3 text-xs text-gray-400">
            O link expira em <strong>24 horas</strong>.
          </p>
        </div>

        {/* Botão reenvio */}
        {sent ? (
          <div className="flex items-center justify-center gap-2 rounded-lg bg-green-50 py-3 text-sm font-medium text-green-700">
            <MdCheckCircle className="text-lg" />
            E-mail reenviado com sucesso
          </div>
        ) : (
          <button
            onClick={handleResend}
            disabled={loading || !email}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 active:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <MdRefresh className={loading ? "animate-spin" : ""} />
            {loading ? "Enviando..." : "Reenviar e-mail de verificação"}
          </button>
        )}

        {/* Já verificou? */}
        <div className="mt-5 border-t border-gray-100 pt-5">
          <Link
            href="/login"
            className="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
          >
            Já confirmou? Entrar na plataforma →
          </Link>
        </div>
      </div>

      {/* Brand */}
      <div className="mt-8 flex items-center gap-1.5 text-gray-400">
        <MdMusicNote className="text-primary size-4" />
        <span className="text-sm font-medium">Digital Courses</span>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  );
}
