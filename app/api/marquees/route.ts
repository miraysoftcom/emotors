import { NextRequest, NextResponse } from 'next/server'
import { getMarquees } from '@/lib/marquees-store'

export async function GET(request: NextRequest) {
  const placement = request.nextUrl.searchParams.get('placement')
  const now = Date.now()
  const marquees = getMarquees()
    .filter((item) => item.active)
    .filter((item) => !placement || item.placement === placement)
    .filter((item) => !item.startsAt || new Date(item.startsAt).getTime() <= now)
    .filter((item) => !item.endsAt || new Date(item.endsAt).getTime() >= now)
    .sort((a, b) => a.sortOrder - b.sortOrder)

  return NextResponse.json({ marquees })
}
