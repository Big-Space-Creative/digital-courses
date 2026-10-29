// Server Component — processa o auto-login no servidor antes de renderizar.
// O token de uso único é trocado por JWT via Server Action, cookies são
// definidos server-side, e o usuário é redirecionado para /aluno/home.
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { MdCheckCircle, MdError, MdInfo } from "react-icons/md";
import AuthLayout from "@/components/marketing/AuthLayout";

const API_BASE = process.env.API_BASE_URL ?? "http://backend:8000/api/v1/";
const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim() ?? "";
const SUPPORT_HREF = SUPPORT_EMAIL.startsWith("mailto:")
  ? SUPPORT_EMAIL
  : `mailto:${SUPPORT_EMAIL}`;

// Texto INK fixo sobre laranja (~5,9:1). Migrar para --on-accent na Fase 0.
const CTA_CLASS =
  "flex h-14 w-full items-center justify-center rounded-full bg-accent px-6 text-sm font-semibold text-[#1d1e1f] shadow-lg transition-transform duration-150 ease-out hover:-translate-y-0.5 motion-reduce:hover:translate-y-0 focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:outline-none";
const LINK_CLASS =
  "text-ink decoration-accent hover:text-ink/70 rounded font-medium underline underline-offset-4 transition-colors focus-visible:ring-2 focus-visible:ring-ink focus-visible:outline-none";

// ── Server Action: troca o one-time token por JWT e define os cookies ────────
async function exchangeTokenAndLogin(oneTimeToken: string) {
  "use server";

  try {
    const res = await fetch(`${API_BASE}email/token-exchange`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ token: oneTimeToken }),
      cache: "no-store",
    });

    if (!res.ok) return false;

    const data = await res.json();
    if (!data.success || !data.data?.access_token) return false;

    const cookieStore = await cookies();

    cookieStore.set("access_token", data.data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60, // 1 hora
      path: "/",
    });

    cookieStore.set("refresh_token", data.data.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 dias
      path: "/",
    });

    return true;
  } catch {
    return false;
  }
}

// ── Página (Server Component) ─────────────────────────────────────────────────
export default async function EmailVerifiedPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; token?: string }>;
}) {
  const params = await searchParams;
  const status = params.status ?? "invalid";
  const token = params.token ?? "";

  // Auto-login: se o backend enviou um token de uso único, tenta fazer login
  if (status === "success" && token) {
    const loggedIn = await exchangeTokenAndLogin(token);
    if (loggedIn) {
      // Login automático realizado — redireciona direto para a plataforma
      redirect("/aluno/home");
    }
    // Token inválido/expirado → mostra tela de erro (não redireciona)
  }

  // ── UI para casos onde o auto-login não foi possível ─────────────────────
  type UIConfig = {
    icon: React.ReactNode;
    title: string;
    description: string;
    cta: { label: string; href: string };
    tile: string;
    showSupport?: boolean;
  };

  const configs: Record<string, UIConfig> = {
    success: {
      // token ausente, inválido ou expirado no login automático
      icon: <MdCheckCircle className="text-3xl" aria-hidden="true" />,
      title: "E-mail confirmado!",
      description:
        "Seu e-mail foi confirmado. Não foi possível entrar automaticamente desta vez. Faça login normalmente para acessar suas aulas.",
      cta: { label: "Ir para o login", href: "/login" },
      tile: "bg-accent/10 text-accent",
    },
    "already-verified": {
      icon: <MdInfo className="text-3xl" aria-hidden="true" />,
      title: "Seu e-mail já estava confirmado",
      description:
        "Nada mais a fazer por aqui. Faça login para continuar de onde parou.",
      cta: { label: "Ir para o login", href: "/login" },
      tile: "bg-ink/8 text-ink",
    },
    invalid: {
      icon: <MdError className="text-3xl" aria-hidden="true" />,
      title: "Este link não funciona mais",
      description:
        "O link de confirmação é inválido ou expirou (validade de 24 horas). Solicite um novo e-mail de verificação.",
      cta: { label: "Solicitar novo link", href: "/verify-email" },
      tile: "bg-red-500/10 text-red-600",
      showSupport: true,
    },
  };

  const cfg = configs[status] ?? configs.invalid;

  return (
    <AuthLayout>
      <div className="flex flex-col gap-4">
        <span
          className={`flex h-14 w-14 items-center justify-center rounded-full ${cfg.tile}`}
        >
          {cfg.icon}
        </span>
        <div className="flex flex-col gap-1.5">
          <h1 className="text-ink text-3xl font-semibold tracking-[-0.01em]">
            {cfg.title}
          </h1>
          <p className="text-ink/70 text-sm leading-relaxed">
            {cfg.description}
          </p>
        </div>
      </div>

      <div className="flex flex-col items-start gap-4">
        <Link href={cfg.cta.href} className={CTA_CLASS}>
          {cfg.cta.label}
        </Link>
        {cfg.showSupport && SUPPORT_EMAIL && (
          <a href={SUPPORT_HREF} className={`${LINK_CLASS} text-sm`}>
            Algo não funcionou? Fale com o suporte
          </a>
        )}
      </div>
    </AuthLayout>
  );
}
