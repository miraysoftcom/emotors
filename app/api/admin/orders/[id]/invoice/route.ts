import { NextRequest, NextResponse } from 'next/server'
import { isAdminRequestAuthorized } from '@/lib/admin-auth'
import { createInvoiceForOrder, getInvoices } from '@/lib/invoice-store'
import { getStoredOrders, updateStoredOrder } from '@/lib/orders-store'

function assertAdmin(request: NextRequest) {
  return isAdminRequestAuthorized(request.cookies.get('adminToken')?.value)
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!assertAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const order = getStoredOrders().find((item) => item.id === Number(id))
  if (!order) return NextResponse.json({ error: 'Bestellung nicht gefunden.' }, { status: 404 })

  const existing = getInvoices().find((item) => item.orderId === order.id || item.orderNumber === order.orderNumber)
  if (existing) return NextResponse.json({ invoice: existing })

  const invoice = createInvoiceForOrder(order)
  updateStoredOrder(order.id, {
    invoiceId: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    invoiceDueDate: invoice.dueDate,
  })

  return NextResponse.json({ invoice }, { status: 201 })
}
