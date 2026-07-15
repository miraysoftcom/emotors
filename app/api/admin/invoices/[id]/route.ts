import { NextRequest, NextResponse } from 'next/server'
import { isAdminRequestAuthorized } from '@/lib/admin-auth'
import {
  addInvoicePayment,
  cancelInvoice,
  deleteInvoice,
  finalizeInvoice,
  getInvoices,
  updateInvoice,
} from '@/lib/invoice-store'

function assertAdmin(request: NextRequest) {
  return isAdminRequestAuthorized(request.cookies.get('adminToken')?.value)
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!assertAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const invoice = getInvoices().find((item) => item.id === Number(id))
  if (!invoice) return NextResponse.json({ error: 'Rechnung nicht gefunden.' }, { status: 404 })
  return NextResponse.json({ invoice })
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!assertAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const invoiceId = Number(id)
  if (!Number.isFinite(invoiceId)) return NextResponse.json({ error: 'Ungültige Rechnungs-ID.' }, { status: 400 })

  try {
    const body = await request.json()
    const action = String(body.action || 'update')
    let invoice = null

    if (action === 'payment') {
      invoice = addInvoicePayment(invoiceId, body.payment || body)
    } else if (action === 'finalize') {
      invoice = finalizeInvoice(invoiceId)
    } else if (action === 'cancel') {
      invoice = cancelInvoice(invoiceId)
    } else {
      invoice = updateInvoice(invoiceId, body.invoice || body)
    }

    if (!invoice) return NextResponse.json({ error: 'Rechnung nicht gefunden.' }, { status: 404 })
    return NextResponse.json({ invoice })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Rechnung konnte nicht aktualisiert werden.' }, { status: 400 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!assertAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const invoice = deleteInvoice(Number(id))
  if (!invoice) return NextResponse.json({ error: 'Rechnung nicht gefunden.' }, { status: 404 })
  return NextResponse.json({ invoice })
}
