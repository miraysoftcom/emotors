import { NextRequest, NextResponse } from 'next/server'
import { getFAQCategories, listFAQs } from '@/lib/faq-store'

export const revalidate = 300
export const dynamic = 'force-dynamic'

function readBoolean(value: string | null) {
  return value === '1' || value === 'true'
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page = Number(searchParams.get('page') || '1')
    const limit = Number(searchParams.get('limit') || '30')
    const category = searchParams.get('category') || undefined
    const query = searchParams.get('q') || searchParams.get('search') || undefined

    const result = listFAQs({
      query,
      category,
      page,
      limit,
      status: searchParams.get('status') || 'active',
      featured: readBoolean(searchParams.get('featured')),
      homepage: readBoolean(searchParams.get('homepage')),
      popular: readBoolean(searchParams.get('popular')),
      footer: readBoolean(searchParams.get('footer')),
      product: readBoolean(searchParams.get('product')),
      blog: readBoolean(searchParams.get('blog')),
    })

    const categories = getFAQCategories().filter((categoryItem) => categoryItem.active)

    return NextResponse.json(
      { ...result, categories },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=86400',
        },
      },
    )
  } catch (error) {
    console.error('Error fetching FAQs:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
