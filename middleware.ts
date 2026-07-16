import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Allow access to /admin/login without authentication
  if (pathname === '/admin/login') {
    return NextResponse.next()
  }

  // Login must stay public; otherwise an unauthenticated admin can never create
  // the first session. The login slider GET is also public because it renders
  // the login screen before a session exists. Mutations remain protected below.
  if (pathname === '/api/admin/login') {
    return NextResponse.next()
  }

  if (pathname === '/api/admin/login-slider' && request.method === 'GET') {
    return NextResponse.next()
  }

  // Protect admin pages and admin API routes from unauthenticated browser access.
  // API handlers still validate the session token server-side.
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    const adminToken = request.cookies.get('adminToken')?.value

    if (!adminToken) {
      if (pathname.startsWith('/api/admin')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
