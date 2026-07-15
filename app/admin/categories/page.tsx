'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Plus, Trash2, Edit2, ArrowLeft, Check, X } from 'lucide-react'
import { HtmlEditor } from '@/components/admin/HtmlEditor'

interface Category {
  id: number
  name: string
  slug: string
  description?: string
  long_description?: string
  type: string
  license_required: boolean
  icon?: string
  image?: string
  banner?: string
  color?: string
  featured: boolean
  active: boolean
  order: number
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    long_description: '',
    type: 'main',
    license_required: false,
    icon: '',
    image: '',
    banner: '',
    color: '#000000',
    featured: false,
    active: true,
    order: 0,
  })

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('[Load Categories Error]', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setIsSubmitting(true)

    // Validate required fields
    if (!formData.name.trim()) {
      setError('Kategorie Name ist erforderlich')
      setIsSubmitting(false)
      return
    }
    if (!formData.slug.trim()) {
      setError('URL Slug ist erforderlich')
      setIsSubmitting(false)
      return
    }

    try {
      const method = editingId ? 'PUT' : 'POST'
      const url = editingId ? `/api/admin/categories/${editingId}` : '/api/admin/categories'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(editingId ? 'Kategorie aktualisiert' : 'Kategorie erstellt')
        await loadCategories()
        resetForm()
        setTimeout(() => setSuccess(null), 3000)
      } else {
        setError(data.error || 'Fehler beim Speichern: ' + JSON.stringify(data))
      }
    } catch (error) {
      console.error('[Submit Category Error]', error)
      setError('Netzwerkfehler: ' + String(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Kategorie wirklich löschen?')) return

    setError(null)
    setSuccess(null)

    try {
      const response = await fetch(`/api/admin/categories/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('Kategorie gelöscht')
        await loadCategories()
        setTimeout(() => setSuccess(null), 3000)
      } else {
        setError(data.error || 'Fehler beim Löschen')
      }
    } catch (error) {
      console.error('[Delete Category Error]', error)
      setError('Fehler beim Löschen: ' + String(error))
    }
  }

  const handleEdit = (category: Category) => {
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      long_description: category.long_description || '',
      type: category.type,
      license_required: category.license_required,
      icon: category.icon || '',
      image: category.image || '',
      banner: category.banner || '',
      color: category.color || '#000000',
      featured: category.featured || false,
      active: category.active || true,
      order: category.order,
    })
    setEditingId(category.id)
    setShowForm(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      long_description: '',
      type: 'main',
      license_required: false,
      icon: '',
      image: '',
      banner: '',
      color: '#000000',
      featured: false,
      active: true,
      order: 0,
    })
    setEditingId(null)
    setShowForm(false)
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[äöü]/g, c => ({ ä: 'ae', ö: 'oe', ü: 'ue' }[c] || c))
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <Link href="/admin/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft size={18} />
            Zurück zum Dashboard
          </Link>
          <h1 className="text-3xl font-bold">Kategorien Verwaltung</h1>
          <button
            onClick={() => (showForm ? resetForm() : setShowForm(true))}
            className="flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:shadow-lg transition-all"
          >
            <Plus size={18} />
            {showForm ? 'Abbrechen' : 'Kategorie erstellen'}
          </button>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-200"
          >
            {error}
          </motion.div>
        )}

        {/* Success Message */}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-200"
          >
            {success}
          </motion.div>
        )}

        {/* Form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-6 bg-card border border-border rounded-xl"
          >
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Kategorie Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value })
                    if (!editingId) {
                      setFormData(prev => ({ ...prev, slug: generateSlug(e.target.value) }))
                    }
                  }}
                  required
                  className="w-full px-3 py-2 bg-secondary border border-border rounded-lg focus:ring-2 focus:ring-accent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">URL Slug *</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-secondary border border-border rounded-lg focus:ring-2 focus:ring-accent outline-none"
                />
              </div>

              <div className="col-span-2">
                <HtmlEditor
                  label="Beschreibung"
                  value={formData.description}
                  onChange={(description) => setFormData({ ...formData, description })}
                  minHeightClassName="min-h-36"
                />
              </div>

              <div className="col-span-2">
                <HtmlEditor
                  label="Lange Beschreibung"
                  value={formData.long_description}
                  onChange={(long_description) => setFormData({ ...formData, long_description })}
                  minHeightClassName="min-h-44"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Kategorie Bild URL</label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-secondary border border-border rounded-lg focus:ring-2 focus:ring-accent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Kategorie Banner URL</label>
                <input
                  type="text"
                  value={formData.banner}
                  onChange={(e) => setFormData({ ...formData, banner: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-secondary border border-border rounded-lg focus:ring-2 focus:ring-accent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Typ</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 bg-secondary border border-border rounded-lg focus:ring-2 focus:ring-accent outline-none"
                >
                  <option value="main">Hauptkategorie</option>
                  <option value="sub">Unterkategorie</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Reihenfolge</label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 bg-secondary border border-border rounded-lg focus:ring-2 focus:ring-accent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Farbe</label>
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-full px-3 py-2 bg-secondary border border-border rounded-lg cursor-pointer"
                />
              </div>

              <div className="col-span-2 space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="license"
                    checked={formData.license_required}
                    onChange={(e) => setFormData({ ...formData, license_required: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label htmlFor="license" className="text-sm font-medium">Führerschein erforderlich (Ohne Führerschein)</label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label htmlFor="featured" className="text-sm font-medium">Empfohlen (Featured)</label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="active"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label htmlFor="active" className="text-sm font-medium">Aktiv</label>
                </div>
              </div>

              <div className="col-span-2 flex gap-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2 bg-accent text-accent-foreground font-medium rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Check size={18} />
                  {isSubmitting ? 'Wird gespeichert...' : (editingId ? 'Speichern' : 'Erstellen')}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={isSubmitting}
                  className="flex-1 py-2 bg-secondary text-foreground font-medium rounded-lg hover:bg-secondary/80 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X size={18} />
                  Abbrechen
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Categories List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-3"
        >
          {loading ? (
            <div className="text-center py-12">Wird geladen...</div>
          ) : categories.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">Keine Kategorien gefunden</div>
          ) : (
            categories.map(category => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 bg-card border border-border rounded-lg flex items-center justify-between hover:border-accent transition-colors"
              >
                <div>
                  <h3 className="font-bold text-foreground">{category.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {category.slug} • {category.type === 'main' ? 'Hauptkategorie' : 'Unterkategorie'}
                    {category.license_required && ' • Führerschein erforderlich'}
                  </p>
                  {category.description && <p className="text-sm text-muted-foreground mt-1">{stripHtml(category.description)}</p>}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(category)}
                    className="p-2 bg-secondary hover:bg-secondary/80 rounded-lg transition-all"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      </div>
    </div>
  )
}

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}
