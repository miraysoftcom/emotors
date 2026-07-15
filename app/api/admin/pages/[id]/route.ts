import { NextRequest, NextResponse } from 'next/server'
import { deleteManagedPage, getManagedPages, upsertManagedPage } from '@/lib/pages-store'

type RouteParams = {
  params: Promise<{ id: string }>
}

export async function GET(_: NextRequest, { params }: RouteParams) {
  const { id } = await params
  const page = getManagedPages().find((item) => item.id === Number(id))
  if (!page) return NextResponse.json({ error: 'Seite nicht gefunden.' }, { status: 404 })
  return NextResponse.json({ page })
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  const { id } = await params
  const body = await req.json()
  const page = upsertManagedPage({ ...body, id: Number(id) })
  if (!page) return NextResponse.json({ error: 'Seite nicht gefunden.' }, { status: 404 })
  return NextResponse.json({ page })
}

export async function DELETE(_: NextRequest, { params }: RouteParams) {
  const { id } = await params
  const deleted = deleteManagedPage(Number(id))
  if (!deleted) return NextResponse.json({ error: 'Seite nicht gefunden.' }, { status: 404 })
  return NextResponse.json({ success: true })
}
