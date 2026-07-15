'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, Edit2, Copy, Eye, EyeOff, MoreVertical, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { resolveProductPrice } from '@/lib/product-price'

interface Product {
  id: number
  title: string
  price: number
  discount_price?: number | null
  discount_percentage?: number | null
  sales_start?: string | Date | null
  sales_end?: string | Date | null
  category_id?: number
  stock_quantity: number
  featured: boolean
  bestseller: boolean
  new_product: boolean
  active: boolean
  archived: boolean
  createdAt: Date
}

interface ProductsDataTableProps {
  onRefresh?: () => void
}

export function ProductsDataTable({ onRefresh }: ProductsDataTableProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({
    status: 'all',
    stock: 'all',
    category: 'all',
  })
  const [selectedProducts, setSelectedProducts] = useState<Set<number>>(new Set())
  const [sortBy, setSortBy] = useState('createdAt')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null)

  const loadProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (filters.status !== 'all') params.append('status', filters.status)
      if (filters.stock !== 'all') params.append('stock', filters.stock)
      if (filters.category !== 'all') params.append('category', filters.category)

      const response = await fetch(`/api/admin/products?${params}`)
      const data = await response.json()
      setProducts(data.data || [])
    } catch (error) {
      console.error('[Load Products Error]', error)
    } finally {
      setLoading(false)
    }
  }, [search, filters])

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  const handleDelete = async (id: number) => {
    try {
      await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
      setProducts(products.filter((p) => p.id !== id))
      setShowDeleteConfirm(null)
      onRefresh?.()
    } catch (error) {
      console.error('[Delete Product Error]', error)
    }
  }

  const handleDuplicate = async (product: Product) => {
    try {
      const response = await fetch(`/api/admin/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'duplicate' }),
      })
      const duplicated = await response.json()
      setProducts([...products, duplicated])
      onRefresh?.()
    } catch (error) {
      console.error('[Duplicate Product Error]', error)
    }
  }

  const handleArchive = async (id: number, archived: boolean) => {
    try {
      const response = await fetch(`/api/admin/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: archived ? 'restore' : 'archive' }),
      })
      const updated = await response.json()
      setProducts(products.map((p) => (p.id === id ? updated : p)))
      onRefresh?.()
    } catch (error) {
      console.error('[Archive Product Error]', error)
    }
  }

  return (
    <div className="space-y-4">
      {/* Filters and Search */}
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"
            />

            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>

            <select
              value={filters.stock}
              onChange={(e) => setFilters({ ...filters, stock: e.target.value })}
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="all">All Stock</option>
              <option value="in_stock">In Stock</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="createdAt">Newest</option>
              <option value="title">Name A-Z</option>
              <option value="price">Price Low-High</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">
                  Product Name
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">
                  Price
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">
                  Stock
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">
                  Featured
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              <AnimatePresence>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                      Loading...
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                      No products found
                    </td>
                  </tr>
                ) : (
                  products.map((product) => {
                    const pricing = resolveProductPrice(product)

                    return (
                      <motion.tr
                        key={product.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/50"
                      >
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="text-sm font-medium text-slate-900 dark:text-white hover:text-accent"
                        >
                          {product.title}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                        {pricing.hasDiscount ? (
                          <>
                            <span className="line-through">{pricing.formattedRegularPrice}</span>
                            <span className="ml-2 font-semibold text-accent">
                              {pricing.formattedEffectivePrice}
                            </span>
                            <span className="ml-2 rounded-full bg-red-600 px-2 py-0.5 text-xs font-bold text-white">
                              -{pricing.discountPercentage}%
                            </span>
                          </>
                        ) : (
                          pricing.formattedEffectivePrice
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            product.stock_quantity > 0
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                          }`}
                        >
                          {product.stock_quantity}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            product.active && !product.archived
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          {product.archived ? 'Archived' : product.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {product.featured && (
                          <span className="inline-block bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 px-2 py-1 rounded text-xs font-medium">
                            Featured
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleArchive(product.id, product.archived)}
                            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded"
                            title={product.archived ? 'Restore' : 'Archive'}
                          >
                            {product.archived ? (
                              <Eye className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                            ) : (
                              <EyeOff className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDuplicate(product)}
                            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded"
                            title="Duplicate"
                          >
                            <Copy className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                          </button>
                          <Link
                            href={`/admin/products/${product.id}/edit`}
                            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                          </Link>
                          <button
                            onClick={() => setShowDeleteConfirm(product.id)}
                            className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                    )
                  })
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-lg p-6 max-w-sm mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                Delete Product
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Are you sure? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  onClick={() => showDeleteConfirm && handleDelete(showDeleteConfirm)}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
