import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { reviews } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { deleteStoredReview, updateStoredReview } from '@/lib/reviews-store'

type RouteParams = {
  params: Promise<{ id: string }>
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { id: rawId } = await params
    const id = parseInt(rawId)
    const data = await req.json()

    if (!db) {
      const updated = updateStoredReview(id, data)
      if (!updated) return NextResponse.json({ error: 'Review not found' }, { status: 404 })
      return NextResponse.json({ success: true, review: updated })
    }

    await db.update(reviews).set(data).where(eq(reviews.id, id))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating review:', error)
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { id: rawId } = await params
    const id = parseInt(rawId)

    if (!db) {
      const deleted = deleteStoredReview(id)
      if (!deleted) return NextResponse.json({ error: 'Review not found' }, { status: 404 })
      return NextResponse.json({ success: true })
    }

    await db.delete(reviews).where(eq(reviews.id, id))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting review:', error)
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
  }
}
