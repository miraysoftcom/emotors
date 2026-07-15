import { NextRequest, NextResponse } from 'next/server'
import { getHeroSettings, saveHeroSettings } from '@/lib/hero-settings-store'

export async function GET() {
  return NextResponse.json(getHeroSettings(), {
    headers: { 'Cache-Control': 'private, no-store' },
  })
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const action = String(body.action || 'draft')
    const settings = saveHeroSettings(body.settings || body, action === 'publish')
    return NextResponse.json(settings, {
      headers: { 'Cache-Control': 'private, no-store' },
    })
  } catch (error) {
    console.error('[Hero Settings Error]', error)
    return NextResponse.json({ error: 'Hero-Einstellungen konnten nicht gespeichert werden.' }, { status: 500 })
  }
}
