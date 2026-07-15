'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Copy, Edit2, Eye, Plus, Save, Trash2, X } from 'lucide-react'
import type { MarqueeBanner } from '@/lib/marquees-store'
import { HtmlEditor } from '@/components/admin/HtmlEditor'

const placements = [
  ['homepage_top', 'Homepage oben'],
  ['homepage_after_hero', 'Homepage nach Hero'],
  ['homepage_middle', 'Homepage Mitte'],
  ['homepage_bottom', 'Homepage unten'],
  ['header_top', 'Header oben'],
  ['header_bottom', 'Header unten'],
  ['footer_top', 'Footer oben'],
  ['footer_bottom', 'Footer unten'],
  ['content_top', 'Inhalt oben'],
  ['content_bottom', 'Inhalt unten'],
  ['product_page', 'Produktseite'],
  ['category_page', 'Kategorieseite'],
  ['cart_page', 'Warenkorb'],
  ['checkout_page', 'Checkout'],
  ['account_page', 'Kundenkonto'],
]

const blank: Partial<MarqueeBanner> = {
  title: '',
  text: '',
  imageUrl: '',
  icon: '',
  linkUrl: '',
  buttonText: '',
  buttonUrl: '',
  placement: 'header_top',
  pages: '*',
  fontFamily: 'inherit',
  fontSize: 14,
  fontWeight: 700,
  textColor: '#ffffff',
  backgroundColor: '#0f172a',
  borderColor: '#334155',
  borderWidth: 1,
  animationDirection: 'left',
  animationSpeed: 28,
  pauseOnHover: true,
  active: true,
  showDesktop: true,
  showTablet: true,
  showMobile: true,
  startsAt: '',
  endsAt: '',
  sortOrder: 1,
}

