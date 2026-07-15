import { NextRequest, NextResponse } from 'next/server'
import { desc } from 'drizzle-orm'
import { isAdminRequestAuthorized } from '@/lib/admin-auth'
import { db } from '@/lib/db'
import { orders, payments } from '@/lib/db/schema'
import { getStoredOrders } from '@/lib/orders-store'
import { getInvoices } from '@/lib/invoice-store'

type AdminPayment = {
  id: string
  orderId?: number
  orderNumber: string
  customerName: string
  email: string
  amount: number
  currency: string
  status: string
  paymentMethod: string
  providerReference: string
  invoiceNumber?: string | null
  createdAt: string
  updatedAt: string
  source: 'payment' | 'order'
}

function toIso(value: unknown) {
  if (!value) return ''
  const date = value instanceof Date ? value : new Date(String(value))
  return Number.isNaN(date.getTime()) ? String(value) : date.toISOString()
}

function methodLabel(value: string) {
  const labels: Record<string, string> = {
    stripe: 'Stripe',
    paypal: 'PayPal',
    sumup: 'SumUp',
    twint: 'TWINT',
    bank_transfer: 'Banküberweisung',
    vorauszahlung: 'Vorauszahlung',
    auf_rechnung: 'Kauf auf Rechnung',
    financing: 'Finanzierung',
    manual: 'Manuell',
  }
  return labels[value] || value || '-'
}

function statusLabel(value: string) {
  const normalized = String(value || '').toLowerCase()
  if (['succeeded', 'paid', 'bezahlt', 'zahlung bestätigt'].some((item) => normalized.includes(item))) return 'Bezahlt'
  if (['failed', 'fehlgeschlagen'].some((item) => normalized.includes(item))) return 'Fehlgeschlagen'
  if (['refunded', 'zurückerstattet', 'rückerstattet'].some((item) => normalized.includes(item))) return 'Zurückerstattet'
  if (['processing', 'prüfung', 'review'].some((item) => normalized.includes(item))) return 'Zahlungsprüfung erforderlich'
  if (['warten', 'bank'].some((item) => normalized.includes(item))) return 'Warten auf Banküberweisung'
  if (['open', 'offen', 'unpaid'].some((item) => normalized.includes(item))) return 'Rechnung offen'
  return value || 'Zahlung ausstehend'
}

function fromStoredOrders(): AdminPayment[] {
  const invoices = getInvoices()
  return getStoredOrders().map((order) => {
    const invoice = invoices.find((item) => item.orderId === order.id || item.orderNumber === order.orderNumber)
    return {
      id: `order-${order.id}`,
      orderId: order.id,
      orderNumber: order.orderNumber,
      customerName: `${order.firstName || ''} ${order.lastName || ''}`.trim() || 'Kunde',
      email: order.email,
      amount: order.totalAmount || 0,
      currency: order.currency || 'CHF',
      status: statusLabel(order.paymentStatus),
      paymentMethod: methodLabel(order.paymentMethod),
      providerReference: order.invoiceNumber || invoice?.invoiceNumber || '',
      invoiceNumber: order.invoiceNumber || invoice?.invoiceNumber || null,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      source: 'order',
    }
  })
}

export async function GET(request: NextRequest) {
  if (!isAdminRequestAuthorized(request.cookies.get('adminToken')?.value)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const stored = fromStoredOrders()

    if (!db) {
      return NextResponse.json({ payments: stored, source: 'local' })
    }

    const [dbPayments, dbOrders] = await Promise.all([
      db.select().from(payments).orderBy(desc(payments.createdAt)).limit(500),
      db.select().from(orders).orderBy(desc(orders.createdAt)).limit(500),
    ])

    const orderById = new Map(dbOrders.map((order) => [order.id, order]))
    const dbPaymentRows: AdminPayment[] = dbPayments.map((payment) => {
      const order = orderById.get(payment.orderId)
      return {
        id: `payment-${payment.id}`,
        orderId: payment.orderId,
        orderNumber: order?.orderNumber || `Order #${payment.orderId}`,
        customerName: order ? `${order.firstName || ''} ${order.lastName || ''}`.trim() || 'Kunde' : 'Kunde',
        email: order?.email || '',
        amount: payment.amount || order?.totalAmount || 0,
        currency: payment.currency || order?.currency || 'CHF',
        status: statusLabel(payment.status || order?.paymentStatus || ''),
        paymentMethod: methodLabel(payment.paymentMethod || order?.paymentMethod || ''),
        providerReference: payment.stripePaymentIntentId || payment.paypalTransactionId || '',
        invoiceNumber: null,
        createdAt: toIso(payment.createdAt || order?.createdAt),
        updatedAt: toIso(payment.updatedAt || order?.updatedAt),
        source: 'payment',
      }
    })

    const paymentOrderIds = new Set(dbPayments.map((payment) => payment.orderId))
    const dbOrderRows: AdminPayment[] = dbOrders
      .filter((order) => !paymentOrderIds.has(order.id))
      .map((order) => ({
        id: `db-order-${order.id}`,
        orderId: order.id,
        orderNumber: order.orderNumber,
        customerName: `${order.firstName || ''} ${order.lastName || ''}`.trim() || 'Kunde',
        email: order.email,
        amount: order.totalAmount || 0,
        currency: order.currency || 'CHF',
        status: statusLabel(order.paymentStatus || ''),
        paymentMethod: methodLabel(order.paymentMethod || ''),
        providerReference: '',
        invoiceNumber: null,
        createdAt: toIso(order.createdAt),
        updatedAt: toIso(order.updatedAt),
        source: 'order',
      }))

    const storedOrderNumbers = new Set(stored.map((payment) => payment.orderNumber))
    const merged = [
      ...stored,
      ...dbPaymentRows.filter((payment) => !storedOrderNumbers.has(payment.orderNumber)),
      ...dbOrderRows.filter((payment) => !storedOrderNumbers.has(payment.orderNumber)),
    ].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())

    return NextResponse.json({ payments: merged, source: 'database' })
  } catch (error) {
    console.error('[Admin Payments Error]', error)
    return NextResponse.json({ payments: fromStoredOrders(), source: 'fallback' })
  }
}
