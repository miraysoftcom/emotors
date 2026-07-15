import { db } from '@/lib/db'
import { user } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    if (!db) {
      return NextResponse.json(
        { success: false, error: 'Database not configured' },
        { status: 503 }
      )
    }

    const existing = await db
      .select()
      .from(user)
      .where(eq(user.email, 'info@mk-emotorsdornach.ch'))

    if (existing.length > 0) {
      return NextResponse.json({
        success: true,
        message: 'Admin user already exists. Use credentials to sign in.',
        email: 'info@mk-emotorsdornach.ch',
      })
    }

    // Create the admin user
    await db.insert(user).values({
      id: 'admin-001',
      name: 'Admin',
      email: 'info@mk-emotorsdornach.ch',
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    return NextResponse.json({
      success: true,
      message: 'Admin user created. Now use the Sign Up form to create account with credentials.',
      instructions: 'Go to /sign-in, create a new account with: Email: info@mk-emotorsdornach.ch, Password: Blevh4np1@@',
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
