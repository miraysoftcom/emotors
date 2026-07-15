import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import {
  getOrCreateCustomerAccount,
  updateCustomerAccount,
} from '@/lib/customer-account-store'
import { createQrSvgDataUrl } from '@/lib/qr-code'
import {
  buildOtpAuthUri,
  generateTotpSecret,
  verifyTotpCode,
} from '@/lib/totp'

async function getContext(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers }).catch(() => null)
  if (!session?.user?.email) return null
  const account = getOrCreateCustomerAccount({
    userId: session.user.id,
    email: session.user.email,
    name: session.user.name,
  })
  return { session, account }
}

function publicSecurity(account: ReturnType<typeof getOrCreateCustomerAccount>) {
  return {
    twoFactorEnabled: Boolean(account.security?.twoFactorEnabled),
    twoFactorEnabledAt: account.security?.twoFactorEnabledAt || '',
    twoFactorLastVerifiedAt: account.security?.twoFactorLastVerifiedAt || '',
    hasPendingSetup: Boolean(account.security?.twoFactorPendingSecret),
  }
}

export async function GET(request: NextRequest) {
  const context = await getContext(request)
  if (!context) return NextResponse.json({ error: 'Nicht angemeldet.' }, { status: 401 })
  return NextResponse.json({ security: publicSecurity(context.account) })
}

export async function POST(request: NextRequest) {
  const context = await getContext(request)
  if (!context) return NextResponse.json({ error: 'Nicht angemeldet.' }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const action = String(body.action || 'setup')

  if (action === 'setup') {
    const secret = generateTotpSecret()
    const accountName = context.session.user.email || context.account.email
    const otpauthUri = buildOtpAuthUri({
      issuer: 'MK-eMotors Dornach',
      accountName,
      secret,
    })
    const qrDataUrl = await createQrSvgDataUrl(otpauthUri)
    const account = updateCustomerAccount(context.account.key, {
      security: {
        ...context.account.security,
        twoFactorPendingSecret: secret,
      },
    })
    return NextResponse.json({
      security: account ? publicSecurity(account) : publicSecurity(context.account),
      setup: {
        secret,
        otpauthUri,
        qrDataUrl,
        issuer: 'MK-eMotors Dornach',
        accountName,
      },
    })
  }

  if (action === 'verify') {
    const code = String(body.code || '')
    const secret = context.account.security?.twoFactorPendingSecret || context.account.security?.twoFactorSecret || ''
    if (!secret || !verifyTotpCode(secret, code)) {
      return NextResponse.json({ error: 'Der Google Authenticator Code ist ungültig.' }, { status: 400 })
    }
    const now = new Date().toISOString()
    const recoveryCodes = Array.from({ length: 8 }, () => crypto.randomBytes(4).toString('hex').toUpperCase())
    const account = updateCustomerAccount(context.account.key, {
      security: {
        ...context.account.security,
        twoFactorEnabled: true,
        twoFactorSecret: secret,
        twoFactorPendingSecret: '',
        twoFactorEnabledAt: context.account.security?.twoFactorEnabledAt || now,
        twoFactorLastVerifiedAt: now,
        recoveryCodes,
      },
    })
    return NextResponse.json({
      security: account ? publicSecurity(account) : publicSecurity(context.account),
      recoveryCodes,
      message: 'Google Authenticator wurde aktiviert.',
    })
  }

  if (action === 'disable') {
    const code = String(body.code || '')
    const secret = context.account.security?.twoFactorSecret || ''
    if (context.account.security?.twoFactorEnabled && (!secret || !verifyTotpCode(secret, code))) {
      return NextResponse.json({ error: 'Bitte geben Sie einen gültigen Google Authenticator Code ein.' }, { status: 400 })
    }
    const account = updateCustomerAccount(context.account.key, {
      security: {
        ...context.account.security,
        twoFactorEnabled: false,
        twoFactorSecret: '',
        twoFactorPendingSecret: '',
        twoFactorEnabledAt: '',
        twoFactorLastVerifiedAt: '',
        recoveryCodes: [],
      },
    })
    return NextResponse.json({
      security: account ? publicSecurity(account) : publicSecurity(context.account),
      message: 'Google Authenticator wurde deaktiviert.',
    })
  }

  return NextResponse.json({ error: 'Ungültige Aktion.' }, { status: 400 })
}
