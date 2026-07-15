'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'

interface Sale {
  customerName: string
  city: string
  productName: string
  createdAt: string
  productImage?: string
}

export function LiveSalesCarousel() {
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadSales = async () => {
      try {
        const res = await fetch('/api/live-sales')
        if (res.ok) {
          const data = await res.json()
          setSales(data.sales || [])
        }
      } catch (error) {
        console.error('[Load Sales Error]', error)
      } finally {
        setLoading(false)
      }
    }

    loadSales()
    const interval = setInterval(loadSales, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  if (loading || sales.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        Keine aktuellen Verkäufe
      </div>
    )
  }

  return (
    <div className="overflow-hidden">
      <motion.div
        initial={{ x: 0 }}
        animate={{ x: -1000 }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        className="flex gap-6 whitespace-nowrap"
      >
        {[...sales, ...sales].map((sale, idx) => (
          <motion.div
            key={idx}
            className="bg-secondary/70 border border-border backdrop-blur-sm rounded-lg p-4 min-w-max flex items-center gap-3"
          >
            {sale.productImage && (
              <div className="relative w-12 h-12 rounded flex-shrink-0 overflow-hidden bg-muted">
                <Image
                  src={sale.productImage}
                  alt={sale.productName}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="text-xs">
              <p className="font-semibold">{sale.customerName} aus {sale.city}</p>
              <p className="text-muted-foreground">hat {sale.productName} gekauft</p>
              <p className="text-muted-foreground/75 text-xs mt-1">
                vor {Math.round((Date.now() - new Date(sale.createdAt).getTime()) / 60000)} Min.
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
