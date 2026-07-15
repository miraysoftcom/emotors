import { NextResponse } from 'next/server'
import { getInvoices } from '@/lib/invoice-store'

export async function GET() {
  return NextResponse.json({ invoices: getInvoices() })
}
