import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import {
  deleteCustomerAddress,
  getCustomerInvoices,
  getCustomerOrders,
  getOrCreateCustomerAccount,
  saveCustomerAddress,
  updateCustomerAccount,
} from '@/lib/customer-account-store'

async function getAccountContext(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers }).catch(() => null)
  const email = session?.user?.email || request.nextUrl.searchParams.get('email') || ''
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null
  const account = getOrCreateCustomerAccount({
    userId: session?.user?.id,
    email,
    name: session?.user?.name,
  })
  return { session, account, email }
}

export async function GET(request: NextRequest) {
  const context = await getAccountContext(request)
  if (!context) {
    return NextResponse.json({ error: 'Bitte melden Sie sich an oder geben Sie eine gültige E-Mail-Adresse an.' }, { status: 401 })
  }

  const orders = getCustomerOrders(context.email, context.session?.user?.id)
  const invoices = getCustomerInvoices(context.email, context.session?.user?.id)

  return NextResponse.json({
    user: context.session?.user || null,
    account: context.account,
    orders,
    invoices,
    authenticated: Boolean(context.session?.user),
  }, {
    headers: {
      'Cache-Control': 'private, no-store, max-age=0',
    },
  })
}

export async function PATCH(request: NextRequest) {
  const context = await getAccountContext(request)
  if (!context) {
    return NextResponse.json({ error: 'Nicht angemeldet.' }, { status: 401 })
  }

  const body = await request.json()
  const action = String(body.action || 'profile')

  if (action === 'address') {
    const postalCode = String(body.address?.postalCode || '')
    if (!/^\d{4}$/.test(postalCode)) {
      return NextResponse.json({ error: 'Bitte geben Sie eine gültige Schweizer Postleitzahl mit 4 Ziffern ein.' }, { status: 400 })
    }
    if (!body.address?.street || !body.address?.city) {
      return NextResponse.json({ error: 'Straße und Ort sind erforderlich.' }, { status: 400 })
    }
    const account = saveCustomerAddress(context.account.key, body.address)
    return NextResponse.json({ account })
  }

  if (action === 'delete-address') {
    const account = deleteCustomerAddress(context.account.key, Number(body.id))
    return NextResponse.json({ account })
  }

  const allowedTheme = body.theme === 'hell' ? 'hell' : body.theme === 'dunkel' ? 'dunkel' : undefined
  const account = updateCustomerAccount(context.account.key, {
    firstName: body.firstName,
    lastName: body.lastName,
    phone: body.phone,
    company: body.company,
    preferredLanguage: body.preferredLanguage === 'en' || body.preferredLanguage === 'tr' ? body.preferredLanguage : 'de',
    theme: allowedTheme,
    notifications: body.notifications,
  })

  const response = NextResponse.json({ account })
  if (allowedTheme) {
    response.cookies.set('theme', allowedTheme, {
      path: '/',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365,
    })
  }
  return response
}
