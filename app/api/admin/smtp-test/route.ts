import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/admin-auth'
import { getShopSettings } from '@/lib/shop-settings-store'
import { sendSmtpMail } from '@/lib/email/smtp'

function assertAdmin(request: NextRequest) {
  const token = request.cookies.get('adminToken')?.value
  if (!token) return false
  return Boolean(getSession(token))
}

export async function POST(request: NextRequest) {
  if (!assertAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const to = String(body.to || '').trim()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    return NextResponse.json({ error: 'Bitte geben Sie eine gültige Test-E-Mail-Adresse ein.' }, { status: 400 })
  }

  const settings = getShopSettings().email
  if (!settings.smtpEnabled) {
    return NextResponse.json({ error: 'SMTP ist deaktiviert. Bitte aktivieren und speichern Sie SMTP zuerst.' }, { status: 400 })
  }
  if (!settings.smtpHost || !settings.fromEmail) {
    return NextResponse.json({ error: 'SMTP Host und Absender E-Mail sind erforderlich.' }, { status: 400 })
  }

  try {
    await sendSmtpMail({
      host: settings.smtpHost,
      port: settings.smtpPort,
      secure: settings.smtpSecure,
      user: settings.smtpUser,
      password: settings.smtpPassword,
      fromEmail: settings.fromEmail,
      fromName: settings.fromName,
      replyTo: settings.replyTo,
    }, {
      to,
      subject: 'MK-eMotors SMTP Test',
      text: 'Diese Testmail wurde erfolgreich über die SMTP Einstellungen im Admin Panel gesendet.',
      html: '<p>Diese Testmail wurde erfolgreich über die SMTP Einstellungen im Admin Panel gesendet.</p>',
    })
  } catch (error) {
    return NextResponse.json({
      error: `SMTP Test fehlgeschlagen: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`,
    }, { status: 500 })
  }

  return NextResponse.json({ message: `Testmail wurde an ${to} gesendet.` })
}
