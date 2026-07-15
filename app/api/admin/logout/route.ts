import { NextRequest, NextResponse } from 'next/server'
import { destroySession } from '@/lib/admin-auth'

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('adminToken')?.value

    if (token) {
      destroySession(token)
    }

    const response = NextResponse.json(
      { success: true, message: 'Abmeldung erfolgreich' },
      { status: 200 }
    )

    // Clear the cookie with same path as login
    response.cookies.set('adminToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/',
    })

    return response
  } catch (error) {
    console.error('[Admin Logout Error]', error)
    return NextResponse.json(
      { error: 'Fehler beim Abmelden' },
      { status: 500 }
    )
  }
}
