'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Copy, Edit, Eye, EyeOff, Plus, Search, Trash2 } from 'lucide-react'
import type { ManagedPage } from '@/lib/pages-store'
import { HtmlEditor } from '@/components/admin/HtmlEditor'

type PageForm = Partial<ManagedPage>

export default function PagesManagementPage() {
  const [pages, setPages] = useState<ManagedPage[]>([])
  const [query, setQuery] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState<PageForm>({})

  const loadPages = async () => {
    const res = await fetch('/api/admin/pages', { cache: 'no-store' })
    const data = await res.json()
    setPages(data.pages || [])
  }

  useEffect(() => {
    loadPages()
  }, [])

  const filteredPages = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return pages
    return pages.filter((page) => [page.title, page.slug, page.language, page.seoTitle].join(' ').toLowerCase().includes(needle))
  }, [pages, query])

  const handleAddPage = () => {
    setEditingId(null)
    setFormData({ title: '', slug: '', language: 'de', content: '', seoTitle: '', seoDescription: '', active: true, visible: true })
    setShowForm(true)
  }

  const handleEditPage = (page: ManagedPage) => {
    setFormData(page)
    setEditingId(page.id)
    setShowForm(true)
  }

  const handleSave = async () => {
    const url = editingId ? `/api/admin/pages/${editingId}` : '/api/admin/pages'
    const method = editingId ? 'PUT' : 'POST'
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      alert(data.error || 'Seite konnte nicht gespeichert werden.')
      return
    }
    setShowForm(false)
    await loadPages()
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Diese Seite wirklich löschen?')) return
    await fetch(`/api/admin/pages/${id}`, { method: 'DELETE' })
    await loadPages()
  }

  const handleToggleActive = async (page: ManagedPage) => {
    await fetch(`/api/admin/pages/${page.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !page.active }),
    })
    await loadPages()
  }

  const duplicatePage = async (page: ManagedPage) => {
    await fetch('/api/admin/pages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...page,
        id: undefined,
        title: `${page.title} Kopie`,
        slug: `${page.slug}-kopie-${Date.now()}`,
        active: false,
      }),
    })
    await loadPages()
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Seitenverwaltung</h1>
          <p className="text-muted-foreground">{pages.length} Seiten im System</p>
        </div>
        <button onClick={handleAddPage} className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 font-bold text-accent-foreground">
          <Plus size={20} /> Neue Seite
        </button>
      </div>

      <div className="relative max-w-xl">
        <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Nach Titel, Slug oder Sprache suchen..."
          className="w-full rounded-lg border border-border bg-card py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-accent"
        />
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-lg border border-border bg-card p-6">
          <h2 className="mb-4 text-2xl font-bold">{editingId ? 'Seite bearbeiten' : 'Neue Seite'}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <label>
              <span className="mb-2 block font-medium">Seitentitel</span>
              <input value={formData.title || ''} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full rounded border border-border bg-background px-3 py-2" />
            </label>
            <label>
              <span className="mb-2 block font-medium">URL Slug</span>
              <input value={formData.slug || ''} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} className="w-full rounded border border-border bg-background px-3 py-2" />
            </label>
            <label>
              <span className="mb-2 block font-medium">Sprache</span>
              <input value={formData.language || 'de'} onChange={(e) => setFormData({ ...formData, language: e.target.value })} className="w-full rounded border border-border bg-background px-3 py-2" />
            </label>
            <label>
              <span className="mb-2 block font-medium">SEO Titel</span>
              <input value={formData.seoTitle || ''} onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })} className="w-full rounded border border-border bg-background px-3 py-2" />
            </label>
            <label className="md:col-span-2">
              <span className="mb-2 block font-medium">SEO Beschreibung</span>
              <input value={formData.seoDescription || ''} onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })} className="w-full rounded border border-border bg-background px-3 py-2" />
            </label>
            <div className="md:col-span-2">
              <HtmlEditor
                label="Inhalt"
                value={formData.content || ''}
                onChange={(content) => setFormData({ ...formData, content })}
                minHeightClassName="min-h-72"
              />
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-4">
            <label className="flex items-center gap-2"><input type="checkbox" checked={formData.active !== false} onChange={(e) => setFormData({ ...formData, active: e.target.checked })} /> Veröffentlicht</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={formData.visible !== false} onChange={(e) => setFormData({ ...formData, visible: e.target.checked })} /> Sichtbar</label>
          </div>
          <div className="mt-6 flex gap-2">
            <button onClick={handleSave} className="rounded-lg bg-accent px-4 py-2 font-bold text-accent-foreground">Speichern</button>
            <button onClick={() => setShowForm(false)} className="rounded-lg border border-border px-4 py-2 font-bold">Abbrechen</button>
          </div>
        </motion.div>
      )}

      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="px-4 py-3 text-left">Titel</th>
              <th className="px-4 py-3 text-left">Slug</th>
              <th className="px-4 py-3 text-left">Sprache</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">SEO</th>
              <th className="px-4 py-3 text-left">Aktualisiert</th>
              <th className="px-4 py-3 text-right">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {filteredPages.map((page) => (
              <tr key={page.id} className="border-b border-border">
                <td className="px-4 py-3 font-bold">{page.title || 'Ohne Titel'}</td>
                <td className="px-4 py-3">/{page.slug}</td>
                <td className="px-4 py-3">{page.language || 'de'}</td>
                <td className="px-4 py-3">{page.active ? 'Veröffentlicht' : 'Entwurf'} · {page.visible ? 'Sichtbar' : 'Versteckt'}</td>
                <td className="px-4 py-3">{page.seoTitle ? 'OK' : 'Fehlt'}</td>
                <td className="px-4 py-3">{new Date(page.updatedAt).toLocaleDateString('de-CH')}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <a href={`/${page.slug}`} target="_blank" className="rounded p-2 hover:bg-secondary" aria-label="Vorschau"><Eye size={18} /></a>
                    <button onClick={() => handleToggleActive(page)} className="rounded p-2 hover:bg-secondary" aria-label="Status ändern">{page.active ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                    <button onClick={() => handleEditPage(page)} className="rounded p-2 hover:bg-secondary" aria-label="Bearbeiten"><Edit size={18} /></button>
                    <button onClick={() => duplicatePage(page)} className="rounded p-2 hover:bg-secondary" aria-label="Kopieren"><Copy size={18} /></button>
                    <button onClick={() => handleDelete(page.id)} className="rounded p-2 text-destructive hover:bg-destructive/10" aria-label="Löschen"><Trash2 size={18} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredPages.length === 0 && <div className="p-8 text-center text-muted-foreground">Keine Seiten gefunden.</div>}
      </div>
    </div>
  )
}
