import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { reviews } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { createStoredReview, getReviewSummary } from '@/lib/reviews-store'
import { auth } from '@/lib/auth'
import { getOrCreateCustomerAccount } from '@/lib/customer-account-store'
import { customerPurchasedProduct, formatReviewCustomerName } from '@/lib/review-eligibility'

export async function GET(req: NextRequest) {
  try {
    const productId = req.nextUrl.searchParams.get('productId')
    const numericProductId = parseInt(productId || '')

    if (!productId || Number.isNaN(numericProductId)) {
      return NextResponse.json(
        { error: 'productId is required' },
        { status: 400 }
      )
    }

    const session = await auth.api.getSession({ headers: req.headers }).catch(() => null)
    const account = session?.user?.email
      ? getOrCreateCustomerAccount({
        userId: session.user.id,
        email: session.user.email,
        name: session.user.name,
      })
      : null
    const customerName = account
      ? formatReviewCustomerName({
        firstName: account.firstName,
        lastName: account.lastName,
        name: session?.user?.name,
        email: account.email,
      })
      : ''
    const canReview = Boolean(session?.user?.email && customerPurchasedProduct({
      email: session.user.email,
      userId: session.user.id,
      productId: numericProductId,
    }))
    const eligibility = {
      authenticated: Boolean(session?.user?.email),
      canReview,
      customerName,
    }

    if (!db) {
      const summary = getReviewSummary(numericProductId)
      return NextResponse.json({ ...summary, eligibility })
    }

    const result = await db
      .select()
      .from(reviews)
      .where(eq(reviews.productId, numericProductId))

    const approved = result.filter((review) => review.approved !== false)
    const total = approved.length
    const average = total
      ? approved.reduce((sum, review) => sum + review.rating, 0) / total
      : 0

    return NextResponse.json({ reviews: approved, total, average, eligibility })
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json({ reviews: [] })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers }).catch(() => null)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Bitte melden Sie sich an, um eine Bewertung zu schreiben.' },
        { status: 401 }
      )
    }

    const formData = await req.formData()
    const productId = formData.get('productId') as string
    const numericProductId = parseInt(productId || '')
    const rating = parseInt(formData.get('rating') as string)
    const title = formData.get('title') as string
    const comment = formData.get('comment') as string
    const image = formData.get('image') as File | null

    if (!productId || Number.isNaN(numericProductId) || !rating || rating < 1 || rating > 5 || !title || !comment || comment.length < 10) {
      return NextResponse.json(
        { error: 'Ungültige oder unvollständige Bewertung.' },
        { status: 400 }
      )
    }

    const account = getOrCreateCustomerAccount({
      userId: session.user.id,
      email: session.user.email,
      name: session.user.name,
    })
    const customerName = formatReviewCustomerName({
      firstName: account.firstName,
      lastName: account.lastName,
      name: session.user.name,
      email: session.user.email,
    })
    const verifiedPurchase = customerPurchasedProduct({
      email: session.user.email,
      userId: session.user.id,
      productId: numericProductId,
    })

    if (!verifiedPurchase) {
      return NextResponse.json(
        { error: 'Bewertungen sind nur für Produkte möglich, die Sie bereits gekauft haben.' },
        { status: 403 }
      )
    }

    let imageUrl = null
    if (image) {
      const buffer = await image.arrayBuffer()
      const base64 = Buffer.from(buffer).toString('base64')
      imageUrl = `data:${image.type};base64,${base64}`
    }

    if (!db) {
      createStoredReview({
        productId: numericProductId,
        customerName: customerName.slice(0, 120),
        rating,
        title: title.slice(0, 160),
        comment: comment.slice(0, 3000),
        image: imageUrl,
        verifiedPurchase,
      })
      return NextResponse.json(
        { message: 'Vielen Dank für Ihre Bewertung. Sie wird nach der Prüfung veröffentlicht.' },
        { status: 201 }
      )
    }

    await db.insert(reviews).values({
      productId: numericProductId,
      customerName: customerName.slice(0, 120),
      rating,
      title: title.slice(0, 160),
      comment: comment.slice(0, 3000),
      image: imageUrl,
      approved: false,
    })

    return NextResponse.json(
      { message: 'Vielen Dank für Ihre Bewertung. Sie wird nach der Prüfung veröffentlicht.' },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json(
      { error: 'Failed to submit review' },
      { status: 500 }
    )
  }
}
