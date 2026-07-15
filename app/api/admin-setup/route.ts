import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Try to sign in with the admin credentials to create the account
    const result = await auth.api.signUpEmail({
      body: {
        email: 'info@mk-emotorsdornach.ch',
        password: 'Blevh4np1@@',
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
