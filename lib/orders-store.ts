import fs from 'fs'
import path from 'path'
import { normalizeMoneyAmount } from '@/lib/money'

const STORE_FILE = path.join(process.cwd(), '.data', 'orders.json')

export interface StoredOrder {
  id: number
  orderNumber: string
  email: string
  firstName: string
  lastName: string
  phone: string
  billingStreet: string
  billingPostalCode: string
  billingCity: string
  billingCountry: string
  subtotal: number
  shippingCost: number
  tax: number
  totalAmount: number
  currency: 'CHF' | 'EUR'
  status: string
  paymentMethod: string
  paymentStatus: string
  invoiceId?: number | null
  invoiceNumber?: string | null
  invoiceDueDate?: string | null
  items?: Array<{
    productId: number
    name: string
    price: number
    quantity: number
  }>
  customerNote?: string
  adminNote?: string
  paymentDate?: string
  shippingCarrier?: string
  trackingNumber?: string
  trackingUrl?: string
  estimatedDeliveryDate?: string
  shippingStatus?: string
  statusHistory?: OrderStatusHistoryEntry[]
  createdAt: string
  updatedAt: string
}

export interface OrderStatusHistoryEntry {
  status: string
  date: string
  description: string
  carrier?: string
  trackingNumber?: string
  trackingUrl?: string
  estimatedDeliveryDate?: string
}

function ensureStore() {
  const dir = path.dirname(STORE_FILE)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  if (!fs.existsSync(STORE_FILE)) fs.writeFileSync(STORE_FILE, '[]')
}

export function getStoredOrders() {
  ensureStore()
  try {
    return JSON.parse(fs.readFileSync(STORE_FILE, 'utf-8')) as StoredOrder[]
  } catch {
    return []
  }
}

function saveOrders(orders: StoredOrder[]) {
  ensureStore()
  fs.writeFileSync(STORE_FILE, JSON.stringify(orders, null, 2))
}

export function createStoredOrder(data: Partial<StoredOrder>) {
  const orders = getStoredOrders()
  const now = new Date().toISOString()
  const id = Math.max(0, ...orders.map((order) => order.id)) + 1
  const paymentMethod = data.paymentMethod || 'stripe'
  const isInvoice = paymentMethod === 'auf_rechnung'
  const isBankTransfer = paymentMethod === 'bank_transfer'
  const isTwint = paymentMethod === 'twint'
  const isPrepayment = paymentMethod === 'vorauszahlung' || isBankTransfer || isTwint

  const order: StoredOrder = {
    id,
    orderNumber: `ORD-${new Date().getFullYear()}-${String(id).padStart(6, '0')}`,
    email: data.email || '',
    firstName: data.firstName || '',
    lastName: data.lastName || '',
    phone: data.phone || '',
    billingStreet: data.billingStreet || '',
    billingPostalCode: data.billingPostalCode || '',
    billingCity: data.billingCity || '',
    billingCountry: data.billingCountry || 'CH',
    subtotal: normalizeMoneyAmount(data.subtotal ?? data.totalAmount ?? 0),
    shippingCost: normalizeMoneyAmount(data.shippingCost || 0),
    tax: normalizeMoneyAmount(data.tax || 0),
    totalAmount: normalizeMoneyAmount(data.totalAmount || 0),
    currency: data.currency || 'CHF',
    status: isInvoice ? 'Rechnung offen' : isPrepayment ? 'Zahlung ausstehend' : 'Bestellung eingegangen',
    paymentMethod,
    paymentStatus: isInvoice
      ? 'Rechnung offen'
      : isTwint
        ? 'Zahlungsprüfung erforderlich'
        : isBankTransfer
          ? 'Warten auf Banküberweisung'
          : isPrepayment
            ? 'Zahlung ausstehend'
            : data.paymentStatus || 'Zahlung ausstehend',
    invoiceId: data.invoiceId || null,
    invoiceNumber: data.invoiceNumber || null,
    invoiceDueDate: data.invoiceDueDate || null,
    items: data.items || [],
    customerNote: data.customerNote || '',
    adminNote: data.adminNote || '',
    paymentDate: data.paymentDate || '',
    shippingCarrier: data.shippingCarrier || '',
    trackingNumber: data.trackingNumber || '',
    trackingUrl: data.trackingUrl || '',
    estimatedDeliveryDate: data.estimatedDeliveryDate || '',
    shippingStatus: data.shippingStatus || '',
    statusHistory: data.statusHistory || [
      {
        status: isInvoice ? 'Rechnung offen' : isPrepayment ? 'Zahlung ausstehend' : 'Bestellung eingegangen',
        date: now,
        description: 'Ihre Bestellung wurde erfolgreich erfasst.',
      },
    ],
    createdAt: now,
    updatedAt: now,
  }
  saveOrders([order, ...orders])
  return order
}

