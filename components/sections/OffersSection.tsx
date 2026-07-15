'use client'

import { motion } from 'framer-motion'
import { Zap } from 'lucide-react'
import { SplitTitle } from '@/components/common/SplitTitle'
import { ProductCard } from '@/components/products/ProductCard'

interface Product {
  id: number
  slug: string
  title: string
  price: number
  discount_price?: number | null
  discount_percentage?: number
  sales_start?: string | Date | null
  sales_end?: string | Date | null
  image: string
  metadata?: Record<string, unknown> | null
  color?: string[] | null
  stock_quantity?: number | null
  monthly_price?: number | null
  brand?: string | null
}

interface OffersSectionProps {
  products: Product[]
}

export function OffersSection({ products }: OffersSectionProps) {
  const discountedProducts = products.filter((p) => Boolean(p.discount_price || p.discount_percentage))
  if (!discountedProducts || discountedProducts.length === 0) return null

  return (
    <section className="py-20 px-4 md:px-8 bg-background">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Zap className="text-yellow-500" size={32} />
            <h2 className="text-4xl md:text-5xl font-bold">
              <SplitTitle title="Angebote" />
            </h2>
            <Zap className="text-yellow-500" size={32} />
          </div>
          <p className="text-xl text-muted-foreground">
            Besondere Rabatte auf ausgewählte Produkte
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {discountedProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
