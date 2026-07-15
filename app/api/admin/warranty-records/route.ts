import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/admin-auth'
import {
  deleteWarrantyRecord,
  getWarrantyRecords,
  upsertWarrantyRecord,
  type WarrantyInput,
  type WarrantyStatus,
} from '@/lib/warranty-store'

function assertAdmin(request: NextRequest) {
  const token = request.cookies.get('adminToken')?.value
  if (!token) return false
  return Boolean(getSession(token))
}

function parseWarrantyInput(body: Record<string, unknown>): WarrantyInput {
  const status = ['active', 'expired', 'void', 'service'].includes(String(body.status))
    ? String(body.status) as WarrantyStatus
    : 'active'

  return {
    serialNumber: String(body.serialNumber || '').trim(),
    vehicleNumber: String(body.vehicleNumber || '').trim(),
    productName: String(body.productName || '').trim(),
    orderNumber: String(body.orderNumber || '').trim(),
    customerEmail: String(body.customerEmail || '').trim().toLowerCase(),
    customerName: String(body.customerName || '').trim(),
    purchaseDate: String(body.purchaseDate || '').trim(),
    warrantyUntil: String(body.warrantyUntil || '').trim(),
    status,
    notes: String(body.notes || '').trim(),
  }
}

export async function GET(request: NextRequest) {
  if (!assertAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.json({ records: getWarrantyRecords() })
}

export async function POST(request: NextRequest) {
  if (!assertAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const record = parseWarrantyInput(body)
  if (!record.serialNumber && !record.vehicleNumber) {
    return NextResponse.json({ error: 'Seriennummer oder Fahrzeugnummer ist erforderlich.' }, { status: 400 })
  }
  if (!record.productName || !record.purchaseDate || !record.warrantyUntil) {
    return NextResponse.json({ error: 'Produkt, Kaufdatum und Garantieende sind erforderlich.' }, { status: 400 })
  }

  return NextResponse.json({ record: upsertWarrantyRecord(record, String(body.id || '') || undefined) })
}

export async function DELETE(request: NextRequest) {
  if (!assertAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const id = request.nextUrl.searchParams.get('id') || ''
  if (!id) return NextResponse.json({ error: 'ID fehlt.' }, { status: 400 })
  return NextResponse.json({ success: deleteWarrantyRecord(id) })
}
