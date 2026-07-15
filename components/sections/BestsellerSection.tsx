'use client'

import { ProductCard } from '@/components/products/ProductCard'
import { motion } from 'framer-motion'
import { SplitTitle } from '@/components/common/SplitTitle'

interface Product {
  id: number
  slug: string
  title: string
  price: number
  image: string
  is_bestseller?: boolean
}

interface BestsellerSectionProps {
  products: Product[]
}

export function BestsellerSection({ products }: BestsellerSectionProps) {
  if (!products || products.length === 0) return null
  const displayProducts = products.slice(0, 10)
  const marqueeProducts = displayProducts.length > 3 ? [...displayProducts, ...displayProducts] : displayProducts

  return (
    <section className="overflow-hidden border-y border-border bg-background-secondary px-4 py-20 md:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            <SplitTitle title="Unsere Bestseller" />
          </h2>
          <p className="text-xl text-muted-foreground">
            Die beliebtesten Produkte unserer Kunden
          </p>
        </motion.div>

        <div className="group relative -mx-4 overflow-hidden px-4">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-background-secondary to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-background-secondary to-transparent" />
          <div className="bestseller-marquee flex w-max gap-6 py-2 group-hover:[animation-play-state:paused]">
            {marqueeProducts.map((product, index) => (
              <motion.div
                key={`${product.id}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: (index % displayProducts.length) * 0.05 }}
                className="w-[18rem] shrink-0 md:w-[21rem]"
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      <style jsx>{`
        .bestseller-marquee {
          animation: bestseller-slide 50s linear infinite;
        }

        @keyframes bestseller-slide {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .bestseller-marquee {
            animation: none;
            overflow-x: auto;
            width: 100%;
          }
        }
      `}</style>
    </section>
  )
}
