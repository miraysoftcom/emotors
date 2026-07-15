import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { categories } from '@/lib/db/schema'
import { eq, asc } from 'drizzle-orm'

// Admin authentication check
function isAdmin(req: NextRequest): boolean {
  const adminToken = req.cookies.get('adminToken')?.value
  return !!adminToken
}

export async function GET(req: NextRequest) {
  try {
    const allCategories = await db
      .select()
      .from(categories)
      .orderBy(asc(categories.sort_priority), asc(categories.order))

    return NextResponse.json(allCategories)
  } catch (error) {
    console.error('[Get Categories Error]', error)
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!isAdmin(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const {
      name,
      slug,
      description,
      long_description,
      icon,
      image,
      banner,
      color,
      parent_id,
      featured,
      active,
      seo_title,
      seo_description,
      sort_priority,
      license_required,
    } = body

    if (!name || !slug) {
      return NextResponse.json({ error: 'Name and slug required' }, { status: 400 })
    }

    const result = await db
      .insert(categories)
      .values({
        name,
        slug,
        description,
        long_description,
        icon,
        image,
        banner,
        color: color || '#000000',
        parent_id,
        featured: featured || false,
        active: active !== false,
        seo_title,
        seo_description,
        sort_priority: sort_priority || 0,
        license_required: license_required || false,
      })
      .returning()

    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    console.error('[Create Category Error]', error)
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
  }
}
