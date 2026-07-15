import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { orders, products as productTable } from '@/lib/db/schema'
import { desc } from 'drizzle-orm'
import { createStoredOrder, getStoredOrders, updateStoredOrder } from '@/lib/orders-store'
import { createInvoiceForOrder } from '@/lib/invoice-store'
import { sendOrderConfirmationEmail } from '@/lib/email/service'
import { getEnabledPaymentMethods, getShopSettings } from '@/lib/shop-settings-store'
import { getStoredProducts } from '@/lib/products-store'
import { resolveProductPrice, type ProductPriceSource } from '@/lib/product-price'
import { calculateOrderTax, getTaxSettings } from '@/lib/tax-settings-store'

export async function GET() {
  try {
    const storedOrders = getStoredOrders()
    if (!db) return NextResponse.json({ orders: storedOrders })

    const allOrders = await db
      .select()
      .from(orders)
      .orderBy(desc(orders.createdAt))
      .limit(500)

    const storedOrderNumbers = new Set(storedOrders.map((order) => order.orderNumber))
    const mergedOrders = [
      ...storedOrders,
      ...(allOrders || []).filter((order) => !storedOrderNumbers.has(order.orderNumber)),
    ].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())

    return NextResponse.json({ orders: mergedOrders })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json({ orders: getStoredOrders() })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const paymentMethod = normalizePaymentMethod(body.paymentMethod)
    const settings = getShopSettings()
    const enabledMethods = new Set<string>(getEnabledPaymentMethods().map((method) => method.id))

    if (!body.firstName || !body.lastName || !body.email || !body.address || !body.city || !body.postalCode) {
      return NextResponse.json({ error: 'Pflichtfelder fehlen.' }, { status: 400 })
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(body.email))) {
      return NextResponse.json({ error: 'Bitte geben Sie eine gültige E-Mail-Adresse ein.' }, { status: 400 })
    }
    if (!/^[0-9]{4,5}$/.test(String(body.postalCode).trim())) {
      return NextResponse.json({ error: 'Bitte geben Sie eine gültige Postleitzahl ein.' }, { status: 400 })
    }
    if (body.phone && !/^[+0-9\s().-]{7,24}$/.test(String(body.phone))) {
      return NextResponse.json({ error: 'Bitte geben Sie eine gültige Telefonnummer ein.' }, { status: 400 })
    }
    if (!enabledMethods.has(paymentMethod)) {
      return NextResponse.json({ error: 'Diese Zahlungsart ist aktuell nicht verfügbar.' }, { status: 400 })
    }

    const trustedItems = await resolveTrustedOrderItems(Array.isArray(body.items) ? body.items : [])
    if (trustedItems.length === 0) {
      return NextResponse.json({ error: 'Die Produktpreise konnten nicht validiert werden.' }, { status: 400 })
    }

    const subtotal = trustedItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
    if (subtotal < settings.shop.minimumOrderAmount) {
      return NextResponse.json({ error: `Der Mindestbestellwert beträgt CHF ${settings.shop.minimumOrderAmount}.` }, { status: 400 })
    }
    if (paymentMethod === 'auf_rechnung') {
      const { minAmount, maxAmount } = settings.payments.invoice
      if (subtotal < minAmount || subtotal > maxAmount) {
        return NextResponse.json({ error: `Kauf auf Rechnung ist nur zwischen CHF ${minAmount} und CHF ${maxAmount} verfügbar.` }, { status: 400 })
      }
    }

    const shippingCost = subtotal >= settings.shop.freeShippingFrom ? 0 : settings.shop.shippingCost
    const taxSnapshot = calculateOrderTax({ items: trustedItems, shippingCost, settings: getTaxSettings() })
    const totalAmount = taxSnapshot.gross
    const tax = taxSnapshot.tax

    let order = createStoredOrder({
      email: body.email,
      firstName: body.firstName,
      lastName: body.lastName,
      phone: body.phone || '',
      billingStreet: body.address,
      billingPostalCode: body.postalCode,
      billingCity: body.city,
      billingCountry: body.country || 'CH',
      subtotal,
      shippingCost,
      tax,
      totalAmount,
      currency: 'CHF',
      paymentMethod,
      paymentStatus: body.paymentStatus,
      items: trustedItems,
      customerNote: body.customerNote || '',
    })

    let invoice = null
    if (['auf_rechnung', 'vorauszahlung', 'bank_transfer', 'twint'].includes(paymentMethod)) {
      invoice = createInvoiceForOrder({ ...order, taxSnapshot })
      order = updateStoredOrder(order.id, {
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        invoiceDueDate: invoice.dueDate,
        paymentStatus: invoice.status === 'settings_required' ? order.paymentStatus : invoice.status,
      }) || order
    }

    try {
      await sendOrderConfirmationEmail(body.email, order.orderNumber, {
        ...order,
        invoice,
      })
    } catch (error) {
      console.error('[Order Email Error]', error)
    }

    return NextResponse.json({ order: { ...order, invoice } }, { status: 201 })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json({ error: 'Bestellung konnte nicht erstellt werden.' }, { status: 500 })
  }
}

