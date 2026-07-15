import { NextRequest, NextResponse } from 'next/server'
import { getAdminLoginSliderSettings, saveAdminLoginSliderSettings } from '@/lib/admin-login-slider-store'

export async function GET() {
  return NextResponse.json(getAdminLoginSliderSettings(), {
    headers: { 'Cache-Control': 'private, no-store' },
  })
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    return NextResponse.json(saveAdminLoginSliderSettings(body), {
      headers: { 'Cache-Control': 'private, no-store' },
    })
  } catch (error) {
    console.error('[Admin Login Slider Error]', error)
    return NextResponse.json({ error: 'Login-Slider konnte nicht gespeichert werden.' }, { status: 500 })
  }
}
