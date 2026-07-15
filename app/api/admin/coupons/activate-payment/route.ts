import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/admin-auth'
import { activateCoupon, getCoupon } from '@/lib/coupon-store'
import { getRewardPayments, updateRewardPayment } from '@/lib/reward-payment-store'
import { sendEmail } from '@/lib/email/service'

function assertAdmin(request: NextRequest) {
  const token = request.cookies.get('adminToken')?.value
  return Boolean(token && getSession(token))
}

export async function POST(request: NextRequest) {
  if (!assertAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json().catch(() => ({}))
    const paymentId = String(body.paymentId || '')
    if (!paymentId) return NextResponse.json({ error: 'Zahlungsanforderung fehlt.' }, { status: 400 })

    const payment = getRewardPayments().find((item) => item.id === paymentId)
    if (!payment) return NextResponse.json({ error: 'Zahlungsanforderung nicht gefunden.' }, { status: 404 })

    const couponBefore = getCoupon(payment.couponId)
    if (!couponBefore) return NextResponse.json({ error: 'Coupon nicht gefunden.' }, { status: 404 })

    const coupon = activateCoupon(payment.couponId)
    const updatedPayment = updateRewardPayment(payment.id, {
      status: 'paid',
      paidAt: new Date().toISOString(),
    })

    await sendEmail({
      to: payment.customerEmail,
      subject: `Ihr Gutschein ${payment.couponCode} ist aktiv`,
      type: 'customer_request_reply',
      data: {
        customerName: payment.customerName,
        requestType: 'coupon',
        requestSubject: payment.title,
        message: [
          '<p>Vielen Dank. Ihre Zahlung wurde geprüft und bestätigt.</p>',
          `<p>Ihr Gutschein / Coupon ist jetzt aktiv:</p>`,
          `<p style="font-size:22px;font-weight:900;letter-spacing:2px;">${payment.couponCode}</p>`,
          '<p>Sie können den Code ab sofort im Checkout verwenden.</p>',
        ].join(''),
      },
    })

    return NextResponse.json({
      coupon,
      payment: updatedPayment,
      message: `Zahlung wurde bestätigt und Coupon ${payment.couponCode} wurde aktiviert.`,
    })
  } catch (error) {
    console.error('[Activate Coupon Payment Error]', error)
    return NextResponse.json({ error: 'Zahlung konnte nicht aktiviert werden.' }, { status: 500 })
  }
}
