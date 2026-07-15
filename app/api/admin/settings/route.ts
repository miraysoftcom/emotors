import { NextRequest, NextResponse } from 'next/server'
import { getSession, getAdminCredentials } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('adminToken')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const session = getSession(token)
    if (!session) {
      return NextResponse.json({ error: 'Session expired' }, { status: 401 })
    }

    const credentials = getAdminCredentials()

    return NextResponse.json({
      success: true,
      enabled: credentials.enabled,
      lastChanged: new Date(credentials.lastChanged).toISOString(),
      loginHistoryCount: credentials.loginHistory.length,
    })
  } catch (error) {
    console.error('[Admin Settings Error]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get('adminToken')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const session = getSession(token)
    if (!session) {
      return NextResponse.json({ error: 'Session expired' }, { status: 401 })
    }

    const { action, newPassword, enabled } = await request.json()

    if (action === 'changePassword') {
      if (!newPassword || newPassword.length < 6) {
        return NextResponse.json(
          { error: 'Passwort muss mindestens 6 Zeichen lang sein.' },
          { status: 400 }
        )
      }

      const { updateAdminPassword } = await import('@/lib/admin-auth')
      updateAdminPassword(newPassword)

      return NextResponse.json({
        success: true,
        message: 'Passwort erfolgreich geändert.',
      })
    }

    if (action === 'toggleProtection') {
      const { togglePasswordProtection } = await import('@/lib/admin-auth')
      togglePasswordProtection(enabled)

      return NextResponse.json({
        success: true,
        message: enabled ? 'Passwortschutz aktiviert.' : 'Passwortschutz deaktiviert.',
        enabled,
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('[Admin Settings Update Error]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
