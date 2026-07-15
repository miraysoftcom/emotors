import { NextRequest, NextResponse } from 'next/server'
import { and, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { orders as orderTable } from '@/lib/db/schema'
import { createInvoiceForOrder, getInvoices, isPdfBuffer, renderFallbackPdfBuffer, renderInvoiceHtml, renderInvoicePdfBuffer } from '@/lib/invoice-store'
import { getStoredOrders, type StoredOrder, updateStoredOrder } from '@/lib/orders-store'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const orderNumber = request.nextUrl.searchParams.get('orderNumber') || ''
  const email = request.nextUrl.searchParams.get('email') || ''

  let order = getStoredOrders().find((item) => (
    item.orderNumber.toLowerCase() === orderNumber.trim().toLowerCase() &&
    item.email.toLowerCase() === email.trim().toLowerCase()
  ))

  if (!order && db) {
    const rows = await db
      .select()
      .from(orderTable)
      .where(and(
        eq(orderTable.orderNumber, orderNumber.trim()),
        eq(orderTable.email, email.trim().toLowerCase())
      ))
      .limit(1)
      .catch(() => [])
    order = rows[0] as StoredOrder | undefined
  }

  if (!order) {
    return NextResponse.json({ error: 'Es konnte keine passende Bestellung gefunden werden. Bitte überprüfen Sie Ihre Angaben.' }, { status: 404 })
  }

  let invoice = getInvoices().find((item) => (
    item.id === order.invoiceId ||
    item.orderId === order.id ||
    item.orderNumber === order.orderNumber
  ))

  if (!invoice) {
    invoice = createInvoiceForOrder(order)
    updateStoredOrder(order.id, {
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      invoiceDueDate: invoice.dueDate,
    })
  }

  if (request.nextUrl.searchParams.get('format') === 'html') {
    return new NextResponse(renderInvoiceHtml(invoice), {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'private, no-store',
      },
    })
  }

  try {
    let buffer = renderInvoicePdfBuffer(invoice)
    if (!isPdfBuffer(buffer)) {
      buffer = renderFallbackPdfBuffer('Rechnung konnte nicht geladen werden', 'Die erzeugte PDF-Datei war ungültig. Bitte öffnen Sie die HTML-Vorschau oder kontaktieren Sie MK-eMotors Dornach.')
    }
    return new Response(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Rechnung-${invoice.invoiceNumber}.pdf"`,
        'Cache-Control': 'private, no-store',
      },
    })
  } catch (error) {
    console.error('[Invoice PDF Error]', error)
    const buffer = renderFallbackPdfBuffer('Rechnung konnte nicht erstellt werden', error instanceof Error ? error.message : 'Unbekannter PDF-Fehler.')
    return new Response(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Rechnung-${invoice.invoiceNumber}.pdf"`,
        'Cache-Control': 'private, no-store',
      },
    })
  }
}
