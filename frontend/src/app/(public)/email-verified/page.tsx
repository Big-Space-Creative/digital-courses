// Server Component — processa o auto-login no servidor antes de renderizar.
// O token de uso único é trocado por JWT via Server Action, cookies são
// definidos server-side, e o usuário é redirecionado para /aluno/home.
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { MdCheckCircle, MdError, MdInfo, MdMusicNote } from "react-icons/md";

const API_BASE = process.env.API_BASE_URL ?? "http://backend:8000/api/v1/";

// ── Server Action: troca o one-time token por JWT e define os cookies ────────
async function exchangeTokenAndLogin(oneTimeToken: string) {
  "use server";

  try {
    const res = await fetch(`${API_BASE}email/token-exchange`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
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
      maxAge: 60 * 60,       // 1 hora
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
  const token  = params.token ?? "";

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
    ring: string;
    bg: string;
  };

  const configs: Record<string, UIConfig> = {
    success: {
      // token ausente ou expirado (mais de 5min após verificar o e-mail)
      icon: <MdCheckCircle className="text-4xl text-green-500" />,
      title: "E-mail verificado!",
      description:
        "Seu e-mail foi confirmado. O login automático não foi possível (link expirado). Faça login normalmente.",
      cta: { label: "Ir para o login", href: "/login" },
      ring: "ring-green-200",
      bg: "bg-green-50",
    },
    "already-verified": {
      icon: <MdInfo className="text-4xl text-blue-500" />,
      title: "Já verificado",
      description:
        "Este e-mail já havia sido confirmado anteriormente. Faça login normalmente.",
      cta: { label: "Ir para o login", href: "/login" },
      ring: "ring-blue-200",
      bg: "bg-blue-50",
    },
    invalid: {
      icon: <MdError className="text-4xl text-red-500" />,
      title: "Link inválido ou expirado",
      description:
        "O link de confirmação é inválido ou expirou (validade de 24h). Solicite um novo e-mail de verificação.",
      cta: { label: "Solicitar novo link", href: "/verify-email" },
      ring: "ring-red-200",
      bg: "bg-red-50",
    },
  };

  const cfg = configs[status] ?? configs.invalid;

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-gray-50 px-4">
      <div
        className={`w-full max-w-md rounded-2xl border border-gray-100 bg-white p-10 text-center shadow-lg ring-4 ${cfg.ring}`}
      >
        {/* Ícone */}
        <div className="mb-6 flex justify-center">
          <div className={`rounded-full p-5 ${cfg.bg}`}>{cfg.icon}</div>
        </div>

        <h1 className="mb-3 text-2xl font-bold text-gray-900">{cfg.title}</h1>
        <p className="mb-8 text-sm leading-relaxed text-gray-500">
          {cfg.description}
        </p>

        <Link
          href={cfg.cta.href}
          className="bg-primary hover:bg-primary/90 active:bg-primary/80 inline-block w-full rounded-lg py-3 text-sm font-semibold text-white transition-colors"
        >
          {cfg.cta.label}
        </Link>
      </div>

      {/* Brand */}
      <div className="mt-8 flex items-center gap-1.5 text-gray-400">
        <MdMusicNote className="text-primary size-4" />
        <span className="text-sm font-medium">Digital Courses</span>
      </div>
    </div>
  );
}
