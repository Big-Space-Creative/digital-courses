"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { MdMailOutline, MdRefresh, MdCheckCircle } from "react-icons/md";
import AuthLayout from "@/components/marketing/AuthLayout";
import { toast } from "@/components/ui/Toast";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";
const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim() ?? "";
const SUPPORT_HREF = SUPPORT_EMAIL.startsWith("mailto:")
  ? SUPPORT_EMAIL
  : `mailto:${SUPPORT_EMAIL}`;

// Texto INK fixo sobre laranja (~5,9:1). Migrar para --on-accent na Fase 0.
const CTA_CLASS =
  "flex h-14 w-full items-center justify-center gap-2 rounded-full bg-accent px-6 text-sm font-semibold text-[#1d1e1f] shadow-lg transition-transform duration-150 ease-out hover:-translate-y-0.5 motion-reduce:hover:translate-y-0 focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-60";
const LINK_CLASS =
  "text-ink decoration-accent hover:text-ink/70 rounded font-medium underline underline-offset-4 transition-colors focus-visible:ring-2 focus-visible:ring-ink focus-visible:outline-none";

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
  const [errorMessage, setErrorMessage] = useState("");

  const handleResend = async () => {
    if (!email || loading || sent) return;
    setLoading(true);
    setErrorMessage("");
    try {
      const res = await callResend(email);
      if (res.success) {
        setSent(true);
        toast("E-mail reenviado!", {
          description: "Verifique sua caixa de entrada e spam.",
          variant: "success",
        });
        return;
      }
      setErrorMessage(res.message || "Não conseguimos reenviar agora.");
      toast("Erro ao reenviar", {
        description: res.message,
        variant: "error",
      });
    } catch {
      setErrorMessage("Sem conexão no momento. Tente novamente em instantes.");
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
            Quase lá! Confirme seu e-mail
          </h1>
          <p className="text-ink/70 text-sm leading-relaxed">
            {email
              ? "Enviamos um link de confirmação para:"
              : "Enviamos um link de confirmação para o seu e-mail de cadastro."}
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
        <p className="text-ink/70 mt-4 text-xs">
          O link expira em <strong className="text-ink">24 horas</strong>.
        </p>
      </div>

      {!email ? (
        <p className="text-ink/70 text-sm leading-relaxed">
          Não encontramos o e-mail deste cadastro, então não dá para reenviar o
          link daqui. Entre na plataforma para continuar ou fale com o suporte.
        </p>
      ) : sent ? (
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
          disabled={loading}
          className={CTA_CLASS}
        >
          <MdRefresh
            className={loading ? "animate-spin motion-reduce:animate-none" : ""}
            aria-hidden="true"
          />
          {loading
            ? "Enviando..."
            : errorMessage
              ? "Tentar novamente"
              : "Reenviar e-mail de verificação"}
        </button>
      )}

      {errorMessage && (
        <div
          role="alert"
          className="border-ink/15 text-ink rounded-bento-sm border bg-red-500/10 px-4 py-3 text-sm leading-relaxed"
        >
          {errorMessage}
        </div>
      )}

      <div className="flex flex-col items-start gap-3 text-sm">
        {SUPPORT_EMAIL && (
          <a href={SUPPORT_HREF} className={LINK_CLASS}>
            Não recebeu? Fale com o suporte
          </a>
        )}
        <Link href="/login" className={LINK_CLASS}>
          Já confirmou? Entrar na plataforma →
        </Link>
      </div>
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
