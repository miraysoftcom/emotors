import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/admin-auth'
import {
  addCustomerRequestReply,
  getCustomerRequests,
  updateCustomerRequest,
  type CustomerRequestRecord,
  type CustomerRequestType,
} from '@/lib/customer-request-store'
import { sendEmail } from '@/lib/email/service'

function assertAdmin(request: NextRequest) {
  const token = request.cookies.get('adminToken')?.value
  return Boolean(token && getSession(token))
}

function normalizeType(value: string | null) {
  return String(value || '').trim() as CustomerRequestType | ''
}

export async function GET(request: NextRequest) {
  if (!assertAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const type = normalizeType(request.nextUrl.searchParams.get('type'))
  const status = String(request.nextUrl.searchParams.get('status') || '').trim()
  let requests = getCustomerRequests()

  if (type) requests = requests.filter((item) => item.type === type)
  if (status) requests = requests.filter((item) => item.status === status)

  return NextResponse.json({
    requests,
    stats: buildStats(getCustomerRequests()),
  })
}

export async function PATCH(request: NextRequest) {
  if (!assertAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const id = String(body.id || '')
  const status = String(body.status || '') as CustomerRequestRecord['status']
  if (!id || !['new', 'in_review', 'done'].includes(status)) {
    return NextResponse.json({ error: 'Ungültige Anfrage.' }, { status: 400 })
  }

  const updated = updateCustomerRequest(id, { status })
  if (!updated) return NextResponse.json({ error: 'Anfrage nicht gefunden.' }, { status: 404 })
  return NextResponse.json({ request: updated })
}

export async function POST(request: NextRequest) {
  if (!assertAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const id = String(body.id || '')
  const message = String(body.message || '').trim()
  if (!id || message.length < 3) {
    return NextResponse.json({ error: 'Bitte schreiben Sie eine Antwort.' }, { status: 400 })
  }

  const existing = getCustomerRequests().find((item) => item.id === id)
  if (!existing) return NextResponse.json({ error: 'Anfrage nicht gefunden.' }, { status: 404 })

  const updated = addCustomerRequestReply(id, message)
  await sendEmail({
    to: existing.email,
    subject: `Antwort von MK-eMotors Dornach: ${existing.subject}`,
    type: 'customer_request_reply',
    data: {
      customerName: existing.name,
      requestType: existing.type,
      requestSubject: existing.subject,
      message,
    },
  })

  return NextResponse.json({
    request: updated,
    message: 'Antwort wurde gespeichert und per E-Mail vorbereitet.',
  })
}

function buildStats(requests: CustomerRequestRecord[]) {
  return {
    total: requests.length,
    new: requests.filter((item) => item.status === 'new').length,
    estimates: requests.filter((item) => item.type === 'estimate').length,
    service: requests.filter((item) => ['service', 'warranty', 'return', 'trade_in'].includes(item.type)).length,
  }
}

