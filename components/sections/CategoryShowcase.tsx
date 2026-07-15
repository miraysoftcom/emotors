'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { SplitTitle } from '@/components/common/SplitTitle'

interface Category {
  id: number
  name: string
  slug: string
  description?: string | null
  icon?: string | null
  image?: string | null
  color?: string | null
}

interface CategoryShowcaseProps {
  categories: Category[]
  compact?: boolean
}

function getCategoryHref(slug: string) {
  if (slug === 'ohne-fuehrerschein') return '/produkte?license=ohne'
  if (slug === 'mit-fuehrerschein') return '/produkte?license=mit'
  return `/produkte?category=${encodeURIComponent(slug)}`
}

export function CategoryShowcase({ categories, compact = false }: CategoryShowcaseProps) {
  if (!categories || categories.length === 0) return null

  const content = (
    <>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className={compact ? 'mb-8' : 'mb-12 text-center'}
        >
          <h2 className={`${compact ? 'text-3xl md:text-4xl' : 'text-4xl md:text-5xl'} font-bold mb-4`}>
            <SplitTitle title="Kategorien" />
          </h2>
          <p className="text-lg text-muted-foreground">
            Finden Sie schneller die passende Elektromobilität.
          </p>
        </motion.div>

        <div className={`grid grid-cols-1 gap-6 ${compact ? 'xl:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-3'}`}>
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="group"
            >
              <Link
                href={getCategoryHref(category.slug)}
                className="block h-full rounded-2xl bg-card p-5 shadow-luxury-md transition-all duration-300 hover:-translate-y-1 hover:shadow-luxury-lg md:p-6"
              >
                <div className="flex items-start gap-5">
                  <div
                    className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl text-3xl text-white"
                    style={{ backgroundColor: category.color || '#111827' }}
                  >
                    {category.image ? (
                      <img
                        src={category.image}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      category.icon || 'MK'
                    )}
                  </div>

                  <div className="min-w-0">
                    <h3 className={`${compact ? 'text-xl' : 'text-2xl'} font-black tracking-tight text-primary transition-colors group-hover:text-accent`}>
                      {category.name}
                    </h3>
                    {category.description && (
                      <div
                        className="managed-page-content mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground"
                        dangerouslySetInnerHTML={{ __html: category.description }}
                      />
                    )}
                    <span className="mt-5 inline-block text-sm font-semibold text-accent">
                      Entdecken
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
    </>
  )

  if (compact) {
    return (
      <div className="h-full rounded-3xl border border-orange-500/35 bg-secondary/70 p-5 shadow-[0_0_0_1px_rgba(249,115,22,0.08)] transition-colors dark:border-accent/35 dark:shadow-[0_0_0_1px_rgba(34,197,94,0.08)] md:p-7">
        {content}
      </div>
    )
  }

  return (
    <section className="py-20 px-4 md:px-8 bg-secondary">
      <div className="max-w-7xl mx-auto">
        {content}
      </div>
    </section>
  )
}
