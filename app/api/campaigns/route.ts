import { NextRequest, NextResponse } from 'next/server'
import { getActiveCampaigns, recordCampaignInteraction, type CampaignPlacement } from '@/lib/special-days-campaign-store'

export async function GET(request: NextRequest) {
  const placement = request.nextUrl.searchParams.get('placement') as CampaignPlacement | null
  const pagePath = request.nextUrl.searchParams.get('pagePath') || '/'
  const device = request.nextUrl.searchParams.get('device') as 'mobile' | 'desktop' | 'all' | null
  const campaigns = getActiveCampaigns({
    placement: placement || undefined,
    pagePath,
    device: device || 'all',
  })
  return NextResponse.json({ campaigns })
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}))
  const id = String(body.id || '')
  const type = String(body.type || '')
  if (!id || !['impressions', 'clicks', 'closes'].includes(type)) {
    return NextResponse.json({ error: 'Invalid interaction.' }, { status: 400 })
  }
  const campaign = recordCampaignInteraction(id, type as 'impressions' | 'clicks' | 'closes')
  return NextResponse.json({ campaign })
}
