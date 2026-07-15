import { NextResponse } from 'next/server'
import { getStoredOrders } from '@/lib/orders-store'

export async function GET() {
  const sales = getStoredOrders()
    .slice(0, 10)
    .map((order) => ({
      customerName: order.firstName || 'Kunde',
      city: order.billingCity || 'Schweiz',
      productName: order.items?.[0]?.name || 'E-Mobility Produkt',
      createdAt: order.createdAt,
    }))

  return NextResponse.json({ sales })
}
