import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { markAnnouncementState } from '@/lib/announcements-store'

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers }).catch(() => null)
  const body = await request.json()
  const id = String(body.id || '')
  const email = String(session?.user?.email || body.email || '').trim().toLowerCase()
  const action = body.action === 'dismiss' ? 'dismiss' : 'read'

  if (!id || !email) {
    return NextResponse.json({ error: 'Mitteilung und E-Mail sind erforderlich.' }, { status: 400 })
  }

  markAnnouncementState(id, email, action)
  return NextResponse.json({ success: true })
}
