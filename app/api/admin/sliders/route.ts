import { db } from '@/lib/db'
import { sliders } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const data = await db
      .select()
      .from(sliders)
      .orderBy(sliders.position)
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching sliders:', error)
    return NextResponse.json({ error: 'Failed to fetch sliders' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const result = await db.insert(sliders).values(body).returning()
    
    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    console.error('Error creating slider:', error)
    return NextResponse.json({ error: 'Failed to create slider' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...data } = body
    
    const result = await db
      .update(sliders)
      .set(data)
      .where(eq(sliders.id, id))
      .returning()
    
    return NextResponse.json(result[0])
  } catch (error) {
    console.error('Error updating slider:', error)
    return NextResponse.json({ error: 'Failed to update slider' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }
    
    await db
      .delete(sliders)
      .where(eq(sliders.id, parseInt(id)))
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting slider:', error)
    return NextResponse.json({ error: 'Failed to delete slider' }, { status: 500 })
  }
}
