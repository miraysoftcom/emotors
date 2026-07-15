import { NextRequest, NextResponse } from 'next/server'
import { deleteFAQ, getFAQById, slugifyFAQ, upsertFAQ } from '@/lib/faq-store'

type RouteParams = {
  params: Promise<{ id: string }>
}

function arrayFromValue(value: unknown) {
  if (Array.isArray(value)) return value.map(String).filter(Boolean)
  if (typeof value === 'string') return value.split(',').map((item) => item.trim()).filter(Boolean)
  return []
}

export async function GET(_: NextRequest, { params }: RouteParams) {
  const { id } = await params
  const faq = getFAQById(Number(id))
  if (!faq) return NextResponse.json({ error: 'FAQ nicht gefunden.' }, { status: 404 })
  return NextResponse.json({ faq })
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const body = await req.json()
    const existing = getFAQById(Number(id))
    if (!existing) return NextResponse.json({ error: 'FAQ nicht gefunden.' }, { status: 404 })

    const nextSlug = body.slug ? slugifyFAQ(body.slug) : existing.slug
    const updated = upsertFAQ({
      ...body,
      id: Number(id),
      slug: nextSlug,
      categorySlug: body.categorySlug || slugifyFAQ(body.category || existing.category),
      title: body.title || body.question || existing.question,
      keywords: body.keywords === undefined ? existing.keywords : arrayFromValue(body.keywords),
      searchTerms: body.searchTerms === undefined ? existing.searchTerms : arrayFromValue(body.searchTerms),
      canonicalUrl: body.canonicalUrl || `/faq#${nextSlug}`,
    })

    return NextResponse.json({ faq: updated })
  } catch (error) {
    console.error('[Admin FAQ Update Error]', error)
    return NextResponse.json({ error: 'FAQ konnte nicht aktualisiert werden.' }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: RouteParams) {
  const { id } = await params
  const deleted = deleteFAQ(Number(id))
  if (!deleted) return NextResponse.json({ error: 'FAQ nicht gefunden.' }, { status: 404 })
  return NextResponse.json({ success: true })
}
