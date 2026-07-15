import { NextRequest, NextResponse } from 'next/server'
import { getCustomerOrders } from '@/lib/customer-account-store'

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function inferVehicleType(name: string) {
  const text = name.toLowerCase()
  if (text.includes('moped') || text.includes('roller')) return 'E-Moped'
  if (text.includes('motorrad') || text.includes('motorcycle')) return 'E-Motorrad'
  if (text.includes('bike') || text.includes('velo')) return 'E-Bike'
  return 'E-Scooter'
}

export async function GET(request: NextRequest) {
  const email = String(request.nextUrl.searchParams.get('email') || '').trim().toLowerCase()
  if (!isValidEmail(email)) {
    return NextResponse.json({ vehicles: [] })
  }

  const vehicles = getCustomerOrders(email)
    .filter((order) => !['Storniert', 'Rückerstattet'].includes(order.status))
    .flatMap((order) => (order.items || []).map((item) => ({
      label: item.name,
      productId: item.productId,
      orderNumber: order.orderNumber,
      vehicleType: inferVehicleType(item.name),
      purchasedAt: order.createdAt,
    })))
    .filter((item) => item.label)

  const unique = Array.from(
    new Map(vehicles.map((item) => [`${item.orderNumber}:${item.productId}:${item.label}`, item])).values()
  )

  return NextResponse.json({
    vehicles: unique.slice(0, 20),
  }, {
    headers: { 'Cache-Control': 'private, no-store, max-age=0' },
  })
}
