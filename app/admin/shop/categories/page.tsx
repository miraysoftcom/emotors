'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit2, Trash2, GripVertical, X, Upload, Eye, EyeOff } from 'lucide-react'
import { HtmlEditor } from '@/components/admin/HtmlEditor'

interface Category {
  id: number
  name: string
  slug: string
  description?: string
  long_description?: string
  icon?: string
  image?: string
  banner?: string
  color: string
  parent_id?: number
  featured: boolean
  active: boolean
  seo_title?: string
  seo_description?: string
  sort_priority: number
  order: number
  license_required: boolean
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState<Partial<Category>>({
    name: '',
    slug: '',
    description: '',
    long_description: '',
    icon: '🏍️',
    color: '#000000',
    featured: false,
    active: true,
    license_required: false,
    sort_priority: 0,
  })
  const [draggedItem, setDraggedItem] = useState<number | null>(null)

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/admin/shop/categories')
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
    try {
      const method = editingId ? 'PUT' : 'POST'
      const url = editingId ? `/api/admin/shop/categories/${editingId}` : '/api/admin/shop/categories'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await loadCategories()
        setShowForm(false)
        setEditingId(null)
        setFormData({
          name: '',
          slug: '',
          color: '#000000',
          featured: false,
          active: true,
        })
      }
    } catch (error) {
      console.error('[Submit Category Error]', error)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Kategorie wirklich löschen?')) return

    try {
      const response = await fetch(`/api/admin/shop/categories/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (response.ok) {
        await loadCategories()
      }
    } catch (error) {
      console.error('[Delete Category Error]', error)
    }
  }

  const handleEdit = (category: Category) => {
    setEditingId(category.id)
    setFormData(category)
    setShowForm(true)
  }

  const handleAddNew = () => {
    setEditingId(null)
    setFormData({
      name: '',
      slug: '',
      icon: '🏍️',
      color: '#000000',
      featured: false,
      active: true,
      license_required: false,
    })
    setShowForm(true)
  }

  const handleDragStart = (id: number) => {
    setDraggedItem(id)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = async (targetId: number) => {
    if (!draggedItem || draggedItem === targetId) return

    try {
      // Reorder items by updating sort_priority
      const draggedCategory = categories.find(c => c.id === draggedItem)
      const targetCategory = categories.find(c => c.id === targetId)

      if (!draggedCategory || !targetCategory) return

      // Swap order
      const temp = draggedCategory.sort_priority
      draggedCategory.sort_priority = targetCategory.sort_priority
      targetCategory.sort_priority = temp

      await fetch(`/api/admin/shop/categories/${draggedItem}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ sort_priority: draggedCategory.sort_priority }),
      })

      await fetch(`/api/admin/shop/categories/${targetId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ sort_priority: targetCategory.sort_priority }),
      })

      await loadCategories()
    } catch (error) {
      console.error('[Drag Drop Error]', error)
    } finally {
      setDraggedItem(null)
    }
  }

  if (loading) {
    return <div className="p-8">Laden...</div>
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2">Kategorien</h1>
            <p className="text-muted-foreground">Verwalten Sie Produktkategorien und Unterkategorien</p>
          </div>
          <motion.button
            onClick={handleAddNew}
            className="flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground font-bold rounded-lg hover:shadow-lg transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus className="w-5 h-5" />
            Neue Kategorie
          </motion.button>
        </div>

        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8 p-6 bg-card border border-border rounded-xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">
                  {editingId ? 'Kategorie bearbeiten' : 'Neue Kategorie'}
                </h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="p-2 hover:bg-secondary rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold mb-2">Name *</label>
                    <input
                      type="text"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 bg-secondary border border-border rounded-lg focus:outline-none focus:border-accent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2">Slug *</label>
                    <input
                      type="text"
                      value={formData.slug || ''}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      className="w-full px-4 py-2 bg-secondary border border-border rounded-lg focus:outline-none focus:border-accent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2">Icon</label>
                    <input
                      type="text"
                      value={formData.icon || ''}
                      maxLength={2}
                      className="w-full px-4 py-2 bg-secondary border border-border rounded-lg text-2xl focus:outline-none focus:border-accent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2">Farbe</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={formData.color || '#000000'}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        className="w-12 h-10 rounded-lg cursor-pointer"
                      />
                      <input
                        type="text"
                        value={formData.color || ''}
                        className="flex-1 px-4 py-2 bg-secondary border border-border rounded-lg text-sm"
                        readOnly
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2">Bild URL</label>
                    <input
                      type="url"
                      value={formData.image || ''}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      className="w-full px-4 py-2 bg-secondary border border-border rounded-lg focus:outline-none focus:border-accent"
                      placeholder="https://..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2">Banner URL</label>
                    <input
                      type="url"
                      value={formData.banner || ''}
                      onChange={(e) => setFormData({ ...formData, banner: e.target.value })}
                      className="w-full px-4 py-2 bg-secondary border border-border rounded-lg focus:outline-none focus:border-accent"
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div>
                  <HtmlEditor
                    label="Beschreibung"
                    value={formData.description || ''}
                    onChange={(description) => setFormData({ ...formData, description })}
                    minHeightClassName="min-h-36"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.featured || false}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-medium">Empfohlen</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.active || false}
                      onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-medium">Aktiv</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.license_required || false}
                      onChange={(e) => setFormData({ ...formData, license_required: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-medium">Führerschein erforderlich</span>
                  </label>
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-accent text-accent-foreground font-bold rounded-lg hover:shadow-lg transition-all"
                  >
                    {editingId ? 'Speichern' : 'Erstellen'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-6 py-2 bg-secondary text-foreground font-bold rounded-lg hover:bg-secondary/80 transition-all"
                  >
                    Abbrechen
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-3">
          {categories.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">Keine Kategorien vorhanden</p>
              <button
                onClick={handleAddNew}
                className="px-6 py-2 bg-accent text-accent-foreground font-bold rounded-lg"
              >
                Erste Kategorie erstellen
              </button>
            </div>
          ) : (
            categories.map((category) => (
              <motion.div
                key={category.id}
                draggable
                onDragStart={() => handleDragStart(category.id)}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(category.id)}
                className="p-4 bg-card border border-border rounded-lg hover:border-accent transition-colors cursor-move"
              >
                <div className="flex items-center gap-4">
                  <GripVertical className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{category.icon || '📦'}</span>
                      <div>
                        <h3 className="font-bold text-lg">{category.name}</h3>
                        <p className="text-sm text-muted-foreground">{category.slug}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {category.featured && (
                      <span className="px-2 py-1 bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 text-xs font-bold rounded">
                        Empfohlen
                      </span>
                    )}
                    {!category.active && (
                      <span className="px-2 py-1 bg-gray-500/20 text-gray-700 dark:text-gray-300 text-xs font-bold rounded">
                        Inaktiv
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleEdit(category)}
                      className="p-2 hover:bg-secondary rounded-lg transition-colors"
                      title="Bearbeiten"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors"
                      title="Löschen"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {category.description && (
                  <p className="mt-3 text-sm text-muted-foreground ml-10">{stripHtml(category.description)}</p>
                )}
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}
