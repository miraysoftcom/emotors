export interface ProductPayload {
  title: string
  slug: string
  price: number
  discount_price?: number | null
  discount_percentage?: number | null
  monthly_price?: number | null
  sales_start?: string | null
  sales_end?: string | null
  short_description?: string | null
  description?: string | null
  long_description?: string | null
  category_id?: number | null
  subcategory_id?: number | null
  brand?: string | null
  sku?: string | null
  ean?: string | null
  image?: string | null
  images?: string[]
  power_watts?: number | null
  battery_capacity?: string | null
  range_km?: number | null
  max_speed?: number | null
  weight_kg?: number | null
  charge_time?: string | null
  max_load?: string | null
  warranty?: string | null
  delivery_time?: string | null
  color?: string[]
  availability?: string
  stock_quantity?: number
  financing_available?: boolean
  license_required?: string | null
  license_type?: string | null
  condition?: string
  seo_title?: string | null
  seo_description?: string | null
  featured?: boolean
  bestseller?: boolean
  new_product?: boolean
  recommended?: boolean
  active?: boolean
  archived?: boolean
  specs?: Record<string, unknown>
  metadata?: Record<string, unknown>
}

export interface ProductValidationResult {
  payload: ProductPayload
  fieldErrors: Record<string, string>
}

const availabilityValues = new Set([
  'in_stock',
  'low_stock',
  'out_of_stock',
  'pre_order',
  'coming_soon',
  'discontinued',
])

function cleanString(value: unknown) {
  if (typeof value !== 'string') return ''
  return value.trim()
}

function nullableString(value: unknown) {
  const cleaned = cleanString(value)
  return cleaned ? cleaned : null
}

function toNumber(value: unknown) {
  if (value === '' || value === null || value === undefined) return 0
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function toOptionalNumber(value: unknown) {
  const parsed = toNumber(value)
  return parsed > 0 ? parsed : null
}

function normalizeSlug(value: unknown) {
  return cleanString(value)
    .toLowerCase()
    .replace(/[ä]/g, 'ae')
    .replace(/[ö]/g, 'oe')
    .replace(/[ü]/g, 'ue')
    .replace(/[ß]/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function normalizeSku(value: unknown) {
  return cleanString(value).replace(/\s+/g, '-').toUpperCase()
}

function normalizeEan(value: unknown) {
  return cleanString(value).replace(/\s+/g, '')
}

function stringArray(value: unknown) {
  if (!Array.isArray(value)) return []
  return value.map((entry) => cleanString(entry)).filter(Boolean)
}

export function validateProductPayload(raw: Record<string, unknown>): ProductValidationResult {
  const title = cleanString(raw.title)
  const slug = normalizeSlug(raw.slug || raw.title)
  const sku = normalizeSku(raw.sku)
  const ean = normalizeEan(raw.ean)
  const price = toNumber(raw.price)
  const discountPrice = toOptionalNumber(raw.discount_price)
  const stockQuantity = toNumber(raw.stock_quantity)
  const minimumStock = toNumber(raw.minimum_stock)

  const fieldErrors: Record<string, string> = {}

  if (!title) fieldErrors.title = 'Bitte geben Sie einen Produktnamen ein.'
  if (!slug) fieldErrors.slug = 'Bitte geben Sie einen gültigen URL-Slug ein.'
  if (price <= 0) fieldErrors.price = 'Der Verkaufspreis muss größer als 0 sein.'
  if (discountPrice && discountPrice >= price) {
    fieldErrors.discount_price = 'Der Aktionspreis muss niedriger als der reguläre Preis sein.'
  }
  if (ean && !/^[0-9]{8,14}$/.test(ean)) {
    fieldErrors.ean = 'Bitte geben Sie eine gültige EAN/GTIN mit 8 bis 14 Ziffern ein.'
  }
  if (stockQuantity < 0) fieldErrors.stock_quantity = 'Der Lagerbestand darf nicht negativ sein.'
  if (minimumStock < 0) fieldErrors.minimum_stock = 'Der Mindestbestand darf nicht negativ sein.'

  const rawAvailability = cleanString(raw.availability)
  const availability = availabilityValues.has(rawAvailability)
    ? rawAvailability
    : stockQuantity <= 0
      ? 'out_of_stock'
      : minimumStock > 0 && stockQuantity <= minimumStock
        ? 'low_stock'
        : 'in_stock'

  return {
    fieldErrors,
    payload: {
      title,
      slug,
      price,
      discount_price: discountPrice,
      discount_percentage: toOptionalNumber(raw.discount_percentage),
      monthly_price: toOptionalNumber(raw.monthly_price),
      sales_start: nullableString(raw.sales_start),
      sales_end: nullableString(raw.sales_end),
      short_description: nullableString(raw.short_description),
      description: nullableString(raw.description),
      long_description: nullableString(raw.long_description),
      category_id: toOptionalNumber(raw.category_id),
      subcategory_id: toOptionalNumber(raw.subcategory_id),
      brand: nullableString(raw.brand),
      sku: sku || null,
      ean: ean || null,
      image: nullableString(raw.image),
      images: stringArray(raw.images),
      power_watts: toOptionalNumber(raw.power_watts),
      battery_capacity: nullableString(raw.battery_capacity),
      range_km: toOptionalNumber(raw.range_km),
      max_speed: toOptionalNumber(raw.max_speed),
      weight_kg: toOptionalNumber(raw.weight_kg),
      charge_time: nullableString(raw.charge_time),
      max_load: nullableString(raw.max_load),
      warranty: nullableString(raw.warranty),
      delivery_time: nullableString(raw.delivery_time),
      color: stringArray(raw.color),
      availability,
      stock_quantity: stockQuantity,
      financing_available: raw.financing_available !== false,
      license_required: nullableString(raw.license_required),
      license_type: nullableString(raw.license_type),
      condition: cleanString(raw.condition) || 'new',
      seo_title: nullableString(raw.seo_title),
      seo_description: nullableString(raw.seo_description),
      featured: raw.featured === true,
      bestseller: raw.bestseller === true,
      new_product: raw.new_product === true,
      recommended: raw.recommended === true,
      active: raw.active !== false,
      archived: raw.archived === true,
      specs: typeof raw.specs === 'object' && raw.specs !== null ? raw.specs as Record<string, unknown> : {},
      metadata: {
        ...(typeof raw.metadata === 'object' && raw.metadata !== null ? raw.metadata as Record<string, unknown> : {}),
        product_type: cleanString(raw.product_type) || 'scooter',
        minimum_stock: minimumStock,
        variants: Array.isArray(raw.variants) ? raw.variants : [],
        legal: typeof raw.legal === 'object' && raw.legal !== null ? raw.legal : {},
        shipping: typeof raw.shipping === 'object' && raw.shipping !== null ? raw.shipping : {},
        custom_properties: Array.isArray(raw.custom_properties) ? raw.custom_properties : [],
        package_contents: Array.isArray(raw.package_contents) ? raw.package_contents : [],
      },
    },
  }
}
