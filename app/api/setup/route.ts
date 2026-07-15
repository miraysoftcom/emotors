import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { user, account } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    if (!db) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      )
    }

    const email = 'info@mk-emotorsdornach.ch'
    const password = 'Blevh4np1@@'

    // Check if admin user already exists
    const existingUser = await db.query.user.findFirst({
      where: eq(user.email, email),
    })

    if (existingUser) {
      return NextResponse.json({ message: 'Admin user already exists' }, { status: 200 })
    }

    // Create admin user via Better Auth
    const result = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name: 'Admin',
      },
    })

    return NextResponse.json(
      { message: 'Admin user created successfully', user: result },
      { status: 201 }
    )
  } catch (error) {
    console.error('Setup error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Setup failed' },
      { status: 500 }
    )
  }
}
