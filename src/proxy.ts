import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/session-cookie";

/**
 * Checagem otimista: se nem existe cookie de sessão, evita renderizar a página.
 * A validação de verdade (sessão no banco e expiração) acontece no servidor,
 * em requireUser/getCurrentUser, e em toda rota de API.
 */
export function proxy(request: NextRequest) {
  if (request.cookies.has(SESSION_COOKIE)) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/entrar", request.url);
  loginUrl.searchParams.set("next", request.nextUrl.pathname + request.nextUrl.search);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/estante/:path*"],
};
