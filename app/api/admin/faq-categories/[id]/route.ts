import { NextRequest, NextResponse } from 'next/server'
import { deleteFAQCategory, getFAQCategories, slugifyFAQ, upsertFAQCategory } from '@/lib/faq-store'

type RouteParams = {
  params: Promise<{ id: string }>
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const body = await req.json()
    const existing = getFAQCategories().find((category) => category.id === Number(id))
    if (!existing) return NextResponse.json({ error: 'Kategorie nicht gefunden.' }, { status: 404 })

    const category = upsertFAQCategory({
      ...body,
      id: Number(id),
      slug: body.slug ? slugifyFAQ(body.slug) : existing.slug,
    })

    return NextResponse.json({ category })
  } catch (error) {
    console.error('[Admin FAQ Category Update Error]', error)
    return NextResponse.json({ error: 'Kategorie konnte nicht aktualisiert werden.' }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: RouteParams) {
  const { id } = await params
  const deleted = deleteFAQCategory(Number(id))
  if (!deleted) return NextResponse.json({ error: 'Kategorie nicht gefunden.' }, { status: 404 })
  return NextResponse.json({ success: true })
}
