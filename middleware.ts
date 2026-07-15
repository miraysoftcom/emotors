import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Allow access to /admin/login without authentication
  if (pathname === '/admin/login') {
    return NextResponse.next()
  }

  // Protect other admin routes - check for session cookie
  if (pathname.startsWith('/admin')) {
    const adminToken = request.cookies.get('adminToken')?.value

    if (!adminToken) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
