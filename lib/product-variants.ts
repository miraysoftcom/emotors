export interface ProductVariant {
  id?: string
  name: string
  hex?: string
  sku?: string
  ean?: string
  price_delta?: number
  stock_quantity?: number
  active?: boolean
  is_default?: boolean
  delivery_status?: string
  image?: string
}

export interface ProductWithVariants {
  color?: string[] | null
  metadata?: Record<string, unknown> | null
}

export function getActiveProductVariants(product?: ProductWithVariants | null): ProductVariant[] {
  const variants = product?.metadata?.variants
  if (!Array.isArray(variants)) return []

  return variants
    .filter((variant): variant is ProductVariant => Boolean(variant && typeof variant === 'object' && 'name' in variant))
    .filter((variant) => variant.active !== false && String(variant.name || '').trim().length > 0)
}

export function getDefaultProductVariant(product?: ProductWithVariants | null) {
  const variants = getActiveProductVariants(product)
  return variants.find((variant) => variant.is_default) || variants[0] || null
}

export function normalizeColorName(value?: string | null) {
  return String(value || '').trim().toLowerCase()
}

export function sameColorName(left?: string | null, right?: string | null) {
  return normalizeColorName(left) === normalizeColorName(right)
}

export function getColorOptions(product?: ProductWithVariants | null) {
  const variants = getActiveProductVariants(product)
  const variantNames = variants.map((variant) => variant.name).filter(Boolean)
  const colorNames = Array.isArray(product?.color) ? product.color.filter(Boolean) : []
  return Array.from(new Set([...variantNames, ...colorNames]))
}

export function getVariantForColor(product: ProductWithVariants | null | undefined, color?: string | null) {
  if (!color) return null
  return getActiveProductVariants(product).find((variant) => sameColorName(variant.name, color)) || null
}
