import { NextRequest, NextResponse } from 'next/server'
import { getFAQCategories, slugifyFAQ, upsertFAQCategory } from '@/lib/faq-store'

export async function GET() {
  return NextResponse.json({ categories: getFAQCategories() })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    if (!body.name) {
      return NextResponse.json({ error: 'Kategoriename ist erforderlich.' }, { status: 400 })
    }

    const category = upsertFAQCategory({
      ...body,
      slug: body.slug ? slugifyFAQ(body.slug) : slugifyFAQ(body.name),
      active: body.active !== false,
    })

    return NextResponse.json({ category }, { status: 201 })
  } catch (error) {
    console.error('[Admin FAQ Category Create Error]', error)
    return NextResponse.json({ error: 'Kategorie konnte nicht gespeichert werden.' }, { status: 500 })
  }
}
