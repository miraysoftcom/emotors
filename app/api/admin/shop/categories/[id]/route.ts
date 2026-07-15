import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { categories } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

function isAdmin(req: NextRequest): boolean {
  const adminToken = req.cookies.get('adminToken')?.value
  return !!adminToken
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!isAdmin(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const id = parseInt(params.id)
    const body = await req.json()

    const result = await db
      .update(categories)
      .set({
        ...body,
        updatedAt: new Date(),
      })
      .where(eq(categories.id, id))
      .returning()

    if (result.length === 0) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error('[Update Category Error]', error)
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!isAdmin(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const id = parseInt(params.id)

    const result = await db.delete(categories).where(eq(categories.id, id)).returning()

    if (result.length === 0) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Delete Category Error]', error)
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 })
  }
}
