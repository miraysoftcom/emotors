import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/admin-auth'
import { deleteMarquee, upsertMarquee } from '@/lib/marquees-store'

function assertAdmin(request: NextRequest) {
  const token = request.cookies.get('adminToken')?.value
  if (!token) return false
  return Boolean(getSession(token))
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!assertAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const item = upsertMarquee({ ...(await request.json()), id: Number(id) })
  if (!item) return NextResponse.json({ error: 'Marquee nicht gefunden.' }, { status: 404 })
  return NextResponse.json({ marquee: item })
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!assertAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  if (!deleteMarquee(Number(id))) return NextResponse.json({ error: 'Marquee nicht gefunden.' }, { status: 404 })
  return NextResponse.json({ success: true })
}
