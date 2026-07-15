import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { user, account } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { assertSetupAllowed } from '@/lib/setup-guard'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const blocked = assertSetupAllowed(req)
    if (blocked) return blocked

    if (!db) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      )
    }

    const email = process.env.ADMIN_EMAIL || ''
    const password = process.env.ADMIN_PASSWORD || ''
    if (!email || !password) {
      return NextResponse.json(
        { error: 'ADMIN_EMAIL and ADMIN_PASSWORD are required for setup.' },
        { status: 400 }
      )
    }

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
