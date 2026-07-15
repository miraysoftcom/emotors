import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { products } from '@/lib/db/schema'
import { and, eq, ne, or } from 'drizzle-orm'
import {
  createStoredProduct,
  deleteStoredProduct,
  findStoredProductByUniqueField,
  getStoredProduct,
  updateStoredProduct,
} from '@/lib/products-store'
import { validateProductPayload } from '@/lib/product-validation'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await params
    const id = parseInt(rawId)

    if (!db) {
      const product = getStoredProduct(id)
      if (!product) {
        return NextResponse.json({ error: 'Produkt wurde nicht gefunden.' }, { status: 404 })
      }
      return NextResponse.json(product)
    }

    const result = await db
      .select()
      .from(products)
      .where(eq(products.id, id))

    if (result.length === 0) {
      return NextResponse.json({ error: 'Produkt wurde nicht gefunden.' }, { status: 404 })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error('[Get Product Error]', error)
    return NextResponse.json({ error: 'Produkt konnte nicht geladen werden.' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json()
    const { id: rawId } = await params
    const id = parseInt(rawId)

    // Handle archive/restore
    if (body.action === 'archive') {
      if (!db) {
        const updated = updateStoredProduct(id, { archived: true, active: false })
        if (!updated) return NextResponse.json({ error: 'Produkt wurde nicht gefunden.' }, { status: 404 })
        return NextResponse.json(updated)
      }

      const result = await db
        .update(products)
        .set({ archived: true, updatedAt: new Date() })
        .where(eq(products.id, id))
        .returning()

      if (result.length === 0) {
        return NextResponse.json({ error: 'Produkt wurde nicht gefunden.' }, { status: 404 })
      }
      return NextResponse.json(result[0])
    }

    if (body.action === 'restore') {
      if (!db) {
        const updated = updateStoredProduct(id, { archived: false, active: true })
        if (!updated) return NextResponse.json({ error: 'Produkt wurde nicht gefunden.' }, { status: 404 })
        return NextResponse.json(updated)
      }

      const result = await db
        .update(products)
        .set({ archived: false, updatedAt: new Date() })
        .where(eq(products.id, id))
        .returning()

      if (result.length === 0) {
        return NextResponse.json({ error: 'Produkt wurde nicht gefunden.' }, { status: 404 })
      }
      return NextResponse.json(result[0])
    }

    // Handle duplicate
    if (body.action === 'duplicate') {
      if (!db) {
        const existingProduct = getStoredProduct(id)
        if (!existingProduct) {
          return NextResponse.json({ error: 'Produkt wurde nicht gefunden.' }, { status: 404 })
        }
        const duplicated = createStoredProduct({
          ...existingProduct,
          slug: `${existingProduct.slug}-copy-${Date.now()}`,
          sku: existingProduct.sku ? `${existingProduct.sku}-COPY` : null,
          ean: null,
          archived: false,
          active: true,
        })
        return NextResponse.json(duplicated, { status: 201 })
      }

      const existingProduct = await db
        .select()
        .from(products)
        .where(eq(products.id, id))

      if (existingProduct.length === 0) {
        return NextResponse.json({ error: 'Produkt wurde nicht gefunden.' }, { status: 404 })
      }

      const productToDuplicate = existingProduct[0]
      const newSlug = `${productToDuplicate.slug}-copy-${Date.now()}`

      const result = await db
        .insert(products)
        .values({
          ...productToDuplicate,
          id: undefined,
          slug: newSlug,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning()

      return NextResponse.json(result[0], { status: 201 })
    }

    const { payload, fieldErrors } = validateProductPayload(body)

    if (Object.keys(fieldErrors).length > 0) {
      return NextResponse.json({
        error: 'Bitte prüfen Sie die markierten Felder.',
        fieldErrors,
      }, { status: 400 })
    }

    if (!db) {
      if (findStoredProductByUniqueField('slug', payload.slug, id)) {
        return NextResponse.json({
          error: 'Bitte prüfen Sie die markierten Felder.',
          fieldErrors: { slug: 'Dieser URL-Slug wird bereits verwendet.' },
        }, { status: 409 })
      }

      if (payload.sku && findStoredProductByUniqueField('sku', payload.sku, id)) {
        return NextResponse.json({
          error: 'Bitte prüfen Sie die markierten Felder.',
          fieldErrors: { sku: 'Diese Artikelnummer wird bereits verwendet.' },
        }, { status: 409 })
      }

      if (payload.ean && findStoredProductByUniqueField('ean', payload.ean, id)) {
        return NextResponse.json({
          error: 'Bitte prüfen Sie die markierten Felder.',
          fieldErrors: { ean: 'Diese EAN/GTIN wird bereits verwendet.' },
        }, { status: 409 })
      }

      const updated = updateStoredProduct(id, payload)
      if (!updated) return NextResponse.json({ error: 'Produkt wurde nicht gefunden.' }, { status: 404 })
      return NextResponse.json(updated)
    }

    const duplicateConditions = [
      eq(products.slug, payload.slug),
      ...(payload.sku ? [eq(products.sku, payload.sku)] : []),
      ...(payload.ean ? [eq(products.ean, payload.ean)] : []),
    ]
    const duplicate = await db
      .select()
      .from(products)
      .where(and(ne(products.id, id), or(...duplicateConditions)))
      .limit(1)

    if (duplicate.length > 0) {
      const existing = duplicate[0]
      const duplicateFieldErrors: Record<string, string> = {}
      if (existing.slug === payload.slug) duplicateFieldErrors.slug = 'Dieser URL-Slug wird bereits verwendet.'
      if (payload.sku && existing.sku === payload.sku) duplicateFieldErrors.sku = 'Diese Artikelnummer wird bereits verwendet.'
      if (payload.ean && existing.ean === payload.ean) duplicateFieldErrors.ean = 'Diese EAN/GTIN wird bereits verwendet.'

      return NextResponse.json({
        error: 'Bitte prüfen Sie die markierten Felder.',
        fieldErrors: duplicateFieldErrors,
      }, { status: 409 })
    }

    const result = await db
      .update(products)
      .set({ ...payload, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning()

    if (result.length === 0) {
      return NextResponse.json({ error: 'Produkt wurde nicht gefunden.' }, { status: 404 })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error('[Update Product Error]', error)
    return NextResponse.json(
      { error: 'Das Produkt konnte aufgrund eines Serverfehlers nicht gespeichert werden.' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await params
    const id = parseInt(rawId)
    const { searchParams } = new URL(request.url)
    const permanent = searchParams.get('permanent') === 'true'

    if (!db) {
      const deleted = deleteStoredProduct(id, permanent)
      if (!deleted) return NextResponse.json({ error: 'Produkt wurde nicht gefunden.' }, { status: 404 })
      return NextResponse.json({ success: true, permanent, archived: !permanent })
    }

    if (permanent) {
      // Permanent hard delete
      const result = await db.delete(products).where(eq(products.id, id)).returning()

      if (result.length === 0) {
        return NextResponse.json({ error: 'Produkt wurde nicht gefunden.' }, { status: 404 })
      }

      return NextResponse.json({ success: true, permanent: true })
    } else {
      // Soft delete (archive)
      const result = await db
        .update(products)
        .set({ archived: true, active: false, updatedAt: new Date() })
        .where(eq(products.id, id))
        .returning()

      if (result.length === 0) {
        return NextResponse.json({ error: 'Produkt wurde nicht gefunden.' }, { status: 404 })
      }

      return NextResponse.json({ success: true, archived: true })
    }
  } catch (error) {
    console.error('[Delete Product Error]', error)
    return NextResponse.json({ error: 'Produkt konnte nicht gelöscht werden.' }, { status: 500 })
  }
}
