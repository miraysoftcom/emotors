import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getRewardPayments, updateRewardPayment } from '@/lib/reward-payment-store'
import { getShopSettings } from '@/lib/shop-settings-store'

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function getEnabledRewardPaymentMethods() {
  const settings = getShopSettings()
  const allowed = new Set(['stripe', 'sumup', 'paypal', 'twint', 'vorauszahlung', 'bank_transfer'])
  return settings.payments.methods
    .filter((method) => method.enabled && allowed.has(method.id))
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((method) => ({
      id: method.id,
      label: method.label,
      instructions: method.instructions,
    }))
}

function buildConfirmationMessage(methodLabel: string, status: string) {
  if (status === 'processing') {
    return [
      `${methodLabel} wurde als Zahlungsart gespeichert.`,
      'Bitte führen Sie die Zahlung mit den unten angezeigten Zahlungsinformationen aus.',
      'Sobald der Zahlungseingang manuell durch MK-eMotors Dornach geprüft wurde, wird Ihr Gutschein automatisch im Kundenkonto freigeschaltet.',
    ].join(' ')
  }

  return [
    `${methodLabel} wurde als Zahlungsart gespeichert.`,
    'Die Online-Zahlung ist vorbereitet. Nach erfolgreicher Zahlungsbestätigung wird Ihr Gutschein freigeschaltet.',
  ].join(' ')
}

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers }).catch(() => null)
  const email = session?.user?.email || request.nextUrl.searchParams.get('email') || ''
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: 'Bitte melden Sie sich an.' }, { status: 401 })
  }

  return NextResponse.json({
    payments: getRewardPayments(email),
    methods: getEnabledRewardPaymentMethods(),
  })
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers }).catch(() => null)
  const email = session?.user?.email || ''
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: 'Bitte melden Sie sich an.' }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const paymentId = String(body.paymentId || '')
  const methodId = String(body.methodId || '')
  const methods = getEnabledRewardPaymentMethods()
  const method = methods.find((item) => item.id === methodId)
  if (!paymentId || !method) {
    return NextResponse.json({ error: 'Bitte wählen Sie eine gültige Zahlungsart.' }, { status: 400 })
  }

  const payment = getRewardPayments(email).find((item) => item.id === paymentId)
  if (!payment) {
    return NextResponse.json({ error: 'Zahlungsanforderung nicht gefunden.' }, { status: 404 })
  }

  const nextStatus = method.id === 'bank_transfer' || method.id === 'vorauszahlung' || method.id === 'twint'
    ? 'processing'
    : 'pending'
  const updated = updateRewardPayment(payment.id, {
    selectedMethod: method.id,
    status: nextStatus,
  })

  return NextResponse.json({
    payment: updated,
    method,
    checkoutUrl: method.id === 'stripe' || method.id === 'sumup' || method.id === 'paypal'
      ? `/account?tab=rewards&payment=${encodeURIComponent(payment.id)}&method=${encodeURIComponent(method.id)}`
      : '',
    message: buildConfirmationMessage(method.label, nextStatus),
  })
}
