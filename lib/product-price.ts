import { calculateInstallment, formatMoney, normalizeMoneyAmount, type CurrencyCode } from '@/lib/money'

type Metadata = Record<string, unknown>

export interface ProductPriceSource {
  price?: number | null
  discount_price?: number | null
  discount_percentage?: number | null
  monthly_price?: number | null
  sales_start?: string | Date | null
  sales_end?: string | Date | null
  sale_start?: string | Date | null
  sale_end?: string | Date | null
  discount_start?: string | Date | null
  discount_end?: string | Date | null
  discount_active?: boolean | null
  sale_active?: boolean | null
  discount_enabled?: boolean | null
  active?: boolean | null
  archived?: boolean | null
  metadata?: unknown
}

export interface ProductPriceResult {
  regularPrice: number
  discountPrice: number | null
  effectivePrice: number
  salePrice: number
  discountAmount: number
  discountPercentage: number
  hasDiscount: boolean
  formattedRegularPrice: string
  formattedDiscountPrice: string | null
  formattedEffectivePrice: string
  monthlyPrice: number
  formattedMonthlyPrice: string
  startsAt: Date | null
  endsAt: Date | null
}

function metadataValue(product: ProductPriceSource, key: string) {
  const metadata = typeof product.metadata === 'object' && product.metadata !== null
    ? product.metadata as Metadata
    : null

  return metadata && Object.prototype.hasOwnProperty.call(metadata, key)
    ? metadata[key]
    : undefined
}

function readDate(product: ProductPriceSource, keys: Array<keyof ProductPriceSource | string>) {
  for (const key of keys) {
    const raw = key in product ? product[key as keyof ProductPriceSource] : metadataValue(product, key)
    if (!raw) continue
    const date = raw instanceof Date ? raw : new Date(String(raw))
    if (!Number.isNaN(date.getTime())) return date
  }
  return null
}

function readFlag(product: ProductPriceSource, keys: Array<keyof ProductPriceSource | string>) {
  for (const key of keys) {
    const raw = key in product ? product[key as keyof ProductPriceSource] : metadataValue(product, key)
    if (raw === false || raw === 'false' || raw === 0 || raw === '0') return false
    if (raw === true || raw === 'true' || raw === 1 || raw === '1') return true
  }
  return true
}

export function resolveProductPrice(
  product: ProductPriceSource,
  options: { now?: Date; currency?: CurrencyCode; financingMonths?: number } = {}
): ProductPriceResult {
  const now = options.now || new Date()
  const currency = options.currency || 'CHF'
  const regularPrice = normalizeMoneyAmount(product.price)
  const rawDiscountPrice = product.discount_price ?? metadataValue(product, 'discount_price')
  const discountPrice = rawDiscountPrice ? normalizeMoneyAmount(Number(rawDiscountPrice)) : null
  const startsAt = readDate(product, ['sales_start', 'sale_start', 'discount_start', 'discount_starts_at'])
  const endsAt = readDate(product, ['sales_end', 'sale_end', 'discount_end', 'discount_ends_at'])
  const productActive = product.active !== false && product.archived !== true
  const discountEnabled = readFlag(product, ['discount_active', 'sale_active', 'discount_enabled'])
  const startsOk = !startsAt || startsAt.getTime() <= now.getTime()
  const endsOk = !endsAt || endsAt.getTime() >= now.getTime()
  const hasDiscount = Boolean(
    productActive &&
    discountEnabled &&
    discountPrice &&
    regularPrice > 0 &&
    discountPrice > 0 &&
    discountPrice < regularPrice &&
    startsOk &&
    endsOk
  )
  const effectivePrice = hasDiscount ? Number(discountPrice) : regularPrice
  const discountAmount = hasDiscount ? regularPrice - effectivePrice : 0
  const calculatedDiscountPercentage = hasDiscount && regularPrice > 0
    ? Math.round((discountAmount / regularPrice) * 100)
    : 0
  const discountPercentage = hasDiscount
    ? Math.max(1, Number(product.discount_percentage || calculatedDiscountPercentage))
    : 0
  const monthlyPrice = hasDiscount
    ? calculateInstallment(effectivePrice, options.financingMonths || 24)
    : product.monthly_price
      ? normalizeMoneyAmount(product.monthly_price)
      : calculateInstallment(effectivePrice, options.financingMonths || 24)

  return {
    regularPrice,
    discountPrice,
    effectivePrice,
    salePrice: effectivePrice,
    discountAmount,
    discountPercentage,
    hasDiscount,
    formattedRegularPrice: formatMoney(regularPrice, currency),
    formattedDiscountPrice: discountPrice ? formatMoney(discountPrice, currency) : null,
    formattedEffectivePrice: formatMoney(effectivePrice, currency),
    monthlyPrice,
    formattedMonthlyPrice: formatMoney(monthlyPrice, currency),
    startsAt,
    endsAt,
  }
}

export const getEffectivePrice = resolveProductPrice
export const calculateProductPrice = resolveProductPrice
export const resolveDisplayPrice = resolveProductPrice
