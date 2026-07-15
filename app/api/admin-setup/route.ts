import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { assertSetupAllowed } from '@/lib/setup-guard'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const blocked = assertSetupAllowed(request)
    if (blocked) return blocked

    const email = process.env.ADMIN_EMAIL || ''
    const password = process.env.ADMIN_PASSWORD || ''
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'ADMIN_EMAIL and ADMIN_PASSWORD are required for setup.' },
        { status: 400 }
      )
    }

    // Try to sign in with the admin credentials to create the account
    const result = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name: 'Admin',
      },
    } as any)

    return NextResponse.json({
      success: true,
      message: 'Admin setup completed. Try logging in now.',
      result,
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: error.message || 'Setup failed',
      error: error,
    })
  }
}
