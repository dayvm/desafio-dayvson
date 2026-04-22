import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 1. Tenta pegar o cookie 'token'
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // 2. Definimos as rotas
  const isLoginPage = pathname === '/login';
  
  // 3. LÓGICA DE BLOQUEIO
  // Se não tem token e não está na página de login, expulsa para o login
  if (!token && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 4. LÓGICA DE CONFORTO
  // Se já está logado e tenta ir pro login, manda pro dashboard
  if (token && isLoginPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Se nada acima aconteceu, deixa a vida seguir
  return NextResponse.next();
}

// O Matcher garante que o middleware rode em todas as páginas importantes
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/produtos/:path*',
    '/categorias/:path*',
    '/usuarios/:path*',
    '/login'
  ],
};