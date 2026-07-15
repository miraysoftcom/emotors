import { and, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { categories, products } from '@/lib/db/schema'
import { getCategories as getStoredCategories } from '@/lib/categories-store'
import { getStoredProducts, type StoredProduct } from '@/lib/products-store'
import { resolveProductPrice } from '@/lib/product-price'

export type LicenseFilter = 'ohne' | 'mit' | 'all'

export interface ShopCategory {
  id: number
  name: string
  slug: string
  description?: string | null
  image?: string | null
  banner?: string | null
  color?: string | null
  metadata?: Record<string, unknown> | null
  active?: boolean | null
  order?: number | null
  sort_priority?: number | null
}

export interface ShopProduct {
  id: number
  title: string
  slug: string
  price: number
  discount_price?: number | null
  discount_percentage?: number | null
  monthly_price?: number | null
  sales_start?: string | Date | null
  sales_end?: string | Date | null
  metadata?: Record<string, unknown> | null
  image?: string | null
  stock_quantity?: number | null
  bestseller?: boolean | null
  new_product?: boolean | null
  featured?: boolean | null
  power_watts?: number | null
  range_km?: number | null
  max_speed?: number | null
  brand?: string | null
  category_id?: number | null
  license_required?: string | boolean | null
  active?: boolean | null
  archived?: boolean | null
  createdAt?: Date | string | null
}

export interface ShopListingParams {
  category?: string | null
  license?: string | null
  sort?: string | null
  search?: string | null
  minPrice?: string | null
  maxPrice?: string | null
  inStock?: string | null
}

export function normalizeLicenseFilter(value?: string | null): LicenseFilter {
  if (!value) return 'all'
  const normalized = value.trim().toLowerCase()
  if (normalized === 'ohne') return 'ohne'
  if (normalized === 'mit') return 'mit'
  return 'all'
}

export function productMatchesLicense(product: Pick<ShopProduct, 'license_required'>, filter: LicenseFilter) {
  if (filter === 'all') return true

  const raw = product.license_required
  const normalized = String(raw ?? '').trim().toLowerCase()
  const isNotRequired = (
    raw === false ||
    normalized === '' ||
    normalized === 'false' ||
    normalized === 'no' ||
    normalized === 'none' ||
    normalized === 'ohne' ||
    normalized === 'not_required' ||
    normalized === 'no_license'
  )
  const isRequired = (
    raw === true ||
    normalized === 'true' ||
    normalized === 'yes' ||
    normalized === 'mit' ||
    normalized === 'required' ||
    normalized === 'license_required'
  )

  if (filter === 'ohne') return isNotRequired
  if (filter === 'mit') return isRequired
  return true
}

function categorySlugToLicense(slug?: string | null): LicenseFilter | null {
  if (slug === 'ohne-fuehrerschein') return 'ohne'
  if (slug === 'mit-fuehrerschein') return 'mit'
  return null
}

export async function loadShopCategories(): Promise<ShopCategory[]> {
  try {
    if (db) {
      const result = await db
        .select()
        .from(categories)
        .where(eq(categories.active, true))
        .limit(200)

      return result
        .map((category) => ({
          id: category.id,
          name: category.name,
          slug: category.slug,
          description: category.description,
          image: category.image,
          banner: category.banner,
          color: category.color,
          metadata: category.metadata as Record<string, unknown> | null,
          active: category.active,
          order: category.order,
          sort_priority: category.sort_priority,
        }))
        .sort((a, b) => (a.order || 0) - (b.order || 0))
    }
  } catch (error) {
    console.error('[Shop Categories DB Error]', error)
  }

  return getStoredCategories()
    .filter((category) => category.active)
    .map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      image: category.image,
      banner: category.banner,
      color: category.color,
      metadata: category.metadata,
      active: category.active,
      order: category.order,
      sort_priority: category.sort_priority,
    }))
}

export async function loadShopProducts(params: ShopListingParams = {}) {
  const allCategories = await loadShopCategories()
  const categoryParam = params.category?.trim()
  const selectedCategory = categoryParam
    ? allCategories.find((category) => category.slug === categoryParam || String(category.id) === categoryParam)
    : undefined

  const categoryLicense = categorySlugToLicense(selectedCategory?.slug || categoryParam)
  const license = categoryLicense || normalizeLicenseFilter(params.license)
  const search = (params.search || '').trim().toLowerCase()
  const minPrice = Number(params.minPrice || '0')
  const maxPrice = Number(params.maxPrice || '0')
  const onlyInStock = params.inStock === 'true'

  let allProducts: ShopProduct[] = []

  try {
    if (db) {
      allProducts = await db
        .select()
        .from(products)
        .where(and(eq(products.active, true), eq(products.archived, false)))
        .limit(1000)
    }
  } catch (error) {
    console.error('[Shop Products DB Error]', error)
  }

  if (allProducts.length === 0) {
    allProducts = getStoredProducts().map((product: StoredProduct) => ({
      ...product,
      license_required: product.license_required,
    }))
  }

  let filtered = allProducts.filter((product) => product.active !== false && product.archived !== true)

  if (selectedCategory && !categorySlugToLicense(selectedCategory.slug)) {
    filtered = filtered.filter((product) => product.category_id === selectedCategory.id)
  }

  filtered = filtered.filter((product) => productMatchesLicense(product, license))

  if (search) {
    filtered = filtered.filter((product) => (
      [
        product.title,
        product.slug,
        product.brand,
      ].join(' ').toLowerCase().includes(search)
    ))
  }

  if (minPrice > 0) filtered = filtered.filter((product) => resolveProductPrice(product).effectivePrice >= minPrice)
  if (maxPrice > 0) filtered = filtered.filter((product) => resolveProductPrice(product).effectivePrice <= maxPrice)
  if (onlyInStock) filtered = filtered.filter((product) => (product.stock_quantity || 0) > 0)

  sortShopProducts(filtered, params.sort || 'featured')

  return {
    products: filtered,
    categories: allCategories,
    selectedCategory,
    license,
    sort: params.sort || 'featured',
  }
}

export function sortShopProducts(items: ShopProduct[], sort: string) {
  if (sort === 'price-low' || sort === 'price_asc') {
    items.sort((a, b) => resolveProductPrice(a).effectivePrice - resolveProductPrice(b).effectivePrice)
    return
  }
  if (sort === 'price-high' || sort === 'price_desc') {
    items.sort((a, b) => resolveProductPrice(b).effectivePrice - resolveProductPrice(a).effectivePrice)
    return
  }
  if (sort === 'newest') {
    items.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    return
  }
  if (sort === 'bestseller' || sort === 'popular') {
    items.sort((a, b) => Number(Boolean(b.bestseller)) - Number(Boolean(a.bestseller)))
    return
  }
  items.sort((a, b) => {
    if (a.featured && !b.featured) return -1
    if (!a.featured && b.featured) return 1
    if (a.bestseller && !b.bestseller) return -1
    if (!a.bestseller && b.bestseller) return 1
    return 0
  })
}
