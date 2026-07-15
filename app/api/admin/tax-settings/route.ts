import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/admin-auth'
import { getTaxSettings, saveTaxSettings } from '@/lib/tax-settings-store'

function assertAdmin(request: NextRequest) {
  const token = request.cookies.get('adminToken')?.value
  return Boolean(token && getSession(token))
}

export async function GET(request: NextRequest) {
  if (!assertAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return NextResponse.json({ settings: getTaxSettings() })
}

export async function PUT(request: NextRequest) {
  if (!assertAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    return NextResponse.json({ settings: saveTaxSettings(await request.json()) })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'MWST-Einstellungen ungültig.' }, { status: 400 })
  }
}
