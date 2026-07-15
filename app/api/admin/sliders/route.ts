import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { sliders } from '@/lib/db/schema'
import { isAdminRequestAuthorized } from '@/lib/admin-auth'
import { deleteStoredSlider, getStoredSliders, reorderStoredSliders, upsertStoredSlider } from '@/lib/sliders-store'

function assertAdmin(request: NextRequest) {
  return isAdminRequestAuthorized(request.cookies.get('adminToken')?.value)
}

function normalizeDbSlider(row: any) {
  return {
    ...row,
    overlayOpacity: row.overlayOpacity ?? 42,
    textColor: row.textColor ?? '#ffffff',
    backgroundColor: row.backgroundColor ?? '#050b08',
  }
}

export async function GET(request: NextRequest) {
  if (!assertAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    if (db) {
      const data = await db.select().from(sliders).orderBy(sliders.order)
      return NextResponse.json({ sliders: data.map(normalizeDbSlider), source: 'database' })
    }
  } catch (error) {
    console.error('[Admin Sliders DB GET Error]', error)
  }
  return NextResponse.json({ sliders: getStoredSliders(), source: 'local' })
}

export async function POST(request: NextRequest) {
  if (!assertAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  const action = String(body.action || 'upsert')

  if (action === 'reorder') {
    const items = Array.isArray(body.items) ? body.items : []
    if (db) {
      try {
        for (const item of items) {
          await db.update(sliders).set({ order: Number(item.order || 0), updatedAt: new Date() }).where(eq(sliders.id, Number(item.id)))
        }
        const data = await db.select().from(sliders).orderBy(sliders.order)
        return NextResponse.json({ sliders: data.map(normalizeDbSlider), source: 'database' })
      } catch (error) {
        console.error('[Admin Sliders DB Reorder Error]', error)
      }
    }
    return NextResponse.json({ sliders: reorderStoredSliders(items), source: 'local' })
  }

  try {
    if (db) {
      const payload = toDbPayload(body)
      if (body.id) {
        const result = await db.update(sliders).set({ ...payload, updatedAt: new Date() }).where(eq(sliders.id, Number(body.id))).returning()
        return NextResponse.json({ slider: normalizeDbSlider(result[0]), source: 'database' })
      }
      const result = await db.insert(sliders).values(payload).returning()
      return NextResponse.json({ slider: normalizeDbSlider(result[0]), source: 'database' }, { status: 201 })
    }
  } catch (error) {
    console.error('[Admin Sliders DB Save Error]', error)
  }

  const slider = upsertStoredSlider(body)
  return NextResponse.json({ slider, source: 'local' }, { status: body.id ? 200 : 201 })
}

export async function DELETE(request: NextRequest) {
  if (!assertAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const id = Number(request.nextUrl.searchParams.get('id') || 0)
  if (!id) return NextResponse.json({ error: 'ID fehlt.' }, { status: 400 })

  try {
    if (db) {
      await db.delete(sliders).where(eq(sliders.id, id))
      return NextResponse.json({ success: true, source: 'database' })
    }
  } catch (error) {
    console.error('[Admin Sliders DB Delete Error]', error)
  }

  const deleted = deleteStoredSlider(id)
  if (!deleted) return NextResponse.json({ error: 'Slide nicht gefunden.' }, { status: 404 })
  return NextResponse.json({ success: true, slider: deleted, source: 'local' })
}

function toDbPayload(body: any) {
  return {
    title: String(body.title || 'Slide'),
    subtitle: String(body.subtitle || ''),
    description: String(body.description || ''),
    desktopImage: String(body.desktopImage || ''),
    mobileImage: String(body.mobileImage || body.desktopImage || ''),
    ctaText: String(body.ctaText || ''),
    ctaLink: String(body.ctaLink || ''),
    animationType: String(body.animationType || 'zoom'),
    textPosition: String(body.textPosition || 'center'),
    order: Number(body.order || 0),
    active: body.active !== false,
  }
}
