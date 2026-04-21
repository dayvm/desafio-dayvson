import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 1. O Next.js vai executar essa função em todas as requisições
export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;

  // 2. Se tentar acessar a raiz, joga pro login
  if (request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 3. A Trava: Se tentar acessar algo dentro das rotas privadas E não tiver token
  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
    // Chuta o usuário de volta para o login
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 4. Regra bônus: Se já tiver token e tentar acessar o login de novo, manda pro dashboard
  if (token && request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// Opcional, mas melhora a performance: diz ao middleware para não rodar em arquivos estáticos (imagens, css, etc)
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|logos).*)'],
};