'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { CheckCircle2, ShoppingCart, Star, Truck } from 'lucide-react'
import { resolveProductPrice } from '@/lib/product-price'
import { SplitTitle } from '@/components/common/SplitTitle'
import { useCartStore } from '@/lib/store/cartStore'
import { getProductImageBackground } from '@/lib/product-image-background'
import {
  getColorOptions,
  getDefaultProductVariant,
  getVariantForColor,
  type ProductVariant,
} from '@/lib/product-variants'

interface Product {
  id: number
  title: string
  name?: string
  slug: string
  price: number
  discount_price?: number | null
  discount_percentage?: number | null
  monthly_price?: number | null
  monthly_payment?: number | null
  sales_start?: string | Date | null
  sales_end?: string | Date | null
  image?: string | null
  image_url?: string | null
  image_primary?: string | null
  images?: string[]
  stock_quantity?: number | null
  brand?: string | null
  color?: string[] | null
  metadata?: Record<string, unknown> | null
}

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

function getDeadline(products: Product[]) {
  const dates = products
    .map((product) => product.sales_end ? new Date(product.sales_end).getTime() : 0)
    .filter((value) => Number.isFinite(value) && value > Date.now())

  if (dates.length > 0) return Math.min(...dates)

  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0)
  return tomorrow.getTime()
}

function getTimeLeft(deadline: number): TimeLeft {
  const diff = Math.max(0, deadline - Date.now())
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
  }
}

export function CountdownProductsSection({ products, compact = false }: { products: Product[]; compact?: boolean }) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    const deadline = getDeadline(products)
    setTimeLeft(getTimeLeft(deadline))
    const timer = window.setInterval(() => setTimeLeft(getTimeLeft(deadline)), 1000)
    return () => window.clearInterval(timer)
  }, [products])

  if (!products || products.length === 0) return null

  const visibleProducts = products.slice(0, compact ? 1 : 3)

  const content = (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className={compact ? 'mb-5' : 'mb-10 text-center'}
      >
        <p className="mb-3 text-xs font-black uppercase tracking-[0.28em] text-accent">Limited Deal</p>
        <h2 className={`${compact ? 'text-3xl md:text-4xl' : 'text-4xl md:text-5xl'} font-black tracking-tight`}>
          <SplitTitle title="Angebote mit Countdown" />
        </h2>
        <p className="mt-3 text-base text-muted-foreground md:text-lg">
          Limitierte E-Mobility Deals mit direkter Farbauswahl.
        </p>
      </motion.div>

      <div className={`grid gap-5 ${compact ? '' : 'lg:grid-cols-3'}`}>
        {visibleProducts.map((product, index) => (
          compact ? (
            <CompactCountdownDealCard key={product.id} product={product} timeLeft={timeLeft} />
          ) : (
            <CountdownDealCard
              key={product.id}
              product={product}
              timeLeft={timeLeft}
              featured={index === 0}
            />
          )
        ))}
      </div>
    </>
  )

  if (compact) {
    return (
      <div className="h-full overflow-hidden rounded-[2rem] border border-orange-500/55 bg-background/92 p-4 shadow-luxury-md transition-colors dark:border-emerald-400/60 dark:bg-[#07110c]/92 sm:p-5 md:p-6">
        {content}
      </div>
    )
  }

  return (
    <section className="bg-background px-4 py-20 md:px-8">
      <div className="mx-auto max-w-7xl">
        {content}
      </div>
    </section>
  )
}

