import { NextRequest, NextResponse } from 'next/server'
import { sendOrderConfirmationEmail } from '@/lib/email/service'
import { getInvoices } from '@/lib/invoice-store'
import { getStoredOrders } from '@/lib/orders-store'

const resendAttempts = new Map<string, number>()
const RESEND_COOLDOWN_MS = 60_000

export async function POST(request: NextRequest) {
  const { orderNumber, email } = await request.json()
  const normalizedOrderNumber = String(orderNumber || '').trim().toLowerCase()
  const normalizedEmail = String(email || '').trim().toLowerCase()

  if (!normalizedOrderNumber || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return NextResponse.json({ error: 'Bitte geben Sie Bestellnummer und E-Mail-Adresse ein.' }, { status: 400 })
  }

  const key = `${normalizedOrderNumber}:${normalizedEmail}`
  const lastAttempt = resendAttempts.get(key) || 0
  if (Date.now() - lastAttempt < RESEND_COOLDOWN_MS) {
    return NextResponse.json({ error: 'Bitte warten Sie kurz, bevor Sie die Bestätigung erneut senden.' }, { status: 429 })
  }

  const order = getStoredOrders().find((item) => (
    item.orderNumber.toLowerCase() === normalizedOrderNumber &&
    item.email.toLowerCase() === normalizedEmail
  ))

  if (!order) {
    return NextResponse.json({ error: 'Es konnte keine passende Bestellung gefunden werden. Bitte überprüfen Sie Ihre Angaben.' }, { status: 404 })
  }

  const invoice = getInvoices().find((item) => item.orderId === order.id || item.orderNumber === order.orderNumber) || null
  const result = await sendOrderConfirmationEmail(order.email, order.orderNumber, { ...order, invoice })

  if (!result.success) {
    return NextResponse.json({ error: 'Die Bestellbestätigung konnte nicht gesendet werden. Bitte versuchen Sie es später erneut.' }, { status: 500 })
  }

  resendAttempts.set(key, Date.now())
  return NextResponse.json({ message: 'Die Bestellbestätigung wurde erneut an Ihre E-Mail-Adresse gesendet.' })
}
