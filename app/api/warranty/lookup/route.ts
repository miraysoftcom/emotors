import { NextRequest, NextResponse } from 'next/server'
import { findWarrantyRecord, getWarrantyState } from '@/lib/warranty-store'

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('serial') || request.nextUrl.searchParams.get('code') || ''
  if (!code.trim()) {
    return NextResponse.json({ error: 'Bitte Seriennummer oder Fahrzeugnummer eingeben.' }, { status: 400 })
  }

  const record = findWarrantyRecord(code)
  if (!record) {
    return NextResponse.json({ found: false, error: 'Keine Garantie zu dieser Seriennummer / Fahrzeugnummer gefunden.' }, { status: 404 })
  }

  const state = getWarrantyState(record)
  return NextResponse.json({
    found: true,
    warranty: {
      productName: record.productName,
      serialNumber: record.serialNumber,
      vehicleNumber: record.vehicleNumber,
      orderNumber: record.orderNumber,
      purchaseDate: record.purchaseDate,
      warrantyUntil: record.warrantyUntil,
      status: state,
      notes: record.notes,
    },
  })
}
