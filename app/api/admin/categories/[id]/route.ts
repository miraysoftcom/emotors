import { NextRequest, NextResponse } from 'next/server'
import { updateCategory, deleteCategory } from '@/lib/categories-store'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params
    const id = parseInt(idStr)
    
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
      order 
    } = body

    const result = updateCategory(id, {
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
    })

    if (!result) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('[Update Category Error]', error)
    return NextResponse.json({ error: 'Failed to update category', details: String(error) }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params
    const id = parseInt(idStr)

    const deleted = deleteCategory(id)

    if (!deleted) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Delete Category Error]', error)
    return NextResponse.json({ error: 'Failed to delete category', details: String(error) }, { status: 500 })
  }
}