export function updateStoredOrder(id: number, data: Partial<StoredOrder>) {
  const orders = getStoredOrders()
  const existing = orders.find((order) => order.id === id)
  if (!existing) return null
  const now = new Date().toISOString()
  const statusChanged = data.status && data.status !== existing.status
  const trackingChanged = (
    data.shippingCarrier !== undefined ||
    data.trackingNumber !== undefined ||
    data.trackingUrl !== undefined ||
    data.estimatedDeliveryDate !== undefined
  )
  const history = [...(existing.statusHistory || [])]

  if (statusChanged) {
    history.push({
      status: String(data.status),
      date: now,
      description: getStatusDescription(String(data.status)),
      carrier: data.shippingCarrier ?? existing.shippingCarrier,
      trackingNumber: data.trackingNumber ?? existing.trackingNumber,
      trackingUrl: data.trackingUrl ?? existing.trackingUrl,
      estimatedDeliveryDate: data.estimatedDeliveryDate ?? existing.estimatedDeliveryDate,
    })
  } else if (trackingChanged && (data.trackingNumber || existing.trackingNumber)) {
    history.push({
      status: data.shippingStatus || existing.shippingStatus || 'Tracking aktualisiert',
      date: now,
      description: 'Die Versandinformationen wurden aktualisiert.',
      carrier: data.shippingCarrier ?? existing.shippingCarrier,
      trackingNumber: data.trackingNumber ?? existing.trackingNumber,
      trackingUrl: data.trackingUrl ?? existing.trackingUrl,
      estimatedDeliveryDate: data.estimatedDeliveryDate ?? existing.estimatedDeliveryDate,
    })
  }

  const updated = { ...existing, ...data, statusHistory: history, updatedAt: now }
  saveOrders(orders.map((order) => order.id === id ? updated : order))
  return updated
}

export function deleteStoredOrder(id: number) {
  const orders = getStoredOrders()
  const existing = orders.find((order) => order.id === id)
  if (!existing) return null
  saveOrders(orders.filter((order) => order.id !== id))
  return existing
}

function getStatusDescription(status: string) {
  const descriptions: Record<string, string> = {
    'Bestellung eingegangen': 'Ihre Bestellung ist bei uns eingegangen.',
    'Zahlung ausstehend': 'Wir warten auf den Zahlungseingang oder die Zahlungsprüfung.',
    'Zahlung bestätigt': 'Die Zahlung wurde bestätigt.',
    'Bestellung wird bearbeitet': 'Ihre Bestellung wird vorbereitet.',
    'In Bearbeitung': 'Ihre Bestellung wird vorbereitet.',
    'Versand vorbereitet': 'Die Sendung wird für den Versand vorbereitet.',
    Versandbereit: 'Die Sendung ist versandbereit.',
    Versendet: 'Ihre Bestellung wurde versendet.',
    'In Zustellung': 'Die Sendung befindet sich in Zustellung.',
    Zugestellt: 'Die Bestellung wurde zugestellt.',
    Storniert: 'Die Bestellung wurde storniert.',
    Rückerstattet: 'Die Zahlung wurde erstattet.',
    Abgelehnt: 'Die Bestellung wurde abgelehnt.',
  }
  return descriptions[status] || 'Der Bestellstatus wurde aktualisiert.'
}
