'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function AdminProductsPage() {
  const [products, setProducts] = useState([
    {
      id: 1,
      title: 'MK Motion X',
      category: 'emotor',
      price: 3499,
      stock: 5,
      active: true,
      created: '2024-01-15',
    },
    {
      id: 2,
      title: 'MK Urban Wave',
      category: 'escooter',
      price: 1299,
      stock: 12,
      active: true,
      created: '2024-01-10',
    },
  ])

  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<null | any>(null)
  const [formData, setFormData] = useState({
    title: '',
    category: 'emotor',
    brand: '',
    price: 0,
    monthlyPrice: 0,
    description: '',
    power: 0,
    battery: '',
    range: 0,
    maxSpeed: 0,
    weight: 0,
    chargeTime: '',
    maxLoad: '',
    color: '',
    stock: 0,
  })

  const handleAddProduct = () => {
    setEditingProduct(null)
    setFormData({
      title: '',
      category: 'emotor',
      brand: '',
      price: 0,
      monthlyPrice: 0,
      description: '',
      power: 0,
      battery: '',
      range: 0,
      maxSpeed: 0,
      weight: 0,
      chargeTime: '',
      maxLoad: '',
      color: '',
      stock: 0,
    })
    setShowModal(true)
  }

  const handleEditProduct = (product: any) => {
    setEditingProduct(product)
    setFormData({
      title: product.title,
      category: product.category,
      brand: '',
      price: product.price,
      monthlyPrice: 0,
      description: '',
      power: 0,
      battery: '',
      range: 0,
      maxSpeed: 0,
      weight: 0,
      chargeTime: '',
      maxLoad: '',
      color: '',
      stock: product.stock,
    })
    setShowModal(true)
  }

  const handleSaveProduct = () => {
    if (editingProduct) {
      setProducts(products.map(p => p.id === editingProduct.id ? { ...editingProduct, ...formData } : p))
    } else {
      setProducts([...products, { id: Math.max(...products.map(p => p.id), 0) + 1, ...formData, active: true, created: new Date().toISOString().split('T')[0] }])
    }
    setShowModal(false)
  }

  const handleDeleteProduct = (id: number) => {
    if (confirm('Sind Sie sicher, dass Sie dieses Produkt löschen möchten?')) {
      setProducts(products.filter(p => p.id !== id))
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">Produkte verwalten</p>
          </div>
          <Link href="/" className="text-sm text-muted-foreground hover:text-accent">
            ← Zurück zur Website
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Top Actions */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-black">Produkte ({products.length})</h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAddProduct}
            className="px-6 py-3 bg-accent text-accent-foreground font-semibold rounded-xl hover:shadow-lg transition-all"
          >
            + Neues Produkt
          </motion.button>
        </div>

        {/* Products Table */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-secondary border-b border-border">
              <tr>
                <th className="px-6 py-4 text-left font-semibold">Produkt</th>
                <th className="px-6 py-4 text-left font-semibold">Kategorie</th>
                <th className="px-6 py-4 text-left font-semibold">Preis</th>
                <th className="px-6 py-4 text-left font-semibold">Bestand</th>
                <th className="px-6 py-4 text-left font-semibold">Status</th>
                <th className="px-6 py-4 text-left font-semibold">Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, idx) => (
                <motion.tr
                  key={product.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="border-b border-border hover:bg-secondary transition-colors"
                >
                  <td className="px-6 py-4 font-semibold">{product.title}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{product.category}</td>
                  <td className="px-6 py-4 font-semibold">CHF {product.price.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      {product.stock} Stück
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${product.active ? 'bg-accent/20 text-accent' : 'bg-red-500/20 text-red-500'}`}>
                      {product.active ? 'Aktiv' : 'Inaktiv'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditProduct(product)}
                        className="px-3 py-1 text-xs bg-secondary rounded hover:bg-accent hover:text-accent-foreground transition-all font-semibold"
                      >
                        Bearbeiten
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="px-3 py-1 text-xs bg-red-500/20 text-red-500 rounded hover:bg-red-500 hover:text-white transition-all font-semibold"
                      >
                        Löschen
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border rounded-2xl p-8 max-w-2xl w-full max-h-screen overflow-y-auto"
          >
            <h3 className="text-2xl font-black mb-6">
              {editingProduct ? 'Produkt bearbeiten' : 'Neues Produkt'}
            </h3>

            <div className="space-y-4">
              {/* Product Title */}
              <div>
                <label className="block text-sm font-semibold mb-2">Produktname *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="z.B. MK Motion X"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Category */}
                <div>
                  <label className="block text-sm font-semibold mb-2">Kategorie *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    <option value="emotor">eMotor</option>
                    <option value="escooter">eScooter</option>
                    <option value="kabinenroller">Kabinenroller</option>
                    <option value="ersatzteile">Ersatzteile</option>
                  </select>
                </div>

                {/* Brand */}
                <div>
                  <label className="block text-sm font-semibold mb-2">Marke</label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full px-4 py-2 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="z.B. MK"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Price */}
                <div>
                  <label className="block text-sm font-semibold mb-2">Preis CHF *</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="3499"
                  />
                </div>

                {/* Monthly Price */}
                <div>
                  <label className="block text-sm font-semibold mb-2">Monatlich CHF</label>
                  <input
                    type="number"
                    value={formData.monthlyPrice}
                    onChange={(e) => setFormData({ ...formData, monthlyPrice: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="89"
                  />
                </div>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Motorleistung (W)</label>
                  <input
                    type="number"
                    value={formData.power}
                    onChange={(e) => setFormData({ ...formData, power: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Reichweite (km)</label>
                  <input
                    type="number"
                    value={formData.range}
                    onChange={(e) => setFormData({ ...formData, range: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Max Geschwindigkeit (km/h)</label>
                  <input
                    type="number"
                    value={formData.maxSpeed}
                    onChange={(e) => setFormData({ ...formData, maxSpeed: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Bestand *</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSaveProduct}
                  className="flex-1 bg-accent text-accent-foreground font-semibold py-3 rounded-lg hover:shadow-lg transition-all"
                >
                  {editingProduct ? 'Speichern' : 'Erstellen'}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-secondary text-foreground font-semibold py-3 rounded-lg hover:bg-border transition-all"
                >
                  Abbrechen
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
