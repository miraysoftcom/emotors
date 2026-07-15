'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useState } from 'react'
import { resolveProductPrice } from '@/lib/product-price'
import { getProductImageBackground } from '@/lib/product-image-background'
import { getColorOptions, getDefaultProductVariant, getVariantForColor, type ProductVariant } from '@/lib/product-variants'

interface Product {
  id: number
  title: string
  slug: string
  short_description?: string
  price: number
  discount_price?: number | null
  discount_percentage?: number
  sales_start?: string | Date | null
  sales_end?: string | Date | null
  image?: string | null
  image_url?: string
  image_primary?: string | null
  images?: string[]
  color?: string[] | null
  metadata?: Record<string, unknown> | null
}

export function ProductOfTheDaySection({ product }: { product: Product }) {
  const [selectedColor, setSelectedColor] = useState<string | null>(() => getDefaultProductVariant(product)?.name || null)
  const activeVariant = getVariantForColor(product, selectedColor) || getDefaultProductVariant(product)
  const pricing = resolveProductPrice(product)
  const displayImage = activeVariant?.image || product.image || product.image_url || product.image_primary || (Array.isArray(product.images) ? product.images.find(Boolean) : '')
  const imageBackground = getProductImageBackground(product.metadata)
  const colorOptions = getColorOptions(product)

  return (
    <section className="py-20 px-4 md:px-8 bg-secondary">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="grid md:grid-cols-2 gap-12 items-center">
          {displayImage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative h-96 overflow-hidden rounded-lg"
              style={imageBackground.style}
            >
              <img src={displayImage} alt={product.title} className="h-full w-full object-contain p-8" />
              {pricing.hasDiscount && (
                <div className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-full font-bold text-lg">
                  -{pricing.discountPercentage}%
                </div>
              )}
            </motion.div>
          )}
          
          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-6">
            <div>
              <span className="text-accent font-semibold">PRODUKT DES TAGES</span>
              <h2 className="text-4xl md:text-5xl font-black mt-2 mb-4">{product.title}</h2>
              <p className="text-lg text-muted-foreground">{product.short_description}</p>
            </div>

            {colorOptions.length > 0 && (
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
                        selected ? 'border-accent bg-accent text-accent-foreground' : 'border-border bg-card hover:border-accent/60'
                      }`}
                    >
                      <span className="h-4 w-4 rounded-full border border-border" style={{ backgroundColor: variant?.hex || '#ffffff' }} />
                      {color}
                    </button>
                  )
                })}
              </div>
            )}

            <div className="flex items-center gap-4">
              {pricing.hasDiscount ? (
                <>
                  <span className="text-4xl font-bold">{pricing.formattedEffectivePrice}</span>
                  <span className="text-2xl line-through text-muted-foreground">{pricing.formattedRegularPrice}</span>
                </>
              ) : (
                <span className="text-4xl font-bold">{pricing.formattedEffectivePrice}</span>
              )}
            </div>

            <Link
              href={`/produkte/${product.slug}`}
              className="inline-block px-8 py-4 bg-accent text-accent-foreground font-semibold rounded-full hover:shadow-lg transition-all hover:scale-105"
            >
              Jetzt entdecken
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
