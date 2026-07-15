'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle } from 'lucide-react'
import { SplitTitle } from '@/components/common/SplitTitle'

interface Order {
  firstName: string
  lastName?: string
  city?: string
  billingCity?: string
  createdAt: Date | string
  product?: string
  productImage?: string
  productSlug?: string
  productHref?: string
  items?: Array<{
    productId: number
    name: string
    price: number
    quantity: number
    image?: string
    slug?: string
  }>
  timeType?: 'just_now' | 'hours' | 'days'
}

interface LiveSalesSectionProps {
  orders: Order[]
}

const SWISS_CITIES = [
  'Zürich', 'Bern', 'Basel', 'Luzern', 'Genf', 'Lausanne', 'Winterthur',
  'St. Gallen', 'Lugano', 'Thun', 'Grindelwald', 'Interlaken', 'Zermatt',
  'Appenzell', 'Chur', 'Schaffhausen', 'Aarau', 'Solothurn', 'Glarus'
]

type SaleItem = Order & {
  product: string
  productImage: string
  productHref: string
}

export function LiveSalesSection({ orders }: LiveSalesSectionProps) {
  const [displayedOrders, setDisplayedOrders] = useState<SaleItem[]>([])
  const [cycleIndex, setCycleIndex] = useState(0)

  const getRandomCity = () => {
    return SWISS_CITIES[Math.floor(Math.random() * SWISS_CITIES.length)]
  }

  const getTimeText = (createdAt: Date | string): string => {
    const created = new Date(createdAt).getTime()
    const diff = Date.now() - created
    const hours = Math.max(0, Math.floor(diff / (60 * 60 * 1000)))
    const days = Math.max(0, Math.floor(diff / (24 * 60 * 60 * 1000)))
    if (hours < 1) return 'hat gerade bestellt'
    if (hours < 24) return `hat vor ${hours}h bestellt`
    return `hat vor ${days}d bestellt`
  }

  useEffect(() => {
    const allOrders = (orders || []).flatMap((order) => {
      const items = order.items?.length
        ? order.items
        : order.product
          ? [{ productId: 0, name: order.product, price: 0, quantity: 1, image: order.productImage, slug: order.productSlug }]
          : []

      return items.map((item) => ({
        ...order,
        city: order.city || order.billingCity || getRandomCity(),
        product: item.name,
        productImage: item.image || order.productImage || '/placeholder.jpg',
        productHref: item.slug ? `/produkte/${item.slug}` : order.productHref || (item.productId ? `/produkte?productId=${item.productId}` : '/produkte'),
      }))
    }).slice(0, 12)

    setDisplayedOrders(allOrders)

    if (allOrders.length === 0) return
    const interval = setInterval(() => {
      setCycleIndex((prev) => (prev + 1) % Math.max(1, allOrders.length))
    }, 4000)

    return () => clearInterval(interval)
  }, [orders])

  if (displayedOrders.length === 0) return null

  const visibleOrders = Array.from({ length: Math.min(4, displayedOrders.length) }, (_, index) => (
    displayedOrders[(cycleIndex + index) % displayedOrders.length]
  ))

  return (
    <section className="py-20 px-4 md:px-8 bg-background-secondary border-y border-border">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            <SplitTitle title="Gerade verkauft" />
          </h2>
          <p className="text-xl text-muted-foreground">
            Sehen Sie, was andere Kunden in der Schweiz kaufen
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <AnimatePresence mode="wait">
            {visibleOrders.map((order, index) => (
              <motion.article
                key={`${order.firstName}-${order.city}-${order.product}-${index}`}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -20 }}
                transition={{ duration: 0.4 }}
                className="overflow-hidden rounded-2xl border border-border bg-card shadow-xl shadow-shadow/10 transition hover:-translate-y-1 hover:border-accent/50"
              >
                <Link href={order.productHref} className="block h-full">
                  <div className="aspect-[4/3] overflow-hidden bg-secondary">
                    <img
                      src={order.productImage}
                      alt={order.product}
                      className="h-full w-full object-cover transition duration-500 hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-5">
                    <div className="mb-4 flex items-start gap-3">
                      <CheckCircle className="mt-1 shrink-0 text-accent" size={20} />
                      <div className="min-w-0">
                        <p className="font-black text-foreground">
                          {order.firstName} {order.lastName}
                        </p>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                          aus {order.city}
                        </p>
                      </div>
                    </div>
                    <p className="line-clamp-2 text-base font-black text-accent">
                      {order.product}
                    </p>
                    <p className="mt-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      {getTimeText(order.createdAt)}
                    </p>
                  </div>
                </Link>
              </motion.article>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
