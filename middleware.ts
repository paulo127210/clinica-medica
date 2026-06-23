import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const auth = request.cookies.get('clinica_auth')
  const { pathname } = request.nextUrl

  // Rotas públicas
  if (pathname.startsWith('/login')) return NextResponse.next()
  if (pathname.startsWith('/paciente')) return NextResponse.next()
  if (pathname.startsWith('/api/paciente')) return NextResponse.next()

  // Se não autenticado, redireciona para login
  if (!auth || auth.value !== 'autenticado') {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/'],
}
