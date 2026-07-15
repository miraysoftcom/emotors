import { NextRequest, NextResponse } from 'next/server'
import { isAdminRequestAuthorized } from '@/lib/admin-auth'
import { createManualInvoice, getInvoices } from '@/lib/invoice-store'

function assertAdmin(request: NextRequest) {
  return isAdminRequestAuthorized(request.cookies.get('adminToken')?.value)
}

export async function GET(request: NextRequest) {
  if (!assertAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return NextResponse.json({ invoices: getInvoices() })
}

export async function POST(request: NextRequest) {
  if (!assertAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const body = await request.json()
    const invoice = createManualInvoice(body)
    return NextResponse.json({ invoice }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Rechnung konnte nicht erstellt werden.' }, { status: 400 })
  }
}
