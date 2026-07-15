import { NextRequest, NextResponse } from 'next/server'
import { getPool } from '@/lib/db'
import {
  findCustomerAccountByEmail,
  findCustomerAccountByPhone,
} from '@/lib/customer-account-store'

function normalizeEmail(value: unknown) {
  return String(value || '').trim().toLowerCase()
}

function normalizePhone(value: unknown) {
  return String(value || '').replace(/[^\d+]/g, '').trim()
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}))
  const email = normalizeEmail(body.email)
  const phone = normalizePhone(body.phone)

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Bitte geben Sie eine gültige E-Mail-Adresse ein.' }, { status: 400 })
  }

  if (findCustomerAccountByEmail(email)) {
    return NextResponse.json(
      { field: 'email', error: 'Diese E-Mail-Adresse ist bereits in unserem System registriert.' },
      { status: 409 }
    )
  }

  const pool = getPool()
  if (pool) {
    const result = await pool.query('select id from "user" where lower(email) = lower($1) limit 1', [email]).catch(() => null)
    if (result && result.rowCount && result.rowCount > 0) {
      return NextResponse.json(
        { field: 'email', error: 'Diese E-Mail-Adresse ist bereits in unserem System registriert.' },
        { status: 409 }
      )
    }
  }

  if (phone && findCustomerAccountByPhone(phone)) {
    return NextResponse.json(
      { field: 'phone', error: 'Diese Telefonnummer ist bereits in unserem System registriert.' },
      { status: 409 }
    )
  }

  return NextResponse.json({ available: true })
}
