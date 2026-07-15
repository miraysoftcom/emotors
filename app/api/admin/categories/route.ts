import { NextRequest, NextResponse } from 'next/server'
import { getCategories, createCategory } from '@/lib/categories-store'

export async function GET(req: NextRequest) {
  try {
    const result = getCategories()
    return NextResponse.json(result)
  } catch (error) {
    console.error('[Get Categories Error]', error)
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      slug,
      description,
      long_description,
      type,
      license_required,
      icon,
      image,
      banner,
      color,
      featured,
      active,
      order,
    } = body

    if (!name || !slug) {
      return NextResponse.json({ error: 'Name und Slug erforderlich' }, { status: 400 })
    }

    const result = createCategory({
      name,
      slug,
      description: description || '',
      long_description: long_description || '',
      type: type || 'main',
      license_required: license_required || false,
      icon: icon || '',
      image: image || '',
      banner: banner || '',
      color: color || '#000000',
      featured: featured || false,
      active: active !== undefined ? active : true,
      sort_priority: 0,
      order: order || 0,
      parent_id: null,
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('[Create Category Error]', error)
    return NextResponse.json({ error: 'Failed to create category', details: String(error) }, { status: 500 })
  }
}
