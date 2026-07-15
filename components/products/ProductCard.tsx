'use client'

import Link from 'next/link'
import { Heart, ShoppingBag, Zap, Gauge, Navigation, Scale } from 'lucide-react'
import { useEffect, useState, memo } from 'react'
import type { MouseEvent } from 'react'
import { motion } from 'framer-motion'
import { resolveProductPrice } from '@/lib/product-price'
import { useCartStore } from '@/lib/store/cartStore'
import { useFavoritesStore } from '@/lib/store/favoritesStore'
import { getProductImageBackground } from '@/lib/product-image-background'
import {
  getColorOptions,
  getDefaultProductVariant,
  getVariantForColor,
  type ProductVariant,
} from '@/lib/product-variants'

interface ProductCardProps {
  product?: {
    id: number
    title: string
    slug: string
    price: number
    discount_price?: number | null
    discount_percentage?: number | null
    monthly_price?: number | null
    sales_start?: string | Date | null
    sales_end?: string | Date | null
    image?: string | null
    stock_quantity?: number | null
    bestseller?: boolean
    new_product?: boolean
    featured?: boolean
    power_watts?: number | null
    range_km?: number | null
    max_speed?: number | null
    brand?: string | null
    color?: string[] | null
    metadata?: Record<string, unknown> | null
  }
  id?: number
  title?: string
  slug?: string
  price?: number
  discount_price?: number | null
  discount_percentage?: number | null
  monthly_price?: number | null
  sales_start?: string | Date | null
  sales_end?: string | Date | null
  image?: string | null
  images?: string[]
  stock_quantity?: number | null
  bestseller?: boolean
  new_product?: boolean
  featured?: boolean
  power_watts?: number | null
  range_km?: number | null
  max_speed?: number | null
  brand?: string | null
  color?: string[] | null
  metadata?: Record<string, unknown> | null
}

