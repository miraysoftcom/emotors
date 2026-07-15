import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getPublicAnnouncements } from '@/lib/announcements-store'

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers }).catch(() => null)
  const placement = request.nextUrl.searchParams.get('placement') || undefined
  const email = session?.user?.email || request.nextUrl.searchParams.get('email') || ''
  const announcements = getPublicAnnouncements({
    placement,
    email,
    authenticated: Boolean(session?.user),
  }).map((item) => ({
    ...item,
    isRead: email ? item.readBy.includes(email.trim().toLowerCase()) : false,
  }))

  return NextResponse.json({ announcements })
}