function CompactCountdownDealCard({ product, timeLeft }: { product: Product; timeLeft: TimeLeft }) {
  const [selectedColor, setSelectedColor] = useState<string | null>(() => getDefaultProductVariant(product)?.name || null)
  const [added, setAdded] = useState(false)
  const { addItem } = useCartStore()

  const defaultVariant = getDefaultProductVariant(product)
  const activeVariant = getVariantForColor(product, selectedColor) || defaultVariant
  const colorOptions = getColorOptions(product)
  const pricing = resolveProductPrice({
    ...product,
    monthly_price: product.monthly_price ?? product.monthly_payment,
  })
  const variantPriceDelta = Number(activeVariant?.price_delta || 0)
  const displayPrice = pricing.effectivePrice + variantPriceDelta
  const baseImage = Array.isArray(product.images) ? product.images.find(Boolean) : ''
  const displayImage = activeVariant?.image || product.image || product.image_url || product.image_primary || baseImage || ''
  const imageBackground = getProductImageBackground(product.metadata)
  const stock = typeof activeVariant?.stock_quantity === 'number' ? activeVariant.stock_quantity : product.stock_quantity
  const inStock = (stock ?? 1) > 0
  const title = product.title || product.name || 'Produkt'
  const savings = pricing.hasDiscount ? pricing.discountPercentage : Math.max(0, Number(product.discount_percentage || 0))

  const addToCart = () => {
    if (!inStock) return
    addItem({
      id: String(product.id),
      title: activeVariant?.name ? `${title} - ${activeVariant.name}` : title,
      price: displayPrice,
      quantity: 1,
      image: displayImage,
      handle: product.slug,
      stock_quantity: stock ?? undefined,
    })
    setAdded(true)
    window.setTimeout(() => setAdded(false), 1800)
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="overflow-hidden rounded-[1.6rem] border border-border/70 bg-card shadow-xl"
    >
      <div className="grid gap-0 lg:grid-cols-[0.92fr_1.08fr]">
        <Link
          href={`/produkte/${product.slug}`}
          className="relative flex min-h-[18rem] items-center justify-center overflow-hidden border-b border-border/60 lg:border-b-0 lg:border-r"
          style={imageBackground.style}
        >
          <div className="absolute left-4 top-4 z-10 flex items-center gap-2 rounded-full border border-black/10 bg-white/90 px-3 py-1.5 text-[0.7rem] font-black uppercase tracking-widest text-black shadow-sm">
            Limited
          </div>
          {savings > 0 && (
            <div className="absolute right-4 top-4 z-10 rounded-full bg-red-600 px-3 py-1.5 text-[0.7rem] font-black text-white shadow-lg">
              -{savings}%
            </div>
          )}
          {displayImage ? (
            <img
              key={displayImage}
              src={displayImage}
              alt={title}
              className="h-full max-h-[19rem] w-full object-contain p-6 transition duration-500 hover:scale-[1.03]"
            />
          ) : (
            <div className="grid min-h-[18rem] place-items-center text-5xl font-black text-accent">MK</div>
          )}
        </Link>

        <div className="flex min-w-0 flex-col p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[0.68rem] font-black uppercase tracking-[0.22em] text-accent">
              {product.brand || 'MK-eMotors'}
            </p>
            <span className={`rounded-full px-3 py-1 text-[0.68rem] font-black uppercase tracking-widest ${
              inStock ? 'bg-accent/12 text-accent' : 'bg-red-500/10 text-red-400'
            }`}>
              {inStock ? 'Verfügbar' : 'Ausverkauft'}
            </span>
          </div>

          <Link href={`/produkte/${product.slug}`} className="group mt-3 block">
            <h3 className="line-clamp-2 text-2xl font-black leading-[1.08] text-foreground transition group-hover:text-accent">
              {title}
            </h3>
          </Link>

          <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
            <span className="flex text-amber-400">
              {[1, 2, 3, 4, 5].map((item) => <Star key={item} className="h-3.5 w-3.5 fill-current" />)}
            </span>
            <span className="font-semibold">Countdown Angebot</span>
          </div>

          <div className="mt-4 rounded-2xl border border-border/60 bg-background/70 p-4">
            <div className="flex flex-wrap items-end gap-3">
              {pricing.hasDiscount && (
                <span className="rounded bg-secondary px-2 py-1 text-sm font-black text-muted-foreground line-through decoration-red-500 decoration-2">
                  {pricing.formattedRegularPrice}
                </span>
              )}
              <span className="text-3xl font-black text-foreground">{formatCHF(displayPrice)}</span>
            </div>
            <CountdownTimerGrid timeLeft={timeLeft} compact />
          </div>

          {colorOptions.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-[0.68rem] font-black uppercase tracking-widest text-muted-foreground">Farbe wählen</p>
              <div className="flex flex-wrap gap-2">
                {colorOptions.slice(0, 5).map((color) => {
                  const variant = getVariantForColor(product, color) as ProductVariant | null
                  const selected = selectedColor === color
                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`inline-flex h-9 items-center gap-2 rounded-full border px-3 text-xs font-black transition ${
                        selected ? 'border-accent bg-accent text-accent-foreground' : 'border-border bg-secondary/70 hover:border-accent/60'
                      }`}
                      aria-label={`Farbe ${color} wählen`}
                    >
                      <span className="h-4 w-4 rounded-full border border-border" style={{ backgroundColor: variant?.hex || '#ffffff' }} />
                      <span className="max-w-20 truncate">{color}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto]">
            <button
              type="button"
              onClick={addToCart}
              disabled={!inStock}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-accent px-5 py-3 font-black text-accent-foreground shadow-lg shadow-accent/20 transition hover:brightness-110 disabled:opacity-50"
            >
              {added ? <CheckCircle2 className="h-5 w-5" /> : <ShoppingCart className="h-5 w-5" />}
              {added ? 'Hinzugefügt' : 'In den Warenkorb'}
            </button>
            <Link
              href={`/produkte/${product.slug}`}
              className="inline-flex items-center justify-center rounded-2xl border border-border bg-secondary/70 px-5 py-3 text-sm font-black text-foreground transition hover:border-accent/60 hover:text-accent"
            >
              Ansehen
            </Link>
          </div>
        </div>
      </div>
    </motion.article>
  )
}

function CountdownTimerGrid({ timeLeft, compact = false }: { timeLeft: TimeLeft; compact?: boolean }) {
  return (
    <div className={`grid grid-cols-4 ${compact ? 'mt-4 gap-2' : 'gap-2 bg-background p-4'}`}>
      {[
        ['Tage', timeLeft.days],
        ['Std', timeLeft.hours],
        ['Min', timeLeft.minutes],
        ['Sek', timeLeft.seconds],
      ].map(([label, value]) => (
        <div key={label} className="rounded-xl bg-red-600 p-2 text-center text-white shadow-md dark:bg-accent dark:text-accent-foreground">
          <p className={`${compact ? 'text-lg' : 'text-xl'} font-black`}>{String(value).padStart(2, '0')}</p>
          <p className="text-[0.58rem] font-black uppercase">{label}</p>
        </div>
      ))}
    </div>
  )
}

function CountdownDealCard({ product, timeLeft, featured }: { product: Product; timeLeft: TimeLeft; featured: boolean }) {
  const [selectedColor, setSelectedColor] = useState<string | null>(() => getDefaultProductVariant(product)?.name || null)
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const { addItem } = useCartStore()

  const defaultVariant = getDefaultProductVariant(product)
  const activeVariant = getVariantForColor(product, selectedColor) || defaultVariant
  const colorOptions = getColorOptions(product)
  const pricing = resolveProductPrice({
    ...product,
    monthly_price: product.monthly_price ?? product.monthly_payment,
  })
  const variantPriceDelta = Number(activeVariant?.price_delta || 0)
  const displayPrice = pricing.effectivePrice + variantPriceDelta
  const baseImage = Array.isArray(product.images) ? product.images.find(Boolean) : ''
  const displayImage = activeVariant?.image || product.image || product.image_url || product.image_primary || baseImage || ''
  const imageBackground = getProductImageBackground(product.metadata)
  const stock = typeof activeVariant?.stock_quantity === 'number' ? activeVariant.stock_quantity : product.stock_quantity
  const inStock = (stock ?? 1) > 0
  const title = product.title || product.name || 'Produkt'
  const monthly = product.monthly_price || product.monthly_payment || Math.max(1, Math.round(displayPrice / 24))

  const addToCart = () => {
    if (!inStock) return
    addItem({
      id: String(product.id),
      title: activeVariant?.name ? `${title} - ${activeVariant.name}` : title,
      price: displayPrice,
      quantity,
      image: displayImage,
      handle: product.slug,
      stock_quantity: stock ?? undefined,
    })
    setAdded(true)
    window.setTimeout(() => setAdded(false), 1800)
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`overflow-hidden rounded-3xl border border-border bg-card shadow-luxury-md ${featured ? 'lg:col-span-3' : ''}`}
    >
      <div className={featured ? 'grid lg:grid-cols-[1.1fr_0.9fr]' : ''}>
        <Link
          href={`/produkte/${product.slug}`}
          className="relative block min-h-80 overflow-hidden border-b border-border lg:border-b-0 lg:border-r"
          style={imageBackground.style}
        >
          <div className="absolute left-5 top-5 z-10 flex flex-wrap gap-2">
            {['CE', 'RoHS', 'COC', 'EN 15194'].map((badge) => (
              <span key={badge} className="rounded bg-white/90 px-2.5 py-1 text-xs font-black text-black shadow-sm">
                {badge}
              </span>
            ))}
          </div>
          {pricing.hasDiscount && (
            <div className="absolute right-5 top-5 z-10 rounded-full bg-red-600 px-4 py-2 text-xs font-black uppercase tracking-widest text-white">
              Sale
            </div>
          )}
          {displayImage ? (
            <img
              key={displayImage}
              src={displayImage}
              alt={title}
              className="h-full min-h-80 w-full object-contain p-8 transition duration-500 hover:scale-[1.03]"
            />
          ) : (
            <div className="grid min-h-80 place-items-center text-6xl">MK</div>
          )}
        </Link>

        <div className="space-y-5 p-5 md:p-7">
          <div>
            <p className="mb-3 text-xs font-black uppercase tracking-[0.25em] text-accent">{product.brand || 'MK-eMotors Dornach'}</p>
            <Link href={`/produkte/${product.slug}`} className="group/title">
              <h3 className="text-2xl font-black leading-tight tracking-tight text-foreground transition group-hover/title:text-accent md:text-4xl">
                {title}
              </h3>
            </Link>
            <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
              <span className="flex text-amber-400">
                {[1, 2, 3, 4, 5].map((item) => <Star key={item} className="h-4 w-4 fill-current" />)}
              </span>
              <span className="font-semibold">Top Angebot</span>
            </div>
          </div>

          <div className="flex flex-wrap items-end gap-3">
            {pricing.hasDiscount && (
              <span className="rounded bg-background/85 px-2 py-1 text-lg font-black text-foreground/80 line-through decoration-red-500 decoration-2 dark:bg-white/10 dark:text-white/75">
                {pricing.formattedRegularPrice}
              </span>
            )}
            <span className="text-3xl font-black text-foreground">
              {formatCHF(displayPrice)}
            </span>
            {pricing.hasDiscount && (
              <span className="rounded-full bg-red-600 px-3 py-1 text-xs font-black uppercase text-white">
                Sale
              </span>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-secondary/60 p-4">
            <p className="text-sm font-black text-foreground">Finanzierung möglich</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Ab <span className="font-black text-accent">{formatCHF(monthly)}</span> / Monat. Individuelle Beratung direkt bei MK-eMotors Dornach.
            </p>
          </div>

          <div className="rounded-2xl border border-amber-400/50 bg-amber-400/10 p-4 text-sm">
            <div className="flex items-start gap-3">
              <Truck className="mt-0.5 h-5 w-5 text-amber-500" />
              <div>
                <p className="font-black text-foreground">Pre-Order / Reservierung möglich</p>
                <p className="mt-1 text-muted-foreground">Liefertermin und Verfügbarkeit werden vor Abschluss bestätigt.</p>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-orange-400/70 dark:border-accent/50">
            <div className="grid grid-cols-[1fr_auto] bg-orange-400 text-black dark:bg-accent">
              <div className="px-4 py-3 text-sm font-black uppercase tracking-widest">Deal Active</div>
              <div className="bg-black px-4 py-3 text-sm font-black text-white">Save {pricing.hasDiscount ? pricing.discountPercentage : 0}%</div>
            </div>
            <CountdownTimerGrid timeLeft={timeLeft} />
          </div>

          {colorOptions.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-black uppercase tracking-widest text-muted-foreground">Farbe</p>
              <div className="flex flex-wrap gap-2">
                {colorOptions.map((color) => {
                  const variant = getVariantForColor(product, color) as ProductVariant | null
                  const selected = selectedColor === color
                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-black transition ${
                        selected ? 'border-accent bg-accent text-accent-foreground' : 'border-border bg-secondary hover:border-accent/60'
                      }`}
                    >
                      <span className="h-4 w-4 rounded-full border border-border" style={{ backgroundColor: variant?.hex || '#ffffff' }} />
                      {color}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          <div className="grid grid-cols-[8rem_1fr] gap-3">
            <div className="flex items-center justify-between rounded-xl border border-border bg-background">
              <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 py-3 text-lg font-black">-</button>
              <span className="font-black">{quantity}</span>
              <button type="button" onClick={() => setQuantity(quantity + 1)} className="px-4 py-3 text-lg font-black">+</button>
            </div>
            <button
              type="button"
              onClick={addToCart}
              disabled={!inStock}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 font-black text-accent-foreground transition hover:brightness-110 disabled:opacity-50"
            >
              {added ? <CheckCircle2 className="h-5 w-5" /> : <ShoppingCart className="h-5 w-5" />}
              {added ? 'Hinzugefügt' : 'In den Warenkorb'}
            </button>
          </div>
        </div>
      </div>
    </motion.article>
  )
}

function formatCHF(value: number) {
  return new Intl.NumberFormat('de-CH', {
    style: 'currency',
    currency: 'CHF',
    maximumFractionDigits: 0,
  }).format(value || 0)
}
