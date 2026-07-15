'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { resolveProductPrice } from '@/lib/product-price'
import { SplitTitle } from '@/components/common/SplitTitle'
import { getProductImageBackground } from '@/lib/product-image-background'
import {
  getColorOptions,
  getDefaultProductVariant,
  getVariantForColor,
  type ProductVariant,
} from '@/lib/product-variants'

interface Product {
  id: number
  name: string
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
  color?: string[] | null
  metadata?: Record<string, unknown> | null
}

interface ProductShowcaseProps {
  products: Product[]
  title: string
}

export function ProductShowcase({ products, title }: ProductShowcaseProps) {
  const displayProducts = products.slice(0, 10)
  const marqueeProducts = displayProducts.length > 3 ? [...displayProducts, ...displayProducts] : displayProducts

  return (
    <section className="relative py-24 bg-background overflow-hidden">
      <div className="mx-auto max-w-7xl px-6">
        {/* Section Title */}
        <div className="mb-20 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-6xl font-black tracking-tighter mb-6"
          >
            <SplitTitle title={title} />
          </motion.h2>
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: 80 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="h-1 bg-accent mx-auto"
          />
        </div>

        {/* Products Slider */}
        <div className="group relative -mx-6 overflow-hidden px-6">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-background to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-background to-transparent" />
          <div className="product-showcase-marquee flex w-max gap-8 overflow-visible py-2 group-hover:[animation-play-state:paused]">
            {marqueeProducts.map((product, index) => (
              <div key={`${product.id}-${index}`} className="w-[19rem] shrink-0 md:w-[22rem]">
                <ProductShowcaseCard product={product} index={index % displayProducts.length} />
              </div>
            ))}
          </div>
        </div>

        {/* View All */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center mt-16"
        >
          <Link
            href="/produkte"
            className="inline-block px-8 py-4 border-2 border-primary text-primary font-semibold rounded-full hover:bg-primary hover:text-primary-foreground transition-all duration-300"
          >
            Alle Produkte Ansehen
          </Link>
        </motion.div>
      </div>
      <style jsx>{`
        .product-showcase-marquee {
          animation: product-showcase-slide 52s linear infinite;
        }

        @keyframes product-showcase-slide {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .product-showcase-marquee {
            animation: none;
            overflow-x: auto;
            width: 100%;
          }
        }
      `}</style>
    </section>
  )
}

function ProductShowcaseCard({ product, index }: { product: Product; index: number }) {
  const [selectedColor, setSelectedColor] = useState<string | null>(() => getDefaultProductVariant(product)?.name || null)
  const defaultVariant = getDefaultProductVariant(product)
  const activeVariant = getVariantForColor(product, selectedColor) || defaultVariant
  const colorOptions = getColorOptions(product)
  const galleryImage = Array.isArray(product.images) ? product.images.find(Boolean) : null
  const displayImage = activeVariant?.image || galleryImage || product.image || product.image_url || product.image_primary
  const imageBackground = getProductImageBackground(product.metadata)
  const pricing = resolveProductPrice({
    ...product,
    monthly_price: product.monthly_price ?? product.monthly_payment,
  })
  const variantPriceDelta = Number(activeVariant?.price_delta || 0)
  const displayPrice = pricing.effectivePrice + variantPriceDelta
  const isImagePath = Boolean(displayImage && (displayImage.startsWith('/') || displayImage.startsWith('http')))

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="group"
    >
      <div className="overflow-hidden rounded-3xl bg-card shadow-luxury-md transition-all duration-500 hover:shadow-luxury-xl">
        <Link href={`/produkte/${product.slug}`}>
          <div
            className="relative flex aspect-square items-center justify-center overflow-hidden bg-gradient-to-br from-background to-secondary"
            style={imageBackground.style}
          >
            {isImagePath ? (
              <motion.img
                key={displayImage}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.6 }}
                src={displayImage || ''}
                alt={product.name}
                className="h-full w-full object-contain p-8"
              />
            ) : (
              <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.6 }} className="text-8xl">
                {displayImage || 'MK'}
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 flex items-center justify-center bg-black/30"
            >
              <span className="text-lg font-semibold text-white">Details anzeigen</span>
            </motion.div>
          </div>
        </Link>

        <div className="p-8">
          <Link href={`/produkte/${product.slug}`}>
            <h3 className="mb-2 text-2xl font-black tracking-tight text-primary transition-colors group-hover:text-accent">
              {product.name}
            </h3>
          </Link>

          {colorOptions.length > 0 && (
            <div className="mb-5 flex flex-wrap gap-2">
              {colorOptions.slice(0, 6).map((color) => {
                const variant = getVariantForColor(product, color) as ProductVariant | null
                const selected = selectedColor === color
                return (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-black transition ${
                      selected ? 'border-accent bg-accent text-accent-foreground' : 'border-border bg-secondary hover:border-accent/60'
                    }`}
                    aria-label={`${color} auswählen`}
                  >
                    <span className="h-4 w-4 rounded-full border border-border" style={{ backgroundColor: variant?.hex || '#ffffff' }} />
                    {color}
                  </button>
                )
              })}
            </div>
          )}

          <div className="mb-6 flex items-baseline gap-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-baseline gap-3">
                {pricing.hasDiscount && (
                  <span className="rounded bg-background/80 px-2 py-1 text-sm font-black text-foreground/80 line-through decoration-red-500 decoration-2 dark:bg-white/10 dark:text-white/75">
                    {pricing.formattedRegularPrice}
                  </span>
                )}
                <span className="text-3xl font-black text-primary">
                  {formatCHF(displayPrice)}
                </span>
                {pricing.hasDiscount && (
                  <span className="rounded-full bg-red-600 px-2.5 py-1 text-xs font-bold text-white">
                    -{pricing.discountPercentage}%
                  </span>
                )}
              </div>
              {(product.monthly_payment || product.monthly_price || pricing.hasDiscount) && (
                <span className="text-sm text-muted-foreground">
                  ab {pricing.formattedMonthlyPrice}/Monat
                </span>
              )}
            </div>
          </div>

          <Link
            href={`/produkte/${product.slug}`}
            className="block w-full rounded-full bg-accent px-6 py-3 text-center font-semibold text-accent-foreground transition-all duration-300 hover:shadow-lg"
          >
            Mehr Erfahren
          </Link>
        </div>
      </div>
    </motion.div>
  )
}

function formatCHF(value: number) {
  return new Intl.NumberFormat('de-CH', {
    style: 'currency',
    currency: 'CHF',
    maximumFractionDigits: 0,
  }).format(value || 0)
}
