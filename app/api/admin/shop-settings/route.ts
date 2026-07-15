import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/admin-auth'
import { getShopSettings, saveShopSettings } from '@/lib/shop-settings-store'

function assertAdmin(request: NextRequest) {
  const token = request.cookies.get('adminToken')?.value
  if (!token) return false
  return Boolean(getSession(token))
}

export async function GET(request: NextRequest) {
  if (!assertAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.json({ settings: getShopSettings() })
}

export async function PUT(request: NextRequest) {
  if (!assertAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const current = getShopSettings()
  const next = {
    ...current,
    ...body,
    general: { ...current.general, ...(body.general || {}) },
    seo: { ...current.seo, ...(body.seo || {}) },
    tracking: { ...current.tracking, ...(body.tracking || {}) },
    ai: {
      ...current.ai,
      ...(body.ai || {}),
      suggestions: body.ai?.suggestions?.length ? body.ai.suggestions : current.ai.suggestions,
    },
    email: { ...current.email, ...(body.email || {}) },
    shop: { ...current.shop, ...(body.shop || {}) },
    payments: {
      ...current.payments,
      ...(body.payments || {}),
      sumup: { ...current.payments.sumup, ...(body.payments?.sumup || {}) },
      stripe: { ...current.payments.stripe, ...(body.payments?.stripe || {}) },
      paypal: { ...current.payments.paypal, ...(body.payments?.paypal || {}) },
      twint: { ...current.payments.twint, ...(body.payments?.twint || {}) },
      bank: { ...current.payments.bank, ...(body.payments?.bank || {}) },
      invoice: { ...current.payments.invoice, ...(body.payments?.invoice || {}) },
      methods: body.payments?.methods || current.payments.methods,
    },
    footer: {
      ...current.footer,
      ...(body.footer || {}),
      columns: body.footer?.columns || current.footer.columns,
      socialLinks: body.footer?.socialLinks || current.footer.socialLinks,
    },
  }

  return NextResponse.json({ settings: saveShopSettings(next) })
}
