import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("@nextauth.token")?.value;
  const pathname = req.nextUrl.pathname;

  // Bloquear acesso à página de login caso já esteja logado
  if (pathname === "/login" && token) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Proteger rotas privadas
  const privateRoutes = ["/cronograma", "/cursos", "/usuario","/listcronograma"];
  const isPrivate = privateRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isPrivate && !token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/cronograma/:path*",
    "/cursos/:path*",
    "/usuario/:path*",
    "/listcronograma/:path*",

  ],
};
