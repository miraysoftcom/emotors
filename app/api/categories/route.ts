import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { categories } from '@/lib/db/schema'
import { getCategories } from '@/lib/categories-store'
import { eq } from 'drizzle-orm'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') || 'main'
    const featured = searchParams.get('featured') === 'true'

    if (!db) {
      const result = getCategories()
        .filter((category) => category.active && category.type === type)
        .filter((category) => !featured || category.featured)
      return NextResponse.json({
        data: result,
        total: result.length,
      })
    }

    let query = db.select().from(categories).where(eq(categories.type, type))

    if (featured) {
      query = query.where(eq(categories.featured, true))
    }

    const result = await query.orderBy(categories.order)

    return NextResponse.json({
      data: result,
      total: result.length,
    })
  } catch (error) {
    console.error('[Fetch Shop Categories Error]', error)
    return NextResponse.json({ data: [], total: 0, error: 'Failed to fetch categories' })
  }
}
