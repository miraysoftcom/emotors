import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/admin-auth'
import { getCustomerRequests, updateCustomerRequest } from '@/lib/customer-request-store'
import { upsertCoupon } from '@/lib/coupon-store'
import { createRewardPayment } from '@/lib/reward-payment-store'
import { getShopSettings } from '@/lib/shop-settings-store'
import { sendEmail } from '@/lib/email/service'
import { formatMoney } from '@/lib/money'

function assertAdmin(request: NextRequest) {
  const token = request.cookies.get('adminToken')?.value
  return Boolean(token && getSession(token))
}

function parseAmount(value: string) {
  const normalized = value.replace(/'/g, '').replace(',', '.')
  const match = normalized.match(/\d+(?:\.\d{1,2})?/)
  return match ? Number(match[0]) : 0
}

function buildCode() {
  return `MK-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
}

export async function POST(request: NextRequest) {
  if (!assertAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json().catch(() => ({}))
    const requestId = String(body.requestId || '')
    const amount = Number(body.amount || 0)
    const validAmount = amount > 0 ? amount : parseAmount(String(body.subject || ''))

    if (!requestId) return NextResponse.json({ error: 'Anfrage fehlt.' }, { status: 400 })
    if (!validAmount || validAmount <= 0) {
      return NextResponse.json({ error: 'Bitte geben Sie einen gültigen Wunschbetrag ein.' }, { status: 400 })
    }

    const customerRequest = getCustomerRequests().find((item) => item.id === requestId && item.type === 'coupon')
    if (!customerRequest) return NextResponse.json({ error: 'Coupon-Anfrage nicht gefunden.' }, { status: 404 })

    const settings = getShopSettings()
    const canonicalUrl = settings.seo.canonicalUrl || 'http://localhost:3000'
    const coupon = upsertCoupon({
      code: String(body.code || buildCode()),
      title: `Geschenkkarte ${customerRequest.email}`,
      kind: 'voucher',
      discountType: 'fixed',
      value: validAmount,
      balance: validAmount,
      customerEmail: customerRequest.email,
      active: false,
      notes: [
        `Aus Kundenanfrage: ${customerRequest.subject}`,
        customerRequest.message || '',
        'Aktivierung nach Zahlungseingang.',
      ].filter(Boolean).join('\n'),
    })

    const payment = createRewardPayment({
      requestId: customerRequest.id,
      couponId: coupon.id,
      couponCode: coupon.code,
      customerEmail: customerRequest.email,
      customerName: customerRequest.name || '',
      title: `Zahlung für Geschenkkarte ${coupon.code}`,
      amount: validAmount,
      currency: 'CHF',
      note: customerRequest.message || '',
    })

    updateCustomerRequest(customerRequest.id, {
      status: 'in_review',
      payload: {
        ...(customerRequest.payload || {}),
        approvedAmount: validAmount,
        couponId: coupon.id,
        couponCode: coupon.code,
        rewardPaymentId: payment.id,
      },
    })

    const paymentUrl = `${canonicalUrl.replace(/\/$/, '')}/account?tab=rewards&payment=${encodeURIComponent(payment.id)}`
    await sendEmail({
      to: customerRequest.email,
      subject: `Zahlungslink für Ihre Geschenkkarte ${coupon.code}`,
      type: 'customer_request_reply',
      data: {
        customerName: customerRequest.name,
        requestType: 'coupon',
        requestSubject: customerRequest.subject,
        message: [
          `<p>Ihre Anfrage für eine Geschenkkarte / einen Wunschbetrag wurde freigegeben.</p>`,
          `<p><strong>Betrag:</strong> ${formatMoney(validAmount, 'CHF')}<br><strong>Code nach Zahlung:</strong> ${coupon.code}</p>`,
          `<p>Bitte öffnen Sie Ihr Kundenkonto und wählen Sie Ihre gewünschte Zahlungsart: Stripe, SumUp, PayPal, TWINT oder Vorauszahlung.</p>`,
          `<p><a href="${paymentUrl}" style="display:inline-block;border-radius:999px;background:#22c55e;color:#04130b;text-decoration:none;font-weight:900;padding:14px 22px;">Jetzt Zahlung öffnen</a></p>`,
        ].join(''),
      },
    })

    return NextResponse.json({
      coupon,
      payment,
      message: 'Anfrage wurde genehmigt und der Zahlungslink wurde an den Kunden gesendet.',
    })
  } catch (error) {
    console.error('[Approve Coupon Request Error]', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Anfrage konnte nicht genehmigt werden.' }, { status: 500 })
  }
}
