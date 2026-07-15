import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { isAdminRequestAuthorized } from '@/lib/admin-auth'
import { deleteStoredOrder, updateStoredOrder } from '@/lib/orders-store'
import { deleteInvoicesForOrder, getInvoices, updateInvoice, type InvoiceRecord } from '@/lib/invoice-store'
import { db } from '@/lib/db'
import { orders as orderTable } from '@/lib/db/schema'

function assertAdmin(request: NextRequest) {
  return isAdminRequestAuthorized(request.cookies.get('adminToken')?.value)
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!assertAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const body = await request.json()
  const allowed = {
    status: body.status,
    paymentStatus: body.paymentStatus,
    trackingNumber: body.trackingNumber,
    shippingCarrier: body.shippingCarrier,
    trackingUrl: body.trackingUrl,
    estimatedDeliveryDate: body.estimatedDeliveryDate,
    shippingStatus: body.shippingStatus,
    adminNote: body.adminNote,
    customerNote: body.customerNote,
    paymentDate: body.paymentDate,
  }
  let order = updateStoredOrder(Number(id), allowed)

  if (!order && db) {
    const dbUpdate: Record<string, unknown> = {
      status: body.status,
      paymentStatus: body.paymentStatus,
      trackingNumber: body.trackingNumber || '',
      internalNotes: body.adminNote || '',
      notes: body.customerNote || '',
      updatedAt: new Date(),
    }
    if (body.estimatedDeliveryDate) {
      dbUpdate.estimatedDelivery = new Date(body.estimatedDeliveryDate)
    }

    const updatedRows = await db
      .update(orderTable)
      .set(dbUpdate)
      .where(eq(orderTable.id, Number(id)))
      .returning()

    order = updatedRows[0] as typeof order
  }

  if (!order) {
    return NextResponse.json({ error: 'Bestellung nicht gefunden.' }, { status: 404 })
  }

  const invoice = getInvoices().find((item) => (
    item.id === order.invoiceId ||
    item.orderId === order.id ||
    item.orderNumber === order.orderNumber
  ))
  if (invoice) {
    updateInvoice(invoice.id, {
      status: resolveInvoiceStatus(order.status, order.paymentStatus),
    })
  }

  return NextResponse.json({ order })
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!assertAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const orderId = Number(id)
  if (!Number.isFinite(orderId) || orderId <= 0) {
    return NextResponse.json({ error: 'Ungültige Bestellung.' }, { status: 400 })
  }

  const deletedStoredOrder = deleteStoredOrder(orderId)
  if (deletedStoredOrder) {
    deleteInvoicesForOrder(deletedStoredOrder.id, deletedStoredOrder.orderNumber)
    return NextResponse.json({ deleted: true, order: deletedStoredOrder })
  }

  if (db) {
    const deletedRows = await db
      .delete(orderTable)
      .where(eq(orderTable.id, orderId))
      .returning()

    const deletedOrder = deletedRows[0] as { id: number; orderNumber?: string } | undefined
    if (deletedOrder) {
      deleteInvoicesForOrder(deletedOrder.id, deletedOrder.orderNumber)
      return NextResponse.json({ deleted: true, order: deletedOrder })
    }
  }

  return NextResponse.json({ error: 'Bestellung nicht gefunden.' }, { status: 404 })
}

function resolveInvoiceStatus(orderStatus?: string, paymentStatus?: string): InvoiceRecord['status'] {
  const normalizedOrder = String(orderStatus || '').toLowerCase()
  const normalizedPayment = String(paymentStatus || '').toLowerCase()

  if (normalizedOrder.includes('storniert') || normalizedPayment.includes('storniert')) return 'Storniert'
  if (normalizedPayment.includes('bezahlt') || normalizedPayment.includes('zahlung bestätigt')) return 'Bezahlt'
  if (normalizedPayment.includes('ausstehend') || normalizedPayment.includes('warten') || normalizedPayment.includes('prüfung')) return 'Zahlung ausstehend'
  return 'Offen'
}
