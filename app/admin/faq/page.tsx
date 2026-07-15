'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ChevronDown, GripVertical, Loader2, Plus, Save, Search, Trash2 } from 'lucide-react'
import type { FAQCategory, FAQItem } from '@/lib/faq-store'
import { HtmlEditor } from '@/components/admin/HtmlEditor'

type FAQForm = Partial<FAQItem> & {
  keywordsText?: string
  searchTermsText?: string
}

const emptyForm: FAQForm = {
  question: '',
  title: '',
  answer: '',
  category: 'Allgemein',
  categorySlug: 'allgemein',
  slug: '',
  seoTitle: '',
  seoDescription: '',
  canonicalUrl: '',
  keywordsText: '',
  searchTermsText: '',
  popular: false,
  featured: false,
  showOnHomepage: false,
  showInFooter: false,
  showOnCategoryPage: true,
  showOnProductPage: false,
  showOnBlog: false,
  status: 'active',
}

export default function FAQManagement() {
  const [faqs, setFaqs] = useState<FAQItem[]>([])
  const [categories, setCategories] = useState<FAQCategory[]>([])
  const [form, setForm] = useState<FAQForm>(emptyForm)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [categoryDraft, setCategoryDraft] = useState('')
  const [draggedId, setDraggedId] = useState<number | null>(null)

  const loadData = async () => {
    setLoading(true)
    try {
      const [faqRes, categoryRes] = await Promise.all([
        fetch('/api/admin/faqs?limit=500&status=all', { cache: 'no-store' }),
        fetch('/api/admin/faq-categories', { cache: 'no-store' }),
      ])
      const faqData = await faqRes.json()
      const categoryData = await categoryRes.json()
      setFaqs(faqData.faqs || [])
      setCategories(categoryData.categories || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const filteredFaqs = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()
    return faqs.filter((faq) => {
      const matchesCategory = filterCategory === 'all' || faq.categorySlug === filterCategory
      const matchesSearch = !query || [faq.question, faq.answer, faq.slug, faq.category, ...faq.keywords, ...faq.searchTerms]
        .join(' ')
        .toLowerCase()
        .includes(query)
      return matchesCategory && matchesSearch
    })
  }, [faqs, filterCategory, searchTerm])

  const startCreate = () => {
    const firstCategory = categories[0]
    setEditingId(null)
    setForm({
      ...emptyForm,
      category: firstCategory?.name || 'Allgemein',
      categorySlug: firstCategory?.slug || 'allgemein',
      order: faqs.length + 1,
    })
    setShowForm(true)
  }

  const startEdit = (faq: FAQItem) => {
    setEditingId(faq.id)
    setForm({
      ...faq,
      keywordsText: faq.keywords.join(', '),
      searchTermsText: faq.searchTerms.join(', '),
    })
    setShowForm(true)
  }

  const saveFAQ = async () => {
    if (!form.question?.trim() || !form.answer?.trim()) {
      alert('Bitte Frage und Antwort ausfüllen.')
      return
    }

    setSaving(true)
    const selectedCategory = categories.find((category) => category.slug === form.categorySlug)
    const payload = {
      ...form,
      category: selectedCategory?.name || form.category || 'Allgemein',
      categorySlug: selectedCategory?.slug || form.categorySlug || 'allgemein',
      keywords: form.keywordsText,
      searchTerms: form.searchTermsText,
      seoTitle: form.seoTitle || form.question,
      title: form.title || form.question,
    }

    const url = editingId ? `/api/admin/faqs/${editingId}` : '/api/admin/faqs'
    const method = editingId ? 'PUT' : 'POST'
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    setSaving(false)

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      alert(data.error || 'FAQ konnte nicht gespeichert werden.')
      return
    }

    setShowForm(false)
    setEditingId(null)
    setForm(emptyForm)
    await loadData()
  }

  const deleteFAQ = async (id: number) => {
    if (!confirm('Diese FAQ wirklich löschen?')) return
    await fetch(`/api/admin/faqs/${id}`, { method: 'DELETE' })
    await loadData()
  }

  const addCategory = async () => {
    if (!categoryDraft.trim()) return
    await fetch('/api/admin/faq-categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: categoryDraft.trim(),
        description: `${categoryDraft.trim()} FAQ-Kategorie`,
        order: categories.length + 1,
        active: true,
      }),
    })
    setCategoryDraft('')
    await loadData()
  }

  const deleteCategory = async (id: number) => {
    if (!confirm('Kategorie löschen? Zugeordnete Fragen werden nach Allgemein verschoben.')) return
    await fetch(`/api/admin/faq-categories/${id}`, { method: 'DELETE' })
    await loadData()
  }

  const dropFAQ = async (target: FAQItem) => {
    if (!draggedId || draggedId === target.id) return
    const dragged = faqs.find((faq) => faq.id === draggedId)
    if (!dragged) return

    await Promise.all([
      fetch(`/api/admin/faqs/${dragged.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: target.order }),
      }),
      fetch(`/api/admin/faqs/${target.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: dragged.order }),
      }),
    ])
    setDraggedId(null)
    await loadData()
  }

  const flagFields: Array<[keyof FAQItem, string]> = [
    ['popular', 'Beliebte Frage'],
    ['featured', 'Öne çıkan Frage'],
    ['showOnHomepage', 'Ana sayfada göster'],
    ['showInFooter', 'Footer’da göster'],
    ['showOnCategoryPage', 'Kategori sayfasında göster'],
    ['showOnProductPage', 'Ürün sayfasında göster'],
    ['showOnBlog', 'Blogda göster'],
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="rounded-lg p-2 hover:bg-secondary" aria-label="Zurück">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-black uppercase tracking-widest text-accent">FAQ Verwaltung</h1>
              <p className="text-sm text-muted-foreground">{faqs.length} Fragen, {categories.length} Kategorien</p>
            </div>
          </div>
          <button
            onClick={startCreate}
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 font-bold text-accent-foreground shadow-sm"
          >
            <Plus className="h-5 w-5" />
            Neue FAQ
          </button>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[320px_1fr] lg:px-8">
        <aside className="space-y-6">
          <section className="rounded-lg border border-border bg-card p-4">
            <h2 className="mb-4 text-lg font-black">Kategorien</h2>
            <div className="space-y-2">
              <button
                onClick={() => setFilterCategory('all')}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm font-bold ${filterCategory === 'all' ? 'bg-accent text-accent-foreground' : 'bg-secondary'}`}
              >
                Alle Kategorien
              </button>
              {categories.map((category) => (
                <div key={category.id} className="flex items-center gap-2">
                  <button
                    onClick={() => setFilterCategory(category.slug)}
                    className={`flex-1 rounded-lg px-3 py-2 text-left text-sm font-bold ${filterCategory === category.slug ? 'bg-accent text-accent-foreground' : 'bg-secondary'}`}
                  >
                    {category.name}
                  </button>
                  <button
                    onClick={() => deleteCategory(category.id)}
                    className="rounded-lg p-2 text-red-500 hover:bg-secondary"
                    aria-label={`${category.name} löschen`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <input
                value={categoryDraft}
                onChange={(event) => setCategoryDraft(event.target.value)}
                placeholder="Neue Kategorie"
                className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent"
              />
              <button onClick={addCategory} className="rounded-lg bg-accent px-3 py-2 text-accent-foreground">
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </section>

          <section className="rounded-lg border border-border bg-card p-4">
            <label className="mb-2 block text-sm font-bold">Suche</label>
            <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Frage, Antwort, Keyword..."
                className="w-full bg-transparent text-sm outline-none"
              />
            </div>
          </section>
        </aside>

        <main>
          {showForm && (
            <section className="mb-8 rounded-lg border border-border bg-card p-5">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-xl font-black">{editingId ? 'FAQ bearbeiten' : 'Neue FAQ erstellen'}</h2>
                <button onClick={() => setShowForm(false)} className="text-sm font-bold text-muted-foreground hover:text-foreground">
                  Schließen
                </button>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <label className="block lg:col-span-2">
                  <span className="mb-2 block text-sm font-bold">Frage *</span>
                  <input value={form.question || ''} onChange={(event) => setForm({ ...form, question: event.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-accent" />
                </label>
                <label className="block lg:col-span-2">
                  <HtmlEditor
                    label="Antwort"
                    value={form.answer || ''}
                    onChange={(answer) => setForm({ ...form, answer })}
                    minHeightClassName="min-h-56"
                    required
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-bold">Kategorie</span>
                  <select value={form.categorySlug || 'allgemein'} onChange={(event) => setForm({ ...form, categorySlug: event.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-accent">
                    {categories.map((category) => <option key={category.slug} value={category.slug}>{category.name}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-bold">Status</span>
                  <select value={form.status || 'active'} onChange={(event) => setForm({ ...form, status: event.target.value as FAQItem['status'] })} className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-accent">
                    <option value="active">Aktiv</option>
                    <option value="inactive">Inaktiv</option>
                  </select>
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-bold">Slug</span>
                  <input value={form.slug || ''} onChange={(event) => setForm({ ...form, slug: event.target.value })} placeholder="automatisch aus Frage" className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-accent" />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-bold">Canonical URL</span>
                  <input value={form.canonicalUrl || ''} onChange={(event) => setForm({ ...form, canonicalUrl: event.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-accent" />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-bold">SEO Title</span>
                  <input value={form.seoTitle || ''} onChange={(event) => setForm({ ...form, seoTitle: event.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-accent" />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-bold">SEO Description</span>
                  <input value={form.seoDescription || ''} onChange={(event) => setForm({ ...form, seoDescription: event.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-accent" />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-bold">Keywords</span>
                  <input value={form.keywordsText || ''} onChange={(event) => setForm({ ...form, keywordsText: event.target.value })} placeholder="kommagetrennt" className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-accent" />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-bold">Search Terms</span>
                  <input value={form.searchTermsText || ''} onChange={(event) => setForm({ ...form, searchTermsText: event.target.value })} placeholder="kommagetrennt" className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-accent" />
                </label>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {flagFields.map(([field, label]) => (
                  <label key={field} className="flex items-center gap-3 rounded-lg border border-border bg-background px-3 py-3 text-sm font-bold">
                    <input
                      type="checkbox"
                      checked={Boolean(form[field])}
                      onChange={(event) => setForm({ ...form, [field]: event.target.checked })}
                      className="h-4 w-4 accent-current"
                    />
                    {label}
                  </label>
                ))}
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button onClick={() => setShowForm(false)} className="rounded-lg border border-border px-4 py-2 font-bold">
                  Abbrechen
                </button>
                <button onClick={saveFAQ} disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 font-bold text-accent-foreground disabled:opacity-60">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Speichern
                </button>
              </div>
            </section>
          )}

          {loading ? (
            <div className="rounded-lg border border-border bg-card p-10 text-center text-muted-foreground">FAQs werden geladen...</div>
          ) : (
            <div className="space-y-3">
              {filteredFaqs.map((faq) => (
                <article
                  key={faq.id}
                  draggable
                  onDragStart={() => setDraggedId(faq.id)}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => dropFAQ(faq)}
                  className="rounded-lg border border-border bg-card transition hover:border-accent/50"
                >
                  <div className="flex items-start gap-3 p-4">
                    <GripVertical className="mt-1 h-5 w-5 shrink-0 cursor-grab text-muted-foreground" />
                    <button onClick={() => setExpandedId(expandedId === faq.id ? null : faq.id)} className="flex flex-1 items-start gap-3 text-left">
                      <ChevronDown className={`mt-1 h-5 w-5 shrink-0 transition-transform ${expandedId === faq.id ? 'rotate-180' : ''}`} />
                      <span>
                        <span className="block font-black">{faq.question}</span>
                        <span className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                          <span className="rounded bg-secondary px-2 py-1">{faq.category}</span>
                          <span className="rounded bg-secondary px-2 py-1">{faq.status === 'active' ? 'Aktiv' : 'Inaktiv'}</span>
                          {faq.featured && <span className="rounded bg-secondary px-2 py-1">Featured</span>}
                          {faq.showOnHomepage && <span className="rounded bg-secondary px-2 py-1">Homepage</span>}
                        </span>
                      </span>
                    </button>
                    <button onClick={() => startEdit(faq)} className="rounded-lg border border-border px-3 py-2 text-sm font-bold hover:border-accent">
                      Bearbeiten
                    </button>
                    <button onClick={() => deleteFAQ(faq.id)} className="rounded-lg p-2 text-red-500 hover:bg-secondary" aria-label="FAQ löschen">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  {expandedId === faq.id && (
                    <div className="border-t border-border px-12 py-4 text-sm leading-7 text-muted-foreground">
                      <p className="whitespace-pre-line">{faq.answer}</p>
                      <p className="mt-4 text-xs">Slug: {faq.slug} | SEO: {faq.seoTitle}</p>
                    </div>
                  )}
                </article>
              ))}
              {filteredFaqs.length === 0 && (
                <div className="rounded-lg border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
                  Keine FAQs gefunden.
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
