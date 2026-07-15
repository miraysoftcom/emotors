import { NextRequest, NextResponse } from 'next/server'
import { getManagedPages, upsertManagedPage } from '@/lib/pages-store'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const query = (searchParams.get('q') || '').toLowerCase()
  const pages = getManagedPages().filter((page) => (
    !query || [page.title, page.slug, page.language].join(' ').toLowerCase().includes(query)
  ))
  return NextResponse.json({ pages })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  if (!body.title || !body.slug) {
    return NextResponse.json({ error: 'Titel und Slug sind erforderlich.' }, { status: 400 })
  }
  const page = upsertManagedPage(body)
  return NextResponse.json({ page }, { status: 201 })
}
