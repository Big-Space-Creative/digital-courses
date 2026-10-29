"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { MdMailOutline, MdRefresh, MdCheckCircle } from "react-icons/md";
import AuthLayout from "@/components/marketing/AuthLayout";
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
    <AuthLayout>
      <div className="flex flex-col gap-4">
        <span className="bg-accent/10 text-accent flex h-14 w-14 items-center justify-center rounded-full">
          <MdMailOutline
            className="pulse-glow rounded-full text-3xl"
            aria-hidden="true"
          />
        </span>
        <div className="flex flex-col gap-1.5">
          <h1 className="text-ink text-3xl font-semibold tracking-[-0.01em]">
            Verifique seu e-mail
          </h1>
          <p className="text-ink/60 text-sm leading-relaxed">
            Enviamos um link de confirmação para:
          </p>
          {email && <p className="text-ink font-semibold break-all">{email}</p>}
        </div>
      </div>

      <div className="bg-surface-soft border-ink/10 rounded-bento-md border px-5 py-4">
        <ol className="text-ink/80 space-y-3 text-sm">
          <li className="flex items-center gap-3">
            <span className="bg-ink/8 text-ink flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold">
              1
            </span>
            Acesse sua caixa de entrada (ou spam)
          </li>
          <li className="flex items-center gap-3">
            <span className="bg-ink/8 text-ink flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold">
              2
            </span>
            Abra o e-mail de confirmação enviado por nós
          </li>
          <li className="flex items-center gap-3">
            <span className="bg-ink/8 text-ink flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold">
              3
            </span>
            Clique em{" "}
            <strong className="text-ink font-semibold">
              &ldquo;Confirmar e-mail&rdquo;
            </strong>
          </li>
        </ol>
        <p className="text-ink/60 mt-4 text-xs">
          O link expira em <strong className="text-ink">24 horas</strong>.
        </p>
      </div>

      {sent ? (
        <div
          role="status"
          className="bg-ink/5 text-ink flex h-14 items-center justify-center gap-2 rounded-full text-sm font-medium"
        >
          <MdCheckCircle className="text-accent text-lg" aria-hidden="true" />
          E-mail reenviado com sucesso
        </div>
      ) : (
        <button
          type="button"
          onClick={handleResend}
          disabled={loading || !email}
          className="gradient-animate focus-visible:ring-accent flex h-14 w-full items-center justify-center rounded-full text-sm font-medium text-white shadow-lg transition-transform duration-150 ease-out hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-60"
          style={{ backgroundImage: "var(--gradient-pulse)" }}
        >
          <MdRefresh
            className={`mr-2 ${loading ? "animate-spin motion-reduce:animate-none" : ""}`}
            aria-hidden="true"
          />
          {loading ? "Enviando..." : "Reenviar e-mail de verificação"}
        </button>
      )}

      <Link
        href="/login"
        className="text-accent hover:text-ink text-sm font-medium transition-colors"
      >
        Já confirmou? Entrar na plataforma →
      </Link>
    </AuthLayout>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  );
}