export default function BannersManagement() {
  const [items, setItems] = useState<MarqueeBanner[]>([])
  const [form, setForm] = useState<Partial<MarqueeBanner>>(blank)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadItems()
  }, [])

  const loadItems = async () => {
    setLoading(true)
    const res = await fetch('/api/admin/marquees', { credentials: 'include' })
    if (res.status === 401) {
      window.location.href = '/admin/login'
      return
    }
    const data = await res.json()
    setItems(data.marquees || [])
    setLoading(false)
  }

  const startCreate = () => {
    setForm({ ...blank, sortOrder: items.length + 1 })
    setEditingId(null)
    setShowForm(true)
  }

  const startEdit = (item: MarqueeBanner) => {
    setForm(item)
    setEditingId(item.id)
    setShowForm(true)
  }

  const saveItem = async () => {
    const url = editingId ? `/api/admin/marquees/${editingId}` : '/api/admin/marquees'
    await fetch(url, {
      method: editingId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(form),
    })
    setShowForm(false)
    setEditingId(null)
    await loadItems()
  }

  const duplicateItem = async (item: MarqueeBanner) => {
    const { id, createdAt, updatedAt, views, clicks, ...copy } = item
    await fetch('/api/admin/marquees', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ ...copy, title: `${item.title} Kopie`, active: false }),
    })
    await loadItems()
  }

  const toggleActive = async (item: MarqueeBanner) => {
    await fetch(`/api/admin/marquees/${item.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ ...item, active: !item.active }),
    })
    await loadItems()
  }

  const deleteItem = async (id: number) => {
    await fetch(`/api/admin/marquees/${id}`, { method: 'DELETE', credentials: 'include' })
    await loadItems()
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-white/10 bg-slate-950 px-5 py-6 text-white shadow-2xl shadow-black/10 md:flex md:items-center md:justify-between md:gap-4">
        <div>
          <p className="mb-2 text-xs font-black uppercase tracking-[0.24em] text-accent">Startseite & Hinweise</p>
          <h1 className="text-3xl font-black">Marquee & Banner Management</h1>
          <p className="mt-2 text-sm text-slate-400">Verwalte Text, Bild, Link, Animation, Zeitplanung und responsive Sichtbarkeit.</p>
        </div>
        <button onClick={startCreate} className="mt-5 inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-3 font-semibold text-accent-foreground md:mt-0">
          <Plus size={18} />
          Neuer Marquee
        </button>
      </div>

      {showForm && (
        <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-border bg-card p-5">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-bold">{editingId ? 'Marquee bearbeiten' : 'Neuer Marquee'}</h2>
            <button onClick={() => setShowForm(false)} className="rounded-lg border border-border p-2"><X size={18} /></button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Titel" value={form.title || ''} onChange={(value) => setForm({ ...form, title: value })} />
            <div className="md:col-span-2">
              <HtmlEditor
                label="Text"
                value={form.text || ''}
                onChange={(text) => setForm({ ...form, text })}
                minHeightClassName="min-h-36"
              />
            </div>
            <Field label="Bild URL" value={form.imageUrl || ''} onChange={(value) => setForm({ ...form, imageUrl: value })} />
            <Field label="Icon Name" value={form.icon || ''} onChange={(value) => setForm({ ...form, icon: value })} />
            <Field label="Link URL" value={form.linkUrl || ''} onChange={(value) => setForm({ ...form, linkUrl: value })} />
            <Field label="Button Text" value={form.buttonText || ''} onChange={(value) => setForm({ ...form, buttonText: value })} />
            <Field label="Button URL" value={form.buttonUrl || ''} onChange={(value) => setForm({ ...form, buttonUrl: value })} />
            <label className="space-y-2 text-sm font-semibold">
              <span>Platzierung</span>
              <select value={form.placement || 'header_top'} onChange={(event) => setForm({ ...form, placement: event.target.value })} className="w-full rounded-lg border border-border bg-background px-4 py-3">
                {placements.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
            <Field label="Seiten Targeting (* oder /produkte,/cart)" value={form.pages || '*'} onChange={(value) => setForm({ ...form, pages: value })} />
            <div className="grid gap-4 sm:grid-cols-3 md:col-span-2">
              <NumberField label="Font Size" value={form.fontSize || 14} onChange={(value) => setForm({ ...form, fontSize: value })} />
              <NumberField label="Font Weight" value={form.fontWeight || 700} onChange={(value) => setForm({ ...form, fontWeight: value })} />
              <NumberField label="Animation Speed" value={form.animationSpeed || 28} onChange={(value) => setForm({ ...form, animationSpeed: value })} />
            </div>
            <div className="grid gap-4 sm:grid-cols-3 md:col-span-2">
              <Field label="Textfarbe" value={form.textColor || '#ffffff'} onChange={(value) => setForm({ ...form, textColor: value })} type="color" />
              <Field label="Hintergrund" value={form.backgroundColor || '#0f172a'} onChange={(value) => setForm({ ...form, backgroundColor: value })} type="color" />
              <Field label="Rahmenfarbe" value={form.borderColor || '#334155'} onChange={(value) => setForm({ ...form, borderColor: value })} type="color" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2 md:col-span-2">
              <Field label="Startdatum" value={form.startsAt || ''} onChange={(value) => setForm({ ...form, startsAt: value })} type="datetime-local" />
              <Field label="Enddatum" value={form.endsAt || ''} onChange={(value) => setForm({ ...form, endsAt: value })} type="datetime-local" />
            </div>
            <div className="flex flex-wrap gap-4 md:col-span-2">
              {[
                ['active', 'Aktiv'],
                ['pauseOnHover', 'Hover Pause'],
                ['showDesktop', 'Desktop'],
                ['showTablet', 'Tablet'],
                ['showMobile', 'Mobil'],
              ].map(([key, label]) => (
                <label key={key} className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm">
                  <input type="checkbox" checked={Boolean(form[key as keyof MarqueeBanner])} onChange={(event) => setForm({ ...form, [key]: event.target.checked })} />
                  {label}
                </label>
              ))}
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button onClick={saveItem} className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-3 font-semibold text-white">
              <Save size={18} />
              Speichern
            </button>
            <button onClick={() => setShowForm(false)} className="rounded-lg border border-border px-5 py-3 font-semibold">Abbrechen</button>
          </div>
        </motion.section>
      )}

      <div className="rounded-xl border border-border bg-card">
        {loading ? (
          <div className="p-8 text-muted-foreground">Marquees werden geladen...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left">Titel</th>
                  <th className="px-4 py-3 text-left">Platzierung</th>
                  <th className="px-4 py-3 text-left">Sichtbarkeit</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Statistik</th>
                  <th className="px-4 py-3 text-right">Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-border">
                    <td className="px-4 py-3">
                      <div className="font-semibold">{item.title}</div>
                      <div className="max-w-md truncate text-xs text-muted-foreground">{stripHtml(item.text)}</div>
                    </td>
                    <td className="px-4 py-3">{placements.find(([value]) => value === item.placement)?.[1] || item.placement}</td>
                    <td className="px-4 py-3">{[item.showDesktop && 'Desktop', item.showTablet && 'Tablet', item.showMobile && 'Mobil'].filter(Boolean).join(', ')}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleActive(item)} className={`rounded-full px-3 py-1 text-xs font-semibold ${item.active ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200'}`}>
                        {item.active ? 'Aktiv' : 'Inaktiv'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      <span className="inline-flex items-center gap-1"><Eye size={14} /> {item.views}</span>
                      <span className="ml-3">Clicks {item.clicks}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => startEdit(item)} className="rounded-lg border border-border p-2"><Edit2 size={16} /></button>
                        <button onClick={() => duplicateItem(item)} className="rounded-lg border border-border p-2"><Copy size={16} /></button>
                        <button onClick={() => deleteItem(item.id)} className="rounded-lg border border-red-500/30 p-2 text-red-500"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function Field({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return (
    <label className="space-y-2 text-sm font-semibold">
      <span>{label}</span>
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-lg border border-border bg-background px-4 py-3" />
    </label>
  )
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return <Field label={label} value={String(value)} onChange={(next) => onChange(Number(next) || 0)} />
}

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}
