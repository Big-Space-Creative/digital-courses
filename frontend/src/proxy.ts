import { NextResponse, type NextRequest } from "next/server";

const publicRoutes = [
  { path: "/" },
  { path: "/login", whenAuthenticated: "redirect" },
  { path: "/register", whenAuthenticated: "redirect" },
  // Fluxo de verificação de e-mail — não exige autenticação
  { path: "/verify-email" },
  { path: "/email-verified" },
];

// Roles que têm acesso à área administrativa
const ADMIN_ROLES = ["admin", "instructor"];

const REDIRECT_WHEN_NOT_AUTHENTICATED_ROUTE = "/login";
const REDIRECT_WHEN_UNAUTHORIZED_ROUTE = "/aluno/home";

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const publicRoute = publicRoutes.find((route) => route.path === path);
  const authToken = request.cookies.get("access_token")?.value;
  const userRole = request.cookies.get("user_role")?.value;

  // ── Rotas /admin — bloqueio IMEDIATO antes de qualquer renderização ──────────
  if (path.startsWith("/admin")) {
    // Não autenticado → redireciona para login
    if (!authToken) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = REDIRECT_WHEN_NOT_AUTHENTICATED_ROUTE;
      return NextResponse.redirect(redirectUrl);
    }

    // Autenticado mas sem role de admin/instructor → redireciona para home do aluno
    if (!userRole || !ADMIN_ROLES.includes(userRole)) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = REDIRECT_WHEN_UNAUTHORIZED_ROUTE;
      return NextResponse.redirect(redirectUrl);
    }

    // Role autorizada → prossegue
    return NextResponse.next();
  }
  // ─────────────────────────────────────────────────────────────────────────────

  // Cliente não autenticado tentando acessar rota pública
  if (!authToken && publicRoute) {
    return NextResponse.next();
  }

  if (!authToken && !publicRoute) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = REDIRECT_WHEN_NOT_AUTHENTICATED_ROUTE;
    return NextResponse.redirect(redirectUrl);
  }

  if (
    authToken &&
    publicRoute &&
    publicRoute.whenAuthenticated === "redirect"
  ) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/aluno/home";
    return NextResponse.redirect(redirectUrl);
  }

  if (authToken && !publicRoute) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Corresponde a todos os caminhos de solicitação, exceto:
     * 1. /api (rotas de API)
     * 2. /_next/static (arquivos estáticos)
     * 3. /_next/image (arquivos de otimização de imagem)
     * 4. /favicon.ico (ícone do navegador)
     * 5. Imagens comuns (svg, png, jpg, etc)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
