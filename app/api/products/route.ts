import { NextRequest, NextResponse } from 'next/server'
import { loadShopProducts } from '@/lib/shop-listing'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const limit = Math.max(1, Math.min(200, Number(searchParams.get('limit') || '50')))
    const offset = Math.max(0, Number(searchParams.get('offset') || '0'))

    const listing = await loadShopProducts({
      search: searchParams.get('search'),
      category: searchParams.get('category'),
      license: searchParams.get('license'),
      sort: searchParams.get('sort'),
      minPrice: searchParams.get('minPrice'),
      maxPrice: searchParams.get('maxPrice'),
      inStock: searchParams.get('inStock'),
    })

    const paginatedProducts = listing.products.slice(offset, offset + limit)

    return NextResponse.json({
      data: paginatedProducts,
      total: listing.products.length,
      limit,
      offset,
      filters: {
        category: listing.selectedCategory?.slug || null,
        license: listing.license,
        sort: listing.sort,
      },
    })
  } catch (error) {
    console.error('[Fetch Shop Products Error]', error)
    return NextResponse.json({ data: [], total: 0, error: 'Failed to fetch products' })
  }
}
