import { NextRequest, NextResponse } from 'next/server'
import { deleteAnnouncement, getAnnouncements, upsertAnnouncement } from '@/lib/announcements-store'

function isAdmin(request: NextRequest) {
  return Boolean(request.cookies.get('adminToken')?.value)
}

export async function GET(request: NextRequest) {
  if (!isAdmin(request)) return NextResponse.json({ error: 'Nicht autorisiert.' }, { status: 401 })
  return NextResponse.json({ announcements: getAnnouncements() })
}

export async function POST(request: NextRequest) {
  if (!isAdmin(request)) return NextResponse.json({ error: 'Nicht autorisiert.' }, { status: 401 })
  try {
    const announcement = upsertAnnouncement(await request.json())
    return NextResponse.json({ announcement })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Mitteilung konnte nicht gespeichert werden.' }, { status: 400 })
  }
}

export async function DELETE(request: NextRequest) {
  if (!isAdmin(request)) return NextResponse.json({ error: 'Nicht autorisiert.' }, { status: 401 })
  const id = request.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID ist erforderlich.' }, { status: 400 })
  deleteAnnouncement(id)
  return NextResponse.json({ success: true })
}
