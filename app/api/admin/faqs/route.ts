import { NextRequest, NextResponse } from 'next/server'
import { listFAQs, slugifyFAQ, upsertFAQ } from '@/lib/faq-store'

function arrayFromValue(value: unknown) {
  if (Array.isArray(value)) return value.map(String).filter(Boolean)
  if (typeof value === 'string') return value.split(',').map((item) => item.trim()).filter(Boolean)
  return []
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const result = listFAQs({
    query: searchParams.get('q') || undefined,
    category: searchParams.get('category') || undefined,
    status: searchParams.get('status') || 'all',
    page: Number(searchParams.get('page') || '1'),
    limit: Number(searchParams.get('limit') || '50'),
  })

  return NextResponse.json(result)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    if (!body.question || !body.answer || !body.category) {
      return NextResponse.json(
        { error: 'Frage, Antwort und Kategorie sind erforderlich.' },
        { status: 400 },
      )
    }

    const slug = body.slug ? slugifyFAQ(body.slug) : slugifyFAQ(body.question)
    const item = upsertFAQ({
      ...body,
      slug,
      categorySlug: body.categorySlug || slugifyFAQ(body.category),
      title: body.title || body.question,
      keywords: arrayFromValue(body.keywords),
      searchTerms: arrayFromValue(body.searchTerms),
      canonicalUrl: body.canonicalUrl || `/faq#${slug}`,
      status: body.status || 'active',
    })

    return NextResponse.json({ faq: item }, { status: 201 })
  } catch (error) {
    console.error('[Admin FAQ Create Error]', error)
    return NextResponse.json({ error: 'FAQ konnte nicht gespeichert werden.' }, { status: 500 })
  }
}
