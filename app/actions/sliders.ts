'use server'

import { db } from '@/lib/db'
import { sliders } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'

export async function getSliders() {
  try {
    const result = await db
      .select()
      .from(sliders)
      .orderBy(sliders.order)

    return result
  } catch (error) {
    console.error('Error fetching sliders:', error)
    return []
  }
}

export async function getActiveSliders() {
  try {
    const result = await db
      .select()
      .from(sliders)
      .where(eq(sliders.active, true))
      .orderBy(sliders.order)

    return result
  } catch (error) {
    console.error('Error fetching active sliders:', error)
    return []
  }
}

export async function createSlider(data: {
  title: string
  subtitle?: string
  description?: string
  desktopImage?: string
  mobileImage?: string
  ctaText?: string
  ctaLink?: string
  animationType?: string
  textPosition?: string
  order?: number
  active?: boolean
}) {
  try {
    const result = await db.insert(sliders).values(data).returning()
    return result[0]
  } catch (error) {
    console.error('Error creating slider:', error)
    throw error
  }
}

export async function updateSlider(
  id: number,
  data: Partial<{
    title: string
    subtitle: string
    description: string
    desktopImage: string
    mobileImage: string
    ctaText: string
    ctaLink: string
    animationType: string
    textPosition: string
    order: number
    active: boolean
  }>
) {
  try {
    const result = await db
      .update(sliders)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(sliders.id, id))
      .returning()

    return result[0]
  } catch (error) {
    console.error('Error updating slider:', error)
    throw error
  }
}

export async function deleteSlider(id: number) {
  try {
    await db.delete(sliders).where(eq(sliders.id, id))
    return { success: true }
  } catch (error) {
    console.error('Error deleting slider:', error)
    throw error
  }
}

export async function reorderSliders(items: Array<{ id: number; order: number }>) {
  try {
    for (const item of items) {
      await db
        .update(sliders)
        .set({ order: item.order, updatedAt: new Date() })
        .where(eq(sliders.id, item.id))
    }
    return { success: true }
  } catch (error) {
    console.error('Error reordering sliders:', error)
    throw error
  }
}
