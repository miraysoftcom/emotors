import { NextRequest, NextResponse } from 'next/server'
import { getStoredOrders } from '@/lib/orders-store'

export async function GET(request: NextRequest) {
  const orderNumber = request.nextUrl.searchParams.get('orderNumber')
  const email = request.nextUrl.searchParams.get('email')
  if (!orderNumber || !email) {
    return NextResponse.json({ error: 'Bestellnummer und E-Mail-Adresse sind erforderlich.' }, { status: 400 })
  }

  const order = getStoredOrders().find((item) => (
    item.orderNumber.toLowerCase() === orderNumber.toLowerCase() &&
    item.email.toLowerCase() === email.toLowerCase()
  ))
  if (!order) {
    return NextResponse.json({ error: 'Es konnte keine passende Bestellung gefunden werden. Bitte überprüfen Sie Ihre Angaben.' }, { status: 404 })
  }

  return NextResponse.json({ order })
}
