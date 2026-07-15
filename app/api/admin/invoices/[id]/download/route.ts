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
    return new NextResponse(renderInvoiceHtml(invoice), {
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
