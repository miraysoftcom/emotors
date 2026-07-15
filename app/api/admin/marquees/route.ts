import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/admin-auth'
import { getMarquees, upsertMarquee } from '@/lib/marquees-store'

function assertAdmin(request: NextRequest) {
  const token = request.cookies.get('adminToken')?.value
  if (!token) return false
  return Boolean(getSession(token))
}

export async function GET(request: NextRequest) {
  if (!assertAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return NextResponse.json({ marquees: getMarquees().sort((a, b) => a.sortOrder - b.sortOrder) })
}

export async function POST(request: NextRequest) {
  if (!assertAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const item = upsertMarquee(await request.json())
  return NextResponse.json({ marquee: item }, { status: 201 })
}
