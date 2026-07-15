'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Save, Trash2, Plus } from 'lucide-react'
import { formatMoney } from '@/lib/money'

interface Product {
  id: number
  title: string
  price: number
  discount_price?: number
  discount_percentage?: number
  image: string
}

export default function OffersAdminPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [changes, setChanges] = useState<Record<number, Partial<Product>>>({})

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/admin/products')
      const data = await response.json()
      setProducts(data.products || [])
      setChanges({})
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDiscountChange = (id: number, discountPrice: number, originalPrice: number) => {
    const percentage = Math.round(((originalPrice - discountPrice) / originalPrice) * 100)
    setChanges((prev) => ({
      ...prev,
      [id]: {
        discount_price: discountPrice,
        discount_percentage: percentage,
      },
    }))
  }

  const handleRemoveOffer = (id: number) => {
    setChanges((prev) => ({
      ...prev,
      [id]: {
        discount_price: undefined,
        discount_percentage: undefined,
      },
    }))
  }

  const handleSave = async () => {
    try {
      for (const [id, data] of Object.entries(changes)) {
        await fetch(`/api/admin/products/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
      }
      await fetchProducts()
    } catch (error) {
      console.error('Error saving changes:', error)
    }
  }

  const offeredProducts = products.filter((p) => p.discount_price)

  return (
    <div className="p-8 bg-gradient-to-br from-slate-900 to-slate-800 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Angebote verwalten
          </h1>
          <p className="text-gray-400">
            {offeredProducts.length} Angebote aktiv
          </p>
        </div>

        {/* Action Button */}
        {Object.keys(changes).length > 0 && (
          <button
            onClick={handleSave}
            className="mb-8 flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
          >
            <Save size={20} />
            Änderungen speichern
          </button>
        )}

        {/* Products Table */}
        {loading ? (
          <div className="text-center text-gray-400">Wird geladen...</div>
        ) : (
          <div className="space-y-4">
            {products.map((product, index) => {
              const hasOffer = product.discount_price || changes[product.id]?.discount_price
              const discount = changes[product.id] || { discount_price: product.discount_price, discount_percentage: product.discount_percentage }

              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`rounded-lg p-6 border transition-all ${
                    hasOffer
                      ? 'bg-red-500/10 border-red-500'
                      : 'bg-slate-700 border-slate-600'
                  }`}
                >
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex items-start gap-4 flex-1">
                      <img
                        src={product.image}
                        alt={product.title}
                        className="w-24 h-24 object-cover rounded-lg"
                      />

                      <div className="flex-1">
                        <h3 className="text-white font-bold text-lg mb-2">
                          {product.title}
                        </h3>
                        <p className="text-gray-400 mb-4">
                          Normaler Preis: {formatMoney(product.price)}
                        </p>

                        {hasOffer && (
                          <div className="flex items-center gap-4">
                            <div>
                              <p className="text-sm text-gray-400 mb-1">
                                Angebotspreis
                              </p>
                              <p className="text-red-400 font-bold text-lg">
                                {formatMoney(discount.discount_price || 0)}
                              </p>
                              <p className="text-green-400 font-semibold">
                                -{discount.discount_percentage}%
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      {!hasOffer ? (
                        <button
                          onClick={() => handleDiscountChange(product.id, Math.round(product.price * 0.85), product.price)}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                        >
                          <Plus size={18} />
                          Angebot erstellen
                        </button>
                      ) : (
                        <button
                          onClick={() => handleRemoveOffer(product.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
                          Angebot entfernen
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
