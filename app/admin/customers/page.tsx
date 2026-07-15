'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Plus, Mail, Phone, Eye, Edit, Trash2, Loader, Download } from 'lucide-react'
import { HtmlEditor } from '@/components/admin/HtmlEditor'

interface Customer {
  id: number
  email: string
  firstName: string
  lastName: string
  phone?: string
  company?: string
  city?: string
  totalOrders: number
  totalSpent: number
  lastOrderDate?: string
  createdAt: string
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    company: '',
    defaultAddress: '',
    city: '',
    postalCode: '',
    country: 'Schweiz',
    notes: '',
  })

  useEffect(() => {
    loadCustomers()
  }, [])

  const loadCustomers = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/customers')
      if (res.ok) {
        const data = await res.json()
        setCustomers(data.customers || [])
      }
    } catch (error) {
      console.error('[Load Customers Error]', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const method = editingId ? 'PUT' : 'POST'
      const endpoint = editingId ? '/api/admin/customers' : '/api/admin/customers'
      const payload = editingId ? { id: editingId, ...formData } : formData

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        await loadCustomers()
        resetForm()
      }
    } catch (error) {
      console.error('[Submit Error]', error)
    }
  }

  const resetForm = () => {
    setShowForm(false)
    setEditingId(null)
    setFormData({
      email: '',
      firstName: '',
      lastName: '',
      phone: '',
      company: '',
      defaultAddress: '',
      city: '',
      postalCode: '',
      country: 'Schweiz',
      notes: '',
    })
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Kundin wirklich löschen?')) return
    try {
      const res = await fetch(`/api/admin/customers?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        await loadCustomers()
      }
    } catch (error) {
      console.error('[Delete Error]', error)
    }
  }

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${customer.firstName} ${customer.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.company?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-black text-slate-900">Kundenverwaltung</h1>
              <p className="text-slate-600 mt-1">Verwalten Sie Kundeninformationen und Historien</p>
            </div>
            <button 
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              <Plus size={20} />
              Neuer Kunde
            </button>
          </div>

          {/* Search & Filters */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-3 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Nach Name, Email oder Unternehmen suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-3 border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors">
              <Download size={20} />
              Export
            </button>
          </div>
        </motion.div>

        {/* Customers Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredCustomers.map((customer, idx) => (
            <motion.div
              key={customer.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white border border-slate-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-slate-900">
                    {customer.firstName} {customer.lastName}
                  </h3>
                  <p className="text-sm text-slate-600">{customer.company}</p>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                    <Eye size={18} className="text-slate-600" />
                  </button>
                  <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                    <Edit size={18} className="text-slate-600" />
                  </button>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-2 mb-4 pb-4 border-b border-slate-200">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Mail size={16} />
                  <a href={`mailto:${customer.email}`} className="hover:text-blue-600">
                    {customer.email}
                  </a>
                </div>
                {customer.phone && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Phone size={16} />
                    <a href={`tel:${customer.phone}`} className="hover:text-blue-600">
                      {customer.phone}
                    </a>
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 mb-4 pb-4 border-b border-slate-200">
                <div className="text-center">
                  <p className="text-2xl font-bold text-slate-900">{customer.totalOrders}</p>
                  <p className="text-xs text-slate-600">Bestellungen</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-slate-900">
                    CHF {(customer.totalSpent / 1000).toFixed(1)}k
                  </p>
                  <p className="text-xs text-slate-600">Ausgegeben</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-slate-900">
                    {customer.lastOrderDate ? new Date(customer.lastOrderDate).toLocaleDateString('de-DE') : '—'}
                  </p>
                  <p className="text-xs text-slate-600">Letzte Bestellung</p>
                </div>
              </div>

              {/* Joined */}
              <p className="text-xs text-slate-500">
                Beigetreten am {new Date(customer.createdAt).toLocaleDateString('de-DE')}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Empty State */}
        {filteredCustomers.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-slate-600">Keine Kunden gefunden</p>
          </motion.div>
        )}

        {/* Loading State */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Loader className="w-8 h-8 animate-spin mx-auto text-blue-600" />
            <p className="text-slate-600 mt-2">Laden...</p>
          </motion.div>
        )}
      </div>

      {/* Customer Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6"
          >
            <h2 className="text-2xl font-bold mb-4">
              {editingId ? 'Kunde bearbeiten' : 'Neuen Kunden erstellen'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="email"
                  placeholder="E-Mail"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="px-3 py-2 border rounded-lg"
                  required
                />
                <input
                  type="text"
                  placeholder="Vorname"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="px-3 py-2 border rounded-lg"
                  required
                />
                <input
                  type="text"
                  placeholder="Nachname"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="px-3 py-2 border rounded-lg"
                  required
                />
                <input
                  type="tel"
                  placeholder="Telefon"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="px-3 py-2 border rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Firma"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="px-3 py-2 border rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Stadt"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="px-3 py-2 border rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Postleitzahl"
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  className="px-3 py-2 border rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Land"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="px-3 py-2 border rounded-lg"
                />
              </div>

              <HtmlEditor
                label="Notizen"
                value={formData.notes}
                onChange={(notes) => setFormData({ ...formData, notes })}
                minHeightClassName="min-h-36"
              />

              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingId ? 'Speichern' : 'Erstellen'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}
