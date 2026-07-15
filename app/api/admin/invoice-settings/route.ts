import { NextRequest, NextResponse } from 'next/server'
import { createTestInvoice, getInvoiceSettings, getSwissQrStatus, isPdfBuffer, renderFallbackPdfBuffer, renderInvoiceHtml, renderInvoicePdfBuffer, saveInvoiceSettings } from '@/lib/invoice-store'
import { getSession } from '@/lib/admin-auth'

export const runtime = 'nodejs'

function assertAdmin(request: NextRequest) {
  const token = request.cookies.get('adminToken')?.value
  return Boolean(token && getSession(token))
}

export async function GET(request: NextRequest) {
  if (!assertAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const preview = request.nextUrl.searchParams.get('preview')
  if (preview === 'test-pdf') {
    const invoice = createTestInvoice()
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
        buffer = renderFallbackPdfBuffer('Test PDF konnte nicht geladen werden', 'Die erzeugte PDF-Datei war ungültig. Bitte prüfen Sie die Swiss QR Einstellungen.')
      }
    } catch (error) {
      console.error('[Test Invoice PDF Error]', error)
      buffer = renderFallbackPdfBuffer('Test PDF konnte nicht erstellt werden', error instanceof Error ? error.message : 'Unbekannter PDF-Fehler.')
    }

    return new Response(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="Test-QR-Rechnung.pdf"',
        'Cache-Control': 'private, no-store',
      },
    })
  }
  const settings = getInvoiceSettings()
  return NextResponse.json({ settings, status: getSwissQrStatus(settings) })
}

export async function PUT(req: NextRequest) {
  if (!assertAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const body = await req.json()
    const current = getInvoiceSettings()
    const settings = saveInvoiceSettings({
      ...current,
      ...body,
      qrBillEnabled: Boolean(body.qrBillEnabled),
      enabled: Boolean(body.qrBillEnabled),
      showQrForPaidInvoices: Boolean(body.showQrForPaidInvoices),
      invoiceDueDays: Number(body.invoiceDueDays || body.invoiceDueDays === 0 ? body.invoiceDueDays : current.invoiceDueDays),
      prepaymentDueDays: Number(body.prepaymentDueDays || body.prepaymentDueDays === 0 ? body.prepaymentDueDays : current.prepaymentDueDays),
      lastInvoiceNumber: Number(body.lastInvoiceNumber || 0),
      numberLength: Number(body.numberLength || 6),
    })
    return NextResponse.json({ settings, status: getSwissQrStatus(settings) })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Einstellungen ungültig.' }, { status: 400 })
  }
}

function renderInvoiceHtmlError(message: string) {
  return `<!doctype html><html lang="de"><head><meta charset="utf-8"><title>Swiss QR-Bill Fehler</title></head><body style="font-family:Arial,sans-serif;padding:32px;line-height:1.5"><h1>Swiss QR-Bill konnte nicht erstellt werden</h1><p>${escapeHtml(message)}</p><p>Prüfen Sie insbesondere: QRR benötigt eine echte QR-IBAN mit IID 30000-31999. Mit normaler IBAN bitte Referenztyp NON oder SCOR verwenden.</p></body></html>`
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
