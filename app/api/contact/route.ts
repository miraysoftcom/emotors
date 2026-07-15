import { db } from '@/lib/db'
import { contact_messages } from '@/lib/db/schema'
import { NextRequest, NextResponse } from 'next/server'
import { createCustomerRequest } from '@/lib/customer-request-store'

// Spam protection - simple rate limiting
const requestCounts = new Map<string, { count: number; resetTime: number }>()

const checkRateLimit = (ip: string): boolean => {
  const now = Date.now()
  const record = requestCounts.get(ip)

  if (!record || now > record.resetTime) {
    requestCounts.set(ip, { count: 1, resetTime: now + 60000 })
    return true
  }

  if (record.count >= 5) {
    return false
  }

  record.count++
  return true
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'

    // Rate limiting
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Zu viele Anfragen. Bitte versuchen Sie es später erneut.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const {
      vorname,
      nachname,
      firma,
      email,
      telefon,
      plz,
      ort,
      land,
      produktinteresse,
      nachricht,
      recaptchaToken,
    } = body

    // Validation
    if (!vorname?.trim() || !nachname?.trim() || !email?.trim() || !nachricht?.trim()) {
      return NextResponse.json(
        { error: 'Erforderliche Felder sind leer' },
        { status: 400 }
      )
    }

    // Email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Ungültige E-Mail' },
        { status: 400 }
      )
    }

    // Verify reCAPTCHA
    if (recaptchaToken) {
      const recaptchaResponse = await fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`,
      })

      const recaptchaData = await recaptchaResponse.json()

      if (!recaptchaData.success || recaptchaData.score < 0.5) {
        return NextResponse.json(
          { error: 'reCAPTCHA Verifikation fehlgeschlagen' },
          { status: 400 }
        )
      }
    }

    // Save to database (if DATABASE_URL is configured)
    if (process.env.DATABASE_URL) {
      try {
        await db.insert(contact_messages).values({
          vorname: vorname.trim(),
          nachname: nachname.trim(),
          firma: firma?.trim() || null,
          email: email.trim(),
          telefon: telefon?.trim() || null,
          plz: plz?.trim() || null,
          ort: ort?.trim() || null,
          land: land?.trim() || 'Schweiz',
          produktinteresse: produktinteresse || 'Allgemeine Anfrage',
          nachricht: nachricht.trim(),
          ip_address: ip,
          user_agent: request.headers.get('user-agent') || null,
        })
      } catch (dbError) {
        console.error('Database error:', dbError)
        // Continue even if database fails - return success to user
      }
    }

    createCustomerRequest({
      type: 'service',
      email: email.trim().toLowerCase(),
      name: `${vorname.trim()} ${nachname.trim()}`.trim(),
      phone: telefon?.trim() || '',
      subject: produktinteresse || 'Kontaktanfrage',
      message: nachricht.trim(),
      payload: {
        firma: firma?.trim() || '',
        plz: plz?.trim() || '',
        ort: ort?.trim() || '',
        land: land?.trim() || 'Schweiz',
        source: 'contact_form',
      },
    })

    // Send email notifications (if configured)
    // TODO: Implement with Nodemailer or SendGrid
    // await sendAdminNotification(body)
    // await sendCustomerConfirmation(email)

    return NextResponse.json(
      { success: true, message: 'Nachricht erfolgreich gesendet' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Verarbeiten der Anfrage' },
      { status: 500 }
    )
  }
}
