import { db } from '@/lib/db'
import { user } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { assertSetupAllowed } from '@/lib/setup-guard'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const blocked = assertSetupAllowed(request)
    if (blocked) return blocked

    if (!db) {
      return NextResponse.json(
        { success: false, error: 'Database not configured' },
        { status: 503 }
      )
    }

    const email = process.env.ADMIN_EMAIL || ''
    if (!email) {
      return NextResponse.json(
        { success: false, error: 'ADMIN_EMAIL is required for setup.' },
        { status: 400 }
      )
    }

    const existing = await db
      .select()
      .from(user)
      .where(eq(user.email, email))

    if (existing.length > 0) {
      return NextResponse.json({
        success: true,
        message: 'Admin user already exists. Use credentials to sign in.',
        email,
      })
    }

    // Create the admin user
    await db.insert(user).values({
      id: 'admin-001',
      name: 'Admin',
      email,
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    return NextResponse.json({
      success: true,
      message: 'Admin user created. Now use the configured admin credentials to sign in.',
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
