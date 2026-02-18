import { NextResponse, type NextRequest } from "next/server";

const publicRoutes = [
  { path: "/login", whenAuthenticated: "redirect" },
  { path: "/register", whenAuthenticated: "redirect" },
];

const REDIRECT_WHEN_NOT_AUTHENTICATED_ROUTE = "/login";

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const publicRoute = publicRoutes.find((route) => route.path === path);
  const authToken = request.cookies.get("auth_Token");

  //Cliente não autenticado tentando acessar rota pública
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

    redirectUrl.pathname = "/";

    return NextResponse.redirect(redirectUrl);
  }

  if (authToken && !publicRoute) {
    //Podemos fazer uma validação para ver se o token não expirou
    //ou
    //Podemos fazer um refresh do token aqui se necessário

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
