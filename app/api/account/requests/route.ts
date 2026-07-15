import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import {
  createCustomerRequest,
  getCustomerRequests,
  type CustomerRequestType,
} from '@/lib/customer-request-store'

const allowedTypes: CustomerRequestType[] = [
  'warranty',
  'service',
  'return',
  'trade_in',
  'estimate',
  'coupon',
  'newsletter',
  'review',
]

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers }).catch(() => null)
  const email = session?.user?.email || request.nextUrl.searchParams.get('email') || ''
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: 'Bitte melden Sie sich an oder geben Sie eine gültige E-Mail-Adresse an.' }, { status: 401 })
  }
  return NextResponse.json({ requests: getCustomerRequests(email) })
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers }).catch(() => null)
  const body = await request.json().catch(() => ({}))
  const type = String(body.type || '') as CustomerRequestType
  const email = String(session?.user?.email || body.email || '').trim().toLowerCase()
  const subject = String(body.subject || '').trim()

  if (!allowedTypes.includes(type)) {
    return NextResponse.json({ error: 'Ungültiger Anfrage-Typ.' }, { status: 400 })
  }
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: 'Bitte geben Sie eine gültige E-Mail-Adresse an.' }, { status: 400 })
  }
  if (subject.length < 3) {
    return NextResponse.json({ error: 'Bitte geben Sie einen Betreff ein.' }, { status: 400 })
  }

  const requestRecord = createCustomerRequest({
    type,
    email,
    name: String(body.name || session?.user?.name || '').slice(0, 160),
    phone: String(body.phone || '').slice(0, 80),
    subject: subject.slice(0, 180),
    message: String(body.message || '').slice(0, 3000),
    payload: typeof body.payload === 'object' && body.payload ? body.payload : {},
  })

  return NextResponse.json({
    request: requestRecord,
    message: 'Anfrage empfangen - unser Team prüft die Details und meldet sich persönlich bei Ihnen.',
  }, { status: 201 })
}
