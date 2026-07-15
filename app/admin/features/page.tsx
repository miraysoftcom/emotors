'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, Plus, Edit2, Trash2, Eye, Copy } from 'lucide-react'
import { HtmlEditor } from '@/components/admin/HtmlEditor'

interface Feature {
  id: number
  title: string
  icon: string
  description: string
  image?: string
  category: string
  productAssignment: 'single' | 'multiple' | 'category' | 'homepage'
  assignedTo?: string[]
  position: number
  status: 'active' | 'inactive'
  createdDate: string
}

const defaultCategories = ['Motor & Power', 'Battery', 'Comfort', 'Safety', 'Technology', 'Design']
const defaultAssignments = [
  { value: 'single', label: 'Ein Produkt' },
  { value: 'multiple', label: 'Mehrere Produkte' },
  { value: 'category', label: 'Kategorie' },
  { value: 'homepage', label: 'Startseite' },
]

export default function FeaturesManagement() {
  const [features, setFeatures] = useState<Feature[]>([
    {
      id: 1,
      title: 'Langreichweite',
      icon: '⚡',
      description: 'Bis zu 100 km Reichweite mit einer Ladung',
      category: 'Battery',
      productAssignment: 'multiple',
      assignedTo: ['E-Scooter Pro', 'E-Bike Urban'],
      position: 1,
      status: 'active',
      createdDate: new Date().toISOString().split('T')[0],
    },
    {
      id: 2,
      title: 'Schnellladung',
      icon: '🔋',
      description: 'Vollständige Ladung in nur 2 Stunden',
      category: 'Battery',
      productAssignment: 'category',
      assignedTo: ['Premium Line'],
      position: 2,
      status: 'active',
      createdDate: new Date().toISOString().split('T')[0],
    },
  ])

  const [editingId, setEditingId] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState<Partial<Feature>>({})
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  const filteredFeatures = features.filter(f => {
    const matchesSearch = f.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !filterCategory || f.category === filterCategory
    const matchesStatus = !filterStatus || f.status === filterStatus
    return matchesSearch && matchesCategory && matchesStatus
  })

  const handleAddFeature = () => {
    setFormData({
      title: '',
      icon: '✨',
      description: '',
      category: defaultCategories[0],
      productAssignment: 'single',
      position: features.length + 1,
      status: 'active',
      createdDate: new Date().toISOString().split('T')[0],
    })
    setEditingId(null)
    setShowForm(true)
  }

  const handleEditFeature = (feature: Feature) => {
    setFormData({ ...feature })
    setEditingId(feature.id)
    setShowForm(true)
  }

  const handleSaveFeature = () => {
    if (!formData.title) {
      alert('Bitte geben Sie einen Titel ein')
      return
    }

    if (editingId) {
      setFeatures(
        features.map(f =>
          f.id === editingId ? { ...f, ...formData } as Feature : f
        )
      )
    } else {
      const newFeature: Feature = {
        id: Math.max(...features.map(f => f.id), 0) + 1,
        title: formData.title || '',
        icon: formData.icon || '✨',
        description: formData.description || '',
        image: formData.image,
        category: formData.category || defaultCategories[0],
        productAssignment: formData.productAssignment || 'single',
        assignedTo: formData.assignedTo || [],
        position: formData.position || features.length + 1,
        status: formData.status || 'active',
        createdDate: new Date().toISOString().split('T')[0],
      }
      setFeatures([...features, newFeature])
    }

    setShowForm(false)
    setFormData({})
  }

  const handleDeleteFeature = (id: number) => {
    if (confirm('Möchten Sie diese Funktion wirklich löschen?')) {
      setFeatures(features.filter(f => f.id !== id))
    }
  }

  const handleDuplicateFeature = (feature: Feature) => {
    const newFeature: Feature = {
      ...feature,
      id: Math.max(...features.map(f => f.id), 0) + 1,
      title: `${feature.title} (Kopie)`,
    }
    setFeatures([...features, newFeature])
  }

  const handleToggleStatus = (id: number) => {
    setFeatures(
      features.map(f =>
        f.id === id ? { ...f, status: f.status === 'active' ? 'inactive' : 'active' } : f
      )
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="hover:text-accent transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-3xl font-black uppercase tracking-widest text-accent">Features</h1>
          </div>
          {!showForm && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAddFeature}
              className="flex items-center gap-2 bg-accent text-accent-foreground px-4 py-2 rounded-lg font-bold hover:shadow-lg transition-all"
            >
              <Plus className="w-5 h-5" />
              Neue Funktion
            </motion.button>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-xl p-6 mb-8 space-y-4"
          >
            <h2 className="text-xl font-bold">{editingId ? 'Funktion bearbeiten' : 'Neue Funktion erstellen'}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-2">Titel *</label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="z.B. Langreichweite"
                  className="w-full px-3 py-2 bg-secondary border border-border rounded-lg focus:ring-2 focus:ring-accent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Icon</label>
                <input
                  type="text"
                  value={formData.icon || ''}
                  onChange={e => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="z.B. ⚡"
                  className="w-full px-3 py-2 bg-secondary border border-border rounded-lg focus:ring-2 focus:ring-accent outline-none"
                  maxLength={2}
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Kategorie</label>
                <select
                  value={formData.category || defaultCategories[0]}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 bg-secondary border border-border rounded-lg focus:ring-2 focus:ring-accent outline-none"
                >
                  {defaultCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Zuordnung</label>
                <select
                  value={formData.productAssignment || 'single'}
                  onChange={e => setFormData({ ...formData, productAssignment: e.target.value as any })}
                  className="w-full px-3 py-2 bg-secondary border border-border rounded-lg focus:ring-2 focus:ring-accent outline-none"
                >
                  {defaultAssignments.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <HtmlEditor
                  label="Beschreibung"
                  value={formData.description || ''}
                  onChange={(description) => setFormData({ ...formData, description })}
                  minHeightClassName="min-h-36"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold mb-2">Bild URL (optional)</label>
                <input
                  type="url"
                  value={formData.image || ''}
                  onChange={e => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-secondary border border-border rounded-lg focus:ring-2 focus:ring-accent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Position</label>
                <input
                  type="number"
                  value={formData.position || 1}
                  onChange={e => setFormData({ ...formData, position: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 bg-secondary border border-border rounded-lg focus:ring-2 focus:ring-accent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Status</label>
                <select
                  value={formData.status || 'active'}
                  onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-3 py-2 bg-secondary border border-border rounded-lg focus:ring-2 focus:ring-accent outline-none"
                >
                  <option value="active">Aktiv</option>
                  <option value="inactive">Inaktiv</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <button
                onClick={handleSaveFeature}
                className="px-4 py-2 bg-accent text-accent-foreground rounded-lg font-bold hover:shadow-lg transition-all"
              >
                Speichern
              </button>
              <button
                onClick={() => {
                  setShowForm(false)
                  setFormData({})
                  setEditingId(null)
                }}
                className="px-4 py-2 bg-secondary text-foreground rounded-lg font-bold hover:bg-secondary/80 transition-all"
              >
                Abbrechen
              </button>
            </div>
          </motion.div>
        )}

        {/* Filters */}
        {!showForm && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <input
              type="text"
              placeholder="Nach Funktion suchen..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="px-4 py-2 bg-card border border-border rounded-lg focus:ring-2 focus:ring-accent outline-none"
            />
            <select
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              className="px-4 py-2 bg-card border border-border rounded-lg focus:ring-2 focus:ring-accent outline-none"
            >
              <option value="">Alle Kategorien</option>
              {defaultCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="px-4 py-2 bg-card border border-border rounded-lg focus:ring-2 focus:ring-accent outline-none"
            >
              <option value="">Alle Status</option>
              <option value="active">Aktiv</option>
              <option value="inactive">Inaktiv</option>
            </select>
          </div>
        )}

        {/* Features Table */}
        {!showForm && (
          <div className="space-y-3">
            {filteredFeatures.length === 0 ? (
              <div className="bg-card border border-border rounded-lg p-8 text-center text-muted-foreground">
                Keine Funktionen gefunden
              </div>
            ) : (
              filteredFeatures.map(feature => (
                <motion.div
                  key={feature.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card border border-border rounded-lg p-4 hover:border-accent/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 flex gap-4">
                      <div className="text-2xl">{feature.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-bold">{feature.title}</h3>
                          <span className={`text-xs px-2 py-1 rounded font-bold ${feature.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
                            {feature.status === 'active' ? 'Aktiv' : 'Inaktiv'}
                          </span>
                          <span className="text-xs px-2 py-1 rounded bg-secondary text-foreground">{feature.category}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{stripHtml(feature.description)}</p>
                        <div className="text-xs text-muted-foreground">
                          <span>Erstellt: {feature.createdDate}</span>
                          {feature.assignedTo && feature.assignedTo.length > 0 && (
                            <span className="ml-4">Zugeordnet zu: {feature.assignedTo.join(', ')}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => handleToggleStatus(feature.id)}
                        className="p-2 rounded hover:bg-secondary transition-colors"
                        title="Status togglen"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditFeature(feature)}
                        className="p-2 rounded hover:bg-secondary transition-colors text-blue-500"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDuplicateFeature(feature)}
                        className="p-2 rounded hover:bg-secondary transition-colors text-green-500"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteFeature(feature.id)}
                        className="p-2 rounded hover:bg-secondary transition-colors text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}