function normalizePaymentMethod(value: string) {
  const normalized = String(value || '').trim().toLowerCase()
  if (normalized === 'auf_rechnung' || normalized === 'rechnung') return 'auf_rechnung'
  if (normalized === 'iban' || normalized === 'bank' || normalized === 'banküberweisung') return 'bank_transfer'
  if (normalized === 'vorauszahlung') return 'vorauszahlung'
  return normalized || 'stripe'
}

type SubmittedOrderItem = {
  id?: number | string
  productId?: number | string
  handle?: string
  slug?: string
  quantity?: number | string
  image?: string
}

async function resolveTrustedOrderItems(items: SubmittedOrderItem[]) {
  const submittedItems = items.filter(Boolean)
  if (submittedItems.length === 0) return []

  const storedProducts = getStoredProducts()
  let catalogProducts: Array<ProductPriceSource & {
    id: number
    title?: string | null
    slug?: string | null
    image?: string | null
    images?: string[] | null
    stock_quantity?: number | null
  }> = storedProducts

  try {
    if (db) {
      const dbProducts = await db.select().from(productTable).limit(1000)
      catalogProducts = dbProducts.length > 0 ? dbProducts : catalogProducts
    }
  } catch (error) {
    console.error('[Order Product Price Lookup Error]', error)
  }

  const byId = new Map(catalogProducts.map((product) => [String(product.id), product]))
  const bySlug = new Map(catalogProducts.map((product) => [String(product.slug || ''), product]))
  const resolved = []

  for (const item of submittedItems) {
    const lookupId = String(item.productId ?? item.id ?? '')
    const lookupSlug = String(item.slug ?? item.handle ?? '')
    const product = byId.get(lookupId) || bySlug.get(lookupSlug)

    if (!product || product.active === false || product.archived === true) {
      return []
    }

    const quantity = Math.max(1, Math.floor(Number(item.quantity || 1)))
    const pricing = resolveProductPrice(product)
    resolved.push({
      productId: product.id,
      name: product.title || 'Produkt',
      price: pricing.effectivePrice,
      quantity,
      image: product.image || product.images?.[0] || item.image || '',
      taxRateId: getProductTaxRateId(product),
      taxPercentage: getProductTaxPercentage(product),
    })
  }

  return resolved
}

function getProductTaxRateId(product: ProductPriceSource & { metadata?: unknown }) {
  const metadata = product.metadata && typeof product.metadata === 'object' ? product.metadata as Record<string, unknown> : {}
  const value = metadata.taxRateId || metadata.mwstRateId || metadata.tax_rate_id
  return typeof value === 'string' ? value : undefined
}

function getProductTaxPercentage(product: ProductPriceSource & { metadata?: unknown }) {
  const metadata = product.metadata && typeof product.metadata === 'object' ? product.metadata as Record<string, unknown> : {}
  const value = metadata.taxPercentage || metadata.mwstPercentage || metadata.tax_percentage
  return typeof value === 'number' ? value : undefined
}
