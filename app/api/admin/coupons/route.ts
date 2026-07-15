import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/admin-auth'
import { deleteCoupon, getCouponRequests, getCoupons, upsertCoupon } from '@/lib/coupon-store'
import { getRewardPayments } from '@/lib/reward-payment-store'

function assertAdmin(request: NextRequest) {
  const token = request.cookies.get('adminToken')?.value
  if (!token) return false
  return Boolean(getSession(token))
}

export async function GET(request: NextRequest) {
  if (!assertAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return NextResponse.json({ coupons: getCoupons(), requests: getCouponRequests(), payments: getRewardPayments() })
}

export async function POST(request: NextRequest) {
  if (!assertAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const body = await request.json()
    return NextResponse.json({ coupon: upsertCoupon(body) })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Coupon konnte nicht gespeichert werden.' }, { status: 400 })
  }
}

export async function DELETE(request: NextRequest) {
  if (!assertAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const id = request.nextUrl.searchParams.get('id') || ''
  if (!id) return NextResponse.json({ error: 'Coupon ID fehlt.' }, { status: 400 })
  deleteCoupon(id)
  return NextResponse.json({ ok: true })
}
