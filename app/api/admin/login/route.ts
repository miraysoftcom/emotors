import { NextRequest, NextResponse } from 'next/server'
import {
  verifyPassword,
  isAccountLocked,
  recordFailedAttempt,
  clearFailedAttempts,
  generateSessionToken,
  createSession,
  getAdminCredentials,
  recordLoginHistory,
} from '@/lib/admin-auth'

export async function POST(request: NextRequest) {
  try {
    const { password, rememberMe } = await request.json()

    // Check if account is locked
    if (isAccountLocked('admin')) {
      return NextResponse.json(
        { error: 'Zu viele fehlgeschlagene Anmeldeversuche. Bitte versuchen Sie es später erneut.' },
        { status: 429 }
      )
    }

    // Get admin credentials
    const credentials = getAdminCredentials()

    // Check if password protection is enabled
    if (!credentials.enabled) {
      return NextResponse.json(
        { error: 'Passwortschutz ist deaktiviert.' },
        { status: 403 }
      )
    }

    // Verify password
    if (!verifyPassword(password, credentials.passwordHash)) {
      recordFailedAttempt('admin')
      recordLoginHistory(false, request.headers.get('x-forwarded-for') || undefined)
      return NextResponse.json(
        { error: 'Falsches Passwort.' },
        { status: 401 }
      )
    }

    // Clear failed attempts on successful login
    clearFailedAttempts('admin')

    // Generate session token
    const token = generateSessionToken()
    const session = createSession(token)

    // Record successful login
    recordLoginHistory(true, request.headers.get('x-forwarded-for') || undefined)

    // Create secure HTTP-only cookie
    const response = NextResponse.json(
      { success: true, message: 'Login erfolgreich' },
      { status: 200 }
    )

    response.cookies.set('adminToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60,
      path: '/',
    })

    return response
  } catch (error) {
    console.error('[Admin Login Error]', error)
    return NextResponse.json(
      { error: 'Anmeldefehler. Bitte versuchen Sie es erneut.' },
      { status: 500 }
    )
  }
}