function ProductCardComponent(props: ProductCardProps) {
  const p = props.product || props
  const [isAdded, setIsAdded] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [compareActive, setCompareActive] = useState(false)
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const { addItem } = useCartStore()
  const { toggleFavorite, isFavorite } = useFavoritesStore()

  const defaultVariant = getDefaultProductVariant(p)
  const activeVariant = getVariantForColor(p, selectedColor) || defaultVariant
  const colorOptions = getColorOptions(p)
  const pricing = resolveProductPrice(p)
  const variantPriceDelta = Number(activeVariant?.price_delta || 0)
  const effectivePrice = pricing.effectivePrice + variantPriceDelta
  const monthlyInCHF = p.monthly_price || pricing.hasDiscount ? pricing.formattedMonthlyPrice : null
  const variantStock = activeVariant?.stock_quantity
  const inStock = typeof variantStock === 'number' ? variantStock > 0 : (p.stock_quantity ?? 1) > 0
  const hasSpecs = p.power_watts || p.range_km || p.max_speed
  const productId = String(p.id)
  const favorite = mounted ? isFavorite(productId) : false
  const imageBackground = getProductImageBackground(p.metadata)
  const displayImage = activeVariant?.image || p.image || ''
  const displayTitle = activeVariant?.name ? `${p.title || 'Produkt'} - ${activeVariant.name}` : p.title || 'Produkt'

  useEffect(() => {
    setMounted(true)
    if (!selectedColor && defaultVariant?.name) setSelectedColor(defaultVariant.name)
    try {
      const raw = window.localStorage.getItem('mk-compare-products')
      const items = raw ? JSON.parse(raw) as Array<{ id: string }> : []
      setCompareActive(items.some((item) => item.id === productId))
    } catch {
      setCompareActive(false)
    }
  }, [defaultVariant?.name, productId, selectedColor])

  const addToCart = (event: MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    if (!inStock) return
    addItem({
      id: productId,
      title: displayTitle,
      price: effectivePrice,
      quantity: 1,
      image: displayImage,
      handle: p.slug,
      stock_quantity: typeof variantStock === 'number' ? variantStock : p.stock_quantity ?? undefined,
    })
    setIsAdded(true)
    window.setTimeout(() => setIsAdded(false), 1800)
  }

  const toggleWishlist = (event: MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    toggleFavorite({
      id: productId,
      title: p.title || 'Produkt',
      price: effectivePrice,
      image: displayImage,
      handle: p.slug,
      stock_quantity: typeof variantStock === 'number' ? variantStock : p.stock_quantity ?? undefined,
    })
  }

  const toggleCompare = (event: MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    try {
      const raw = window.localStorage.getItem('mk-compare-products')
      const items = raw ? JSON.parse(raw) as Array<Record<string, unknown>> : []
      const exists = items.some((item) => item.id === productId)
      const next = exists
        ? items.filter((item) => item.id !== productId)
        : [
            ...items,
            {
              id: productId,
              title: p.title || 'Produkt',
              slug: p.slug,
              price: effectivePrice,
              image: displayImage,
              power_watts: p.power_watts || null,
              range_km: p.range_km || null,
              max_speed: p.max_speed || null,
              brand: p.brand || null,
            },
          ].slice(-4)
      window.localStorage.setItem('mk-compare-products', JSON.stringify(next))
      window.dispatchEvent(new Event('mk-compare-products-changed'))
      setCompareActive(!exists)
    } catch {
      setCompareActive(false)
    }
  }

  return (
    <Link href={`/produkte/${p.slug}`}>
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.3 }}
        className="group relative bg-card rounded-xl overflow-hidden border border-border hover:border-accent/50 transition-all duration-300 hover:shadow-xl flex flex-col h-full"
      >
        {/* Image Container */}
        <div
          className="relative h-72 overflow-hidden bg-gradient-to-br from-secondary to-secondary/50"
          style={imageBackground.style}
        >
          {displayImage ? (
            <motion.img
              key={displayImage}
              initial={{ scale: 1 }}
              whileHover={{ scale: 1.08 }}
              transition={{ duration: 0.4 }}
              src={displayImage}
              alt={p.title}
              className="h-full w-full object-contain p-6"
              onLoad={() => setImageLoaded(true)}
              onError={(e) => {
                ;(e.target as HTMLImageElement).style.display = 'none'
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
              Kein Bild
            </div>
          )}

          {/* Overlay on Hover */}
          <motion.div
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-black/20 flex items-end justify-end p-3 gap-2"
          >
            <button
              onClick={addToCart}
              className="p-3 bg-popover/95 hover:bg-surface-hover border border-border rounded-full transition-all duration-300 shadow-lg"
              aria-label="In den Warenkorb"
            >
              <ShoppingBag size={20} className="text-foreground" />
            </button>
            <button
              onClick={toggleWishlist}
              className="p-3 bg-popover/95 hover:bg-surface-hover border border-border rounded-full transition-all duration-300 shadow-lg"
              aria-label="Favorit umschalten"
            >
              <Heart
                size={20}
                className={favorite ? 'fill-destructive text-destructive' : 'text-foreground'}
              />
            </button>
            <button
              onClick={toggleCompare}
              className="p-3 bg-popover/95 hover:bg-surface-hover border border-border rounded-full transition-all duration-300 shadow-lg"
              aria-label="Produkt vergleichen"
            >
              <Scale size={20} className={compareActive ? 'text-accent' : 'text-foreground'} />
            </button>
          </motion.div>

          {/* Badges Container */}
          <div className="absolute top-3 left-3 right-3 flex flex-wrap gap-2">
            {p.new_product && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-accent/90 backdrop-blur-sm text-accent-foreground px-3 py-1.5 rounded-full text-xs font-bold tracking-wide"
              >
                NEU
              </motion.div>
            )}
            {p.bestseller && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-amber-500/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-bold tracking-wide"
              >
                BESTSELLER
              </motion.div>
            )}
            {p.featured && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-blue-500/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-bold tracking-wide"
              >
                EMPFOHLEN
              </motion.div>
            )}
          </div>

          {/* Stock Status */}
          {!inStock && (
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
              <span className="text-white font-bold text-lg">Ausverkauft</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 space-y-3 flex-1 flex flex-col">
          {/* Brand */}
          {p.brand && (
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-widest">
              {p.brand}
            </p>
          )}

          {/* Product Name */}
          <h3 className="font-bold text-foreground line-clamp-2 group-hover:text-accent transition-colors text-sm md:text-base">
            {p.title}
          </h3>

          {colorOptions.length > 0 && (
            <div className="flex flex-wrap items-center gap-2" aria-label="Farbe auswählen">
              {colorOptions.slice(0, 6).map((color) => {
                const variant = getVariantForColor(p, color) as ProductVariant | null
                const selected = selectedColor === color
                return (
                  <button
                    key={color}
                    type="button"
                    onClick={(event) => {
                      event.preventDefault()
                      event.stopPropagation()
                      setSelectedColor(color)
                    }}
                    className={`group/color inline-flex h-8 items-center gap-2 rounded-full border px-2.5 text-xs font-bold transition ${
                      selected ? 'border-accent bg-accent/12 text-accent' : 'border-border bg-secondary/70 text-muted-foreground hover:border-accent/50 hover:text-foreground'
                    }`}
                    title={variant?.image ? `${color} Bild anzeigen` : color}
                    aria-label={`${color} auswählen`}
                  >
                    <span
                      className="h-4 w-4 rounded-full border border-border"
                      style={{ backgroundColor: variant?.hex || '#ffffff' }}
                    />
                    <span className="max-w-16 truncate">{color}</span>
                  </button>
                )
              })}
            </div>
          )}

          {/* Specs Preview */}
          {hasSpecs && (
            <div className="grid grid-cols-3 gap-2 py-2 border-t border-b border-border/50">
              {p.power_watts && (
                <div className="flex flex-col items-center text-center">
                  <Zap size={16} className="text-accent mb-0.5" />
                  <span className="text-xs font-semibold text-foreground">{p.power_watts}W</span>
                  <span className="text-xs text-muted-foreground">Power</span>
                </div>
              )}
              {p.range_km && (
                <div className="flex flex-col items-center text-center">
                  <Navigation size={16} className="text-accent mb-0.5" />
                  <span className="text-xs font-semibold text-foreground">{p.range_km}km</span>
                  <span className="text-xs text-muted-foreground">Range</span>
                </div>
              )}
              {p.max_speed && (
                <div className="flex flex-col items-center text-center">
                  <Gauge size={16} className="text-accent mb-0.5" />
                  <span className="text-xs font-semibold text-foreground">{p.max_speed}km/h</span>
                  <span className="text-xs text-muted-foreground">Speed</span>
                </div>
              )}
            </div>
          )}

          {/* Pricing */}
          <div className="space-y-1 pt-1">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-foreground">
                {new Intl.NumberFormat('de-CH', { style: 'currency', currency: 'CHF', maximumFractionDigits: 0 }).format(effectivePrice)}
              </span>
              {pricing.hasDiscount && (
                <span className="rounded bg-background/80 px-1.5 py-0.5 text-xs font-black text-foreground/80 line-through decoration-red-500 decoration-2 dark:bg-white/10 dark:text-white/75">
                  {pricing.formattedRegularPrice}
                </span>
              )}
              {pricing.hasDiscount && (
                <span className="rounded-full bg-red-600 px-2 py-0.5 text-xs font-bold text-white">
                  -{pricing.discountPercentage}%
                </span>
              )}
            </div>
            {monthlyInCHF && (
              <p className="text-xs text-muted-foreground">
                ab <span className="font-semibold text-accent">{monthlyInCHF}</span>/Monat
              </p>
            )}
          </div>

          {/* Add to Cart Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={(e) => {
              addToCart(e)
            }}
            disabled={!inStock}
            className="w-full mt-auto py-2.5 px-3 bg-accent text-accent-foreground rounded-lg font-semibold text-sm hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <ShoppingBag size={16} />
            {isAdded ? 'Hinzugefügt' : 'In den Warenkorb'}
          </motion.button>
        </div>
      </motion.div>
    </Link>
  )
}

export const ProductCard = memo(ProductCardComponent)
