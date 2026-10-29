// Server Component — processa o auto-login no servidor antes de renderizar.
// O token de uso único é trocado por JWT via Server Action, cookies são
// definidos server-side, e o usuário é redirecionado para /aluno/home.
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { MdCheckCircle, MdError, MdInfo } from "react-icons/md";
import AuthLayout from "@/components/marketing/AuthLayout";

const API_BASE = process.env.API_BASE_URL ?? "http://backend:8000/api/v1/";

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
  };

  const configs: Record<string, UIConfig> = {
    success: {
      // token ausente ou expirado (mais de 5min após verificar o e-mail)
      icon: <MdCheckCircle className="text-3xl" aria-hidden="true" />,
      title: "E-mail verificado!",
      description:
        "Seu e-mail foi confirmado. O login automático não foi possível (link expirado). Faça login normalmente.",
      cta: { label: "Ir para o login", href: "/login" },
      tile: "bg-accent/10 text-accent",
    },
    "already-verified": {
      icon: <MdInfo className="text-3xl" aria-hidden="true" />,
      title: "Já verificado",
      description:
        "Este e-mail já havia sido confirmado anteriormente. Faça login normalmente.",
      cta: { label: "Ir para o login", href: "/login" },
      tile: "bg-ink/8 text-ink",
    },
    invalid: {
      icon: <MdError className="text-3xl" aria-hidden="true" />,
      title: "Link inválido ou expirado",
      description:
        "O link de confirmação é inválido ou expirou (validade de 24h). Solicite um novo e-mail de verificação.",
      cta: { label: "Solicitar novo link", href: "/verify-email" },
      tile: "bg-red-500/10 text-red-600",
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
          <p className="text-ink/60 text-sm leading-relaxed">
            {cfg.description}
          </p>
        </div>
      </div>

      <Link
        href={cfg.cta.href}
        className="gradient-animate focus-visible:ring-accent flex h-14 w-full items-center justify-center rounded-full text-sm font-medium text-white shadow-lg transition-transform duration-150 ease-out hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-60"
        style={{ backgroundImage: "var(--gradient-pulse)" }}
      >
        {cfg.cta.label}
      </Link>
    </AuthLayout>
  );
}
