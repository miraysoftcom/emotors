import { NextRequest, NextResponse } from 'next/server'
import { isAdminRequestAuthorized } from '@/lib/admin-auth'
import {
  campaignTemplates,
  deleteCampaign,
  getCampaigns,
  swissSpecialDays,
  upsertCampaign,
} from '@/lib/special-days-campaign-store'

function assertAdmin(request: NextRequest) {
  return isAdminRequestAuthorized(request.cookies.get('adminToken')?.value)
}

export async function GET(request: NextRequest) {
  if (!assertAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return NextResponse.json({
    campaigns: getCampaigns(),
    templates: campaignTemplates,
    holidays: swissSpecialDays,
  })
}

export async function POST(request: NextRequest) {
  if (!assertAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const campaign = upsertCampaign(await request.json())
    return NextResponse.json({ campaign }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Kampagne konnte nicht gespeichert werden.' }, { status: 400 })
  }
}

export async function DELETE(request: NextRequest) {
  if (!assertAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const id = request.nextUrl.searchParams.get('id') || ''
  const campaign = deleteCampaign(id)
  if (!campaign) return NextResponse.json({ error: 'Kampagne nicht gefunden.' }, { status: 404 })
  return NextResponse.json({ campaign })
}
