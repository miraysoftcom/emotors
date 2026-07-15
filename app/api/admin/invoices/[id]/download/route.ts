import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/admin-auth'
import { getInvoices, isPdfBuffer, renderFallbackPdfBuffer, renderInvoiceHtml, renderInvoicePdfBuffer } from '@/lib/invoice-store'

export const runtime = 'nodejs'

type RouteParams = {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const token = request.cookies.get('adminToken')?.value
  if (!token || !getSession(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const invoice = getInvoices().find((item) => item.id === Number(id))
  if (!invoice) return NextResponse.json({ error: 'Rechnung nicht gefunden.' }, { status: 404 })

  if (request.nextUrl.searchParams.get('format') === 'html') {
    let html: string
    try {
      html = renderInvoiceHtml(invoice)
    } catch (error) {
      html = renderInvoiceHtmlError(error instanceof Error ? error.message : 'Unbekannter QR-Bill Fehler.')
    }
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'private, no-store',
      },
    })
  }

  let buffer: Buffer
  try {
    buffer = renderInvoicePdfBuffer(invoice)
    if (!isPdfBuffer(buffer)) {
      buffer = renderFallbackPdfBuffer('Rechnung konnte nicht geladen werden', 'Die erzeugte PDF-Datei war ungültig. Bitte öffnen Sie die HTML-Vorschau.')
    }
  } catch (error) {
    console.error('[Admin Invoice PDF Error]', error)
    buffer = renderFallbackPdfBuffer('Rechnung konnte nicht erstellt werden', error instanceof Error ? error.message : 'Unbekannter PDF-Fehler.')
  }

  return new Response(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="Rechnung-${invoice.invoiceNumber}.pdf"`,
      'Cache-Control': 'private, no-store',
    },
  })
}

function renderInvoiceHtmlError(message: string) {
  return `<!doctype html><html lang="de"><head><meta charset="utf-8"><title>Rechnung nicht verfügbar</title></head><body style="font-family:Arial,sans-serif;padding:32px;line-height:1.5"><h1>Rechnung konnte nicht erstellt werden</h1><p>${escapeHtml(message)}</p><p>Bitte prüfen Sie die Swiss QR-Bill Einstellungen im Admin Panel.</p></body></html>`
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }[char] || char))
}
