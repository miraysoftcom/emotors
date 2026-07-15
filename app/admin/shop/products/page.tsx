'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit2, Trash2, Archive, RotateCcw, Search, Filter } from 'lucide-react'

interface Product {
  id: number
  title: string
  slug: string
  price: number
  category_id?: number
  image?: string
  stock_quantity: number
  featured: boolean
  bestseller: boolean
  active: boolean
  archived: boolean
  createdAt: string
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'archived'>('all')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    price: 0,
    category_id: '',
    stock_quantity: 0,
    featured: false,
    bestseller: false,
  })

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      const response = await fetch('/api/admin/shop/products')
      if (response.ok) {
        const data = await response.json()
        setProducts(data)
      }
    } catch (error) {
      console.error('[Load Products Error]', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const method = editingId ? 'PUT' : 'POST'
      const url = editingId ? `/api/admin/shop/products/${editingId}` : '/api/admin/shop/products'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await loadProducts()
        setShowForm(false)
        setEditingId(null)
      }
    } catch (error) {
      console.error('[Submit Product Error]', error)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Produkt wirklich löschen?')) return
    try {
      const response = await fetch(`/api/admin/shop/products/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (response.ok) {
        await loadProducts()
      }
    } catch (error) {
      console.error('[Delete Product Error]', error)
    }
  }

  const handleArchive = async (id: number) => {
    try {
      const response = await fetch(`/api/admin/shop/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ archived: true }),
      })
      if (response.ok) {
        await loadProducts()
      }
    } catch (error) {
      console.error('[Archive Product Error]', error)
    }
  }

  const handleRestore = async (id: number) => {
    try {
      const response = await fetch(`/api/admin/shop/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ archived: false }),
      })
      if (response.ok) {
        await loadProducts()
      }
    } catch (error) {
      console.error('[Restore Product Error]', error)
    }
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && product.active && !product.archived) ||
      (filterStatus === 'archived' && product.archived)
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return <div className="p-8">Laden...</div>
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2">Produkte</h1>
            <p className="text-muted-foreground">Enterprise-Level Produktverwaltung</p>
          </div>
          <motion.button
            onClick={() => {
              setEditingId(null)
              setFormData({
                title: '',
                slug: '',
                price: 0,
                category_id: '',
                stock_quantity: 0,
                featured: false,
                bestseller: false,
              })
              setShowForm(true)
            }}
            className="flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground font-bold rounded-lg"
            whileHover={{ scale: 1.05 }}
          >
            <Plus className="w-5 h-5" />
            Neues Produkt
          </motion.button>
        </div>

        <div className="flex gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Produkt suchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg focus:outline-none focus:border-accent"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-4 py-2 bg-card border border-border rounded-lg focus:outline-none focus:border-accent"
          >
            <option value="all">Alle</option>
            <option value="active">Aktiv</option>
            <option value="archived">Archiviert</option>
          </select>
        </div>

        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8 p-6 bg-card border border-border rounded-xl"
            >
              <h2 className="text-2xl font-bold mb-6">
                {editingId ? 'Produkt bearbeiten' : 'Neues Produkt'}
              </h2>

              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold mb-2">Titel *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 bg-secondary border border-border rounded-lg focus:outline-none focus:border-accent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2">Slug *</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-4 py-2 bg-secondary border border-border rounded-lg focus:outline-none focus:border-accent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2">Preis (CHF) *</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 bg-secondary border border-border rounded-lg focus:outline-none focus:border-accent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2">Lager</label>
                  <input
                    type="number"
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({ ...formData, stock_quantity: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 bg-secondary border border-border rounded-lg focus:outline-none focus:border-accent"
                  />
                </div>

                <div className="md:col-span-2 flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    />
                    <span>Empfohlen</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.bestseller}
                      onChange={(e) => setFormData({ ...formData, bestseller: e.target.checked })}
                    />
                    <span>Bestseller</span>
                  </label>
                </div>

                <div className="md:col-span-2 flex gap-4">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-accent text-accent-foreground font-bold rounded-lg"
                  >
                    {editingId ? 'Speichern' : 'Erstellen'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-6 py-2 bg-secondary text-foreground font-bold rounded-lg"
                  >
                    Abbrechen
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="border border-border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-secondary border-b border-border">
                <th className="px-6 py-3 text-left font-bold">Produkt</th>
                <th className="px-6 py-3 text-left font-bold">Preis</th>
                <th className="px-6 py-3 text-left font-bold">Lager</th>
                <th className="px-6 py-3 text-left font-bold">Status</th>
                <th className="px-6 py-3 text-right font-bold">Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                    Keine Produkte gefunden
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="border-b border-border hover:bg-secondary/30 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold">{product.title}</p>
                        <p className="text-sm text-muted-foreground">{product.slug}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold">CHF {product.price}</td>
                    <td className="px-6 py-4">{product.stock_quantity}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {product.featured && (
                          <span className="px-2 py-1 bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 text-xs rounded">
                            Empfohlen
                          </span>
                        )}
                        {product.bestseller && (
                          <span className="px-2 py-1 bg-green-500/20 text-green-700 dark:text-green-300 text-xs rounded">
                            Bestseller
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      <button className="p-2 hover:bg-secondary rounded transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {!product.archived ? (
                        <button
                          onClick={() => handleArchive(product.id)}
                          className="p-2 hover:bg-orange-500/10 rounded transition-colors"
                        >
                          <Archive className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleRestore(product.id)}
                          className="p-2 hover:bg-green-500/10 rounded transition-colors"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="p-2 hover:bg-red-500/10 text-red-500 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-6 p-4 bg-card border border-border rounded-lg text-sm text-muted-foreground">
          <p>Gesamt: {filteredProducts.length} von {products.length} Produkten</p>
        </div>
      </div>
    </div>
  )
}
