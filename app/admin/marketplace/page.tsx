'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'

interface Product {
  id: number
  slug: string
  title: string
  price: number
  monthly: number
  category: string
  image: string
  discount: number
  specs: Record<string, string>
}

const initialProducts: Product[] = [
  {
    id: 1,
    slug: 'city-go-x-carplay',
    title: 'City Go X CarPlay',
    price: 3890,
    monthly: 98,
    category: 'E-Roller',
    image: '🛴',
    discount: 0,
    specs: { speed: '25 km/h', range: '50 km', power: '500W' },
  },
  {
    id: 2,
    slug: 'mk-city-go',
    title: 'MK City Go',
    price: 3690,
    monthly: 88,
    category: 'E-Roller',
    image: '🛴',
    discount: 6,
    specs: { speed: '25 km/h', range: '50 km', power: '600W' },
  },
]

export default function AdminMarketplacePage() {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState<Partial<Product>>({
    title: '',
    price: 0,
    monthly: 0,
    category: 'E-Roller',
    discount: 0,
  })

  const handleAdd = () => {
    setEditingId(null)
    setFormData({
      title: '',
      price: 0,
      monthly: 0,
      category: 'E-Roller',
      discount: 0,
    })
    setShowModal(true)
  }

  const handleEdit = (product: Product) => {
    setEditingId(product.id)
    setFormData(product)
    setShowModal(true)
  }

  const handleSave = () => {
    if (editingId) {
      setProducts(products.map((p) => (p.id === editingId ? { ...p, ...formData } : p)))
    } else {
      const newProduct: Product = {
        id: Math.max(...products.map((p) => p.id)) + 1,
        slug: formData.title?.toLowerCase().replace(/\s+/g, '-') || '',
        image: '🛴',
        specs: {},
        ...formData,
      } as Product
      setProducts([...products, newProduct])
    }
    setShowModal(false)
  }

  const handleDelete = (id: number) => {
    setProducts(products.filter((p) => p.id !== id))
  }

  return (
    <main className="w-full bg-background">
      <section className="pt-32 pb-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-black tracking-tighter mb-2">Produktverwaltung</h1>
              <p className="text-muted-foreground">Verwalten Sie alle Produkte in Ihrem Marktplatz</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAdd}
              className="px-6 py-3 bg-accent text-accent-foreground font-bold rounded-lg"
            >
              + Neues Produkt
            </motion.button>
          </div>

          {/* Products Table */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-6 py-4 font-bold">Produkt</th>
                    <th className="text-left px-6 py-4 font-bold">Kategorie</th>
                    <th className="text-left px-6 py-4 font-bold">Preis CHF</th>
                    <th className="text-left px-6 py-4 font-bold">Monatlich</th>
                    <th className="text-left px-6 py-4 font-bold">Rabatt</th>
                    <th className="text-right px-6 py-4 font-bold">Aktionen</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <motion.tr
                      key={product.id}
                      whileHover={{ backgroundColor: 'rgba(199, 155, 82, 0.05)' }}
                      className="border-b border-border"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{product.image}</span>
                          <div>
                            <div className="font-semibold">{product.title}</div>
                            <div className="text-sm text-muted-foreground">{product.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">{product.category}</td>
                      <td className="px-6 py-4 font-bold">CHF {product.price.toLocaleString()}</td>
                      <td className="px-6 py-4">CHF {product.monthly}/Mt.</td>
                      <td className="px-6 py-4">
                        {product.discount > 0 ? (
                          <span className="px-2 py-1 bg-accent/20 text-accent rounded font-bold">
                            -{product.discount}%
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="px-3 py-1 bg-secondary hover:bg-secondary text-foreground rounded text-sm font-semibold"
                        >
                          Bearbeiten
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="px-3 py-1 bg-destructive/20 hover:bg-destructive/30 text-destructive rounded text-sm font-semibold"
                        >
                          Löschen
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Modal */}
      {showModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowModal(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-card border border-border rounded-2xl p-8 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-6">
              {editingId ? 'Produkt Bearbeiten' : 'Neues Produkt'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Produktname</label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Preis CHF</label>
                  <input
                    type="number"
                    value={formData.price || 0}
                    onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Monatlich CHF</label>
                  <input
                    type="number"
                    value={formData.monthly || 0}
                    onChange={(e) => setFormData({ ...formData, monthly: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Kategorie</label>
                  <select
                    value={formData.category || 'E-Roller'}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    <option>E-Roller</option>
                    <option>Kabinenroller</option>
                    <option>Escooter</option>
                    <option>SUV-Roller</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Rabatt %</label>
                  <input
                    type="number"
                    value={formData.discount || 0}
                    onChange={(e) => setFormData({ ...formData, discount: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-border text-foreground font-semibold rounded-lg hover:bg-secondary transition"
                >
                  Abbrechen
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 px-4 py-2 bg-accent text-accent-foreground font-semibold rounded-lg hover:opacity-90 transition"
                >
                  Speichern
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </main>
  )
}
