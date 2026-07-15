import { NextRequest, NextResponse } from 'next/server'
import { getStoredOrders } from '@/lib/orders-store'

export async function POST(request: NextRequest) {
  const { orderNumber, email } = await request.json()
  const normalizedOrderNumber = String(orderNumber || '').trim().toLowerCase()
  const normalizedEmail = String(email || '').trim().toLowerCase()

  if (!normalizedOrderNumber || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return NextResponse.json({ error: 'Bitte geben Sie Bestellnummer und E-Mail-Adresse ein.' }, { status: 400 })
  }

  const order = getStoredOrders().find((item) => (
    item.orderNumber.toLowerCase() === normalizedOrderNumber &&
    item.email.toLowerCase() === normalizedEmail
  ))

  if (!order) {
    return NextResponse.json(
      { error: 'Es konnte keine passende Bestellung gefunden werden. Bitte überprüfen Sie Ihre Angaben.' },
      { status: 404 }
    )
  }

  return NextResponse.json({ order })
}
