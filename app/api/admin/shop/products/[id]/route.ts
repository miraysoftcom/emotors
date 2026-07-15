import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { products } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

function isAdmin(req: NextRequest): boolean {
  return !!req.cookies.get('adminToken')?.value
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!isAdmin(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const id = parseInt(params.id)
    const body = await req.json()

    const result = await db
      .update(products)
      .set({
        ...body,
        updatedAt: new Date(),
      })
      .where(eq(products.id, id))
      .returning()

    if (result.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error('[Update Product Error]', error)
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!isAdmin(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const id = parseInt(params.id)

    const result = await db.delete(products).where(eq(products.id, id)).returning()

    if (result.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Delete Product Error]', error)
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}
