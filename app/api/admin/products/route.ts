import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { products } from '@/lib/db/schema'
import { eq, ilike, and, gte, lte, or } from 'drizzle-orm'
import { createStoredProduct, findStoredProductByUniqueField, getStoredProducts } from '@/lib/products-store'
import { validateProductPayload } from '@/lib/product-validation'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category')
    const status = searchParams.get('status')
    const stock = searchParams.get('stock')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!db) {
      let storedProducts = getStoredProducts()

      if (search) {
        const normalizedSearch = search.toLowerCase()
        storedProducts = storedProducts.filter((product) => (
          product.title.toLowerCase().includes(normalizedSearch) ||
          product.sku?.toLowerCase().includes(normalizedSearch)
        ))
      }

      if (category) {
        storedProducts = storedProducts.filter((product) => product.category_id === parseInt(category))
      }

      if (status === 'active') {
        storedProducts = storedProducts.filter((product) => product.active !== false && product.archived !== true)
      } else if (status === 'archived') {
        storedProducts = storedProducts.filter((product) => product.archived === true)
      }

      if (stock === 'in_stock') {
        storedProducts = storedProducts.filter((product) => (product.stock_quantity || 0) > 0)
      } else if (stock === 'out_of_stock') {
        storedProducts = storedProducts.filter((product) => (product.stock_quantity || 0) <= 0)
      }

      if (minPrice) {
        storedProducts = storedProducts.filter((product) => product.price >= parseInt(minPrice))
      }

      if (maxPrice) {
        storedProducts = storedProducts.filter((product) => product.price <= parseInt(maxPrice))
      }

      return NextResponse.json({
        data: storedProducts.slice(offset, offset + limit),
        total: storedProducts.length,
        limit,
        offset,
      })
    }

    let query = db.select().from(products)

    if (search) {
      query = query.where(ilike(products.title, `%${search}%`))
    }

    if (category) {
      query = query.where(eq(products.category_id, parseInt(category)))
    }

    if (status) {
      if (status === 'active') {
        query = query.where(and(eq(products.active, true), eq(products.archived, false)))
      } else if (status === 'archived') {
        query = query.where(eq(products.archived, true))
      }
    }

    if (stock === 'in_stock') {
      query = query.where(gte(products.stock_quantity, 1))
    } else if (stock === 'out_of_stock') {
      query = query.where(lte(products.stock_quantity, 0))
    }

    if (minPrice) {
      query = query.where(gte(products.price, parseInt(minPrice)))
    }

    if (maxPrice) {
      query = query.where(lte(products.price, parseInt(maxPrice)))
    }

    const allProducts = await query

    return NextResponse.json({
      data: allProducts.slice(offset, offset + limit),
      total: allProducts.length,
      limit,
      offset,
    })
  } catch (error) {
    console.error('[Fetch Products Error]', error)
    return NextResponse.json(
      { error: 'Produkte konnten nicht geladen werden.' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { payload, fieldErrors } = validateProductPayload(body)

    if (Object.keys(fieldErrors).length > 0) {
      return NextResponse.json({
        error: 'Bitte prüfen Sie die markierten Felder.',
        fieldErrors,
      }, { status: 400 })
    }

    if (!db) {
      if (findStoredProductByUniqueField('slug', payload.slug)) {
        return NextResponse.json({
          error: 'Bitte prüfen Sie die markierten Felder.',
          fieldErrors: { slug: 'Dieser URL-Slug wird bereits verwendet.' },
        }, { status: 409 })
      }

      if (payload.sku && findStoredProductByUniqueField('sku', payload.sku)) {
        return NextResponse.json({
          error: 'Bitte prüfen Sie die markierten Felder.',
          fieldErrors: { sku: 'Diese Artikelnummer wird bereits verwendet.' },
        }, { status: 409 })
      }

      if (payload.ean && findStoredProductByUniqueField('ean', payload.ean)) {
        return NextResponse.json({
          error: 'Bitte prüfen Sie die markierten Felder.',
          fieldErrors: { ean: 'Diese EAN/GTIN wird bereits verwendet.' },
        }, { status: 409 })
      }

      const created = createStoredProduct(payload)
      return NextResponse.json(created, { status: 201 })
    }

    const duplicateConditions = [
      eq(products.slug, payload.slug),
      ...(payload.sku ? [eq(products.sku, payload.sku)] : []),
      ...(payload.ean ? [eq(products.ean, payload.ean)] : []),
    ]
    const duplicate = await db
      .select()
      .from(products)
      .where(or(...duplicateConditions))
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
      .insert(products)
      .values({
        ...payload,
        active: payload.active !== false,
        archived: payload.archived === true,
      })
      .returning()

    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    console.error('[Create Product Error]', error)
    return NextResponse.json(
      { error: 'Das Produkt konnte aufgrund eines Serverfehlers nicht gespeichert werden.' },
      { status: 500 }
    )
  }
}
