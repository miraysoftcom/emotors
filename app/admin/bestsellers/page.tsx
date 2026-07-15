'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Star, Save, RotateCcw } from 'lucide-react'
import { formatMoney } from '@/lib/money'

interface Product {
  id: number
  title: string
  price: number
  is_bestseller: boolean
  image: string
}

export default function BestsellersAdminPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [changes, setChanges] = useState<Record<number, boolean>>({})
  const [saving, setSaving] = useState(false)

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

  const toggleBestseller = (id: number, current: boolean) => {
    setChanges((prev) => ({
      ...prev,
      [id]: !current,
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      for (const [id, isBestseller] of Object.entries(changes)) {
        await fetch(`/api/admin/products/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ is_bestseller: isBestseller }),
        })
      }
      await fetchProducts()
    } catch (error) {
      console.error('Error saving changes:', error)
    } finally {
      setSaving(false)
    }
  }

  const displayProducts = products.map((p) => ({
    ...p,
    is_bestseller: changes[p.id] !== undefined ? changes[p.id] : p.is_bestseller,
  }))

  const bestsellers = displayProducts.filter((p) => p.is_bestseller)

  return (
    <div className="p-8 bg-gradient-to-br from-slate-900 to-slate-800 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Bestseller verwalten
          </h1>
          <p className="text-gray-400">
            {bestsellers.length} Bestseller ausgewählt
          </p>
        </div>

        {/* Action Buttons */}
        {Object.keys(changes).length > 0 && (
          <div className="flex gap-4 mb-8">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
            >
              <Save size={20} />
              {saving ? 'Wird gespeichert...' : 'Änderungen speichern'}
            </button>
            <button
              onClick={() => setChanges({})}
              className="flex items-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-colors"
            >
              <RotateCcw size={20} />
              Zurücksetzen
            </button>
          </div>
        )}

        {/* Products Grid */}
        {loading ? (
          <div className="text-center text-gray-400">Wird geladen...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                  product.is_bestseller
                    ? 'border-yellow-500 bg-yellow-500/10'
                    : 'border-slate-600 bg-slate-700 hover:border-slate-500'
                }`}
                onClick={() => toggleBestseller(product.id, product.is_bestseller)}
              >
                <div className="relative">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-48 object-cover"
                  />
                  {product.is_bestseller && (
                    <div className="absolute top-2 right-2 bg-yellow-500 text-black p-2 rounded-lg">
                      <Star size={24} fill="currentColor" />
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="text-white font-bold text-lg mb-2 line-clamp-2">
                    {product.title}
                  </h3>
                  <p className="text-yellow-400 font-semibold mb-4">
                    {formatMoney(product.price)}
                  </p>

                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleBestseller(product.id, product.is_bestseller)
                    }}
                    className={`w-full py-2 rounded-lg font-semibold transition-colors ${
                      product.is_bestseller
                        ? 'bg-yellow-500 text-black hover:bg-yellow-600'
                        : 'bg-slate-600 text-white hover:bg-slate-500'
                    }`}
                  >
                    {product.is_bestseller ? '★ Bestseller' : 'Als Bestseller'}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
