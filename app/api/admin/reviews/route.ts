import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { reviews } from '@/lib/db/schema'
import { getStoredReviews } from '@/lib/reviews-store'

export async function GET(req: NextRequest) {
  try {
    if (!db) return NextResponse.json({ reviews: getStoredReviews() })

    const allReviews = await db.select().from(reviews)
    return NextResponse.json({ reviews: allReviews })
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json({ reviews: [] })
  }
}
