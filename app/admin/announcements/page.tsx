'use client'

import { FormEvent, ReactNode, useEffect, useMemo, useState } from 'react'
import {
  Bell,
  CheckCircle2,
  Megaphone,
  Pencil,
  Plus,
  Save,
  Trash2,
} from 'lucide-react'
import { HtmlEditor } from '@/components/admin/HtmlEditor'

type Announcement = {
  id?: string
  title: string
  excerpt: string
  content: string
  type: 'info' | 'success' | 'warning' | 'error' | 'promotion' | 'maintenance'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  status: 'draft' | 'published' | 'archived'
  active: boolean
  audience: 'all' | 'customers' | 'guests' | 'selected_customers'
  selectedEmails: string[]
  placements: string[]
  startsAt: string
  endsAt: string
  imageUrl: string
  accentColor: string
  buttonText: string
  buttonUrl: string
  dismissible: boolean
  sortOrder: number
  readBy?: string[]
  dismissedBy?: string[]
  updatedAt?: string
}

const emptyForm: Announcement = {
  title: '',
  excerpt: '',
  content: '',
  type: 'info',
  priority: 'normal',
  status: 'published',
  active: true,
  audience: 'customers',
  selectedEmails: [],
  placements: ['customer_dashboard'],
  startsAt: '',
  endsAt: '',
  imageUrl: '',
  accentColor: '#22c55e',
  buttonText: '',
  buttonUrl: '',
  dismissible: true,
  sortOrder: 100,
}

const placements = [
  ['homepage_top', 'Homepage oben'],
  ['homepage_banner', 'Homepage Banner'],
  ['homepage_marquee', 'Homepage Marquee'],
  ['customer_dashboard', 'Kundenportal'],
  ['customer_messages', 'Kunden-Mitteilungen'],
  ['checkout', 'Checkout'],
  ['popup', 'Popup'],
]

export default function AdminAnnouncementsPage() {
  const [items, setItems] = useState<Announcement[]>([])
  const [form, setForm] = useState<Announcement>(emptyForm)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadItems()
  }, [])

  const publishedCount = useMemo(() => items.filter((item) => item.status === 'published' && item.active).length, [items])

  async function loadItems() {
    const response = await fetch('/api/admin/announcements', { credentials: 'include' })
    const data = await response.json()
    setItems(data.announcements || [])
  }

  async function save(event: FormEvent) {
    event.preventDefault()
    setLoading(true)
    setMessage('')
    const response = await fetch('/api/admin/announcements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(form),
    })
    const data = await response.json()
    setLoading(false)
    if (!response.ok) {
      setMessage(data.error || 'Mitteilung konnte nicht gespeichert werden.')
      return
    }
    setMessage('Mitteilung gespeichert.')
    setForm(emptyForm)
    await loadItems()
  }

  async function remove(id?: string) {
    if (!id) return
    await fetch(`/api/admin/announcements?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
      credentials: 'include',
    })
    await loadItems()
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/20">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.25em] text-accent">Kundenkommunikation</p>
              <h1 className="mt-2 text-3xl font-black md:text-5xl">Mitteilungen & Ankündigungen</h1>
              <p className="mt-3 max-w-2xl text-sm text-slate-300">
                Verwalten Sie Hinweise für Kundenportal, Homepage, Checkout, Banner und Popups zentral.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:min-w-72">
              <Metric label="Aktiv" value={publishedCount} />
              <Metric label="Gesamt" value={items.length} />
            </div>
          </div>
        </section>

        {message && (
          <div className="rounded-2xl border border-accent/30 bg-accent/10 px-4 py-3 text-sm font-bold text-accent">
            {message}
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <form onSubmit={save} className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.04] p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="flex items-center gap-2 text-xl font-black">
                <Plus className="h-5 w-5 text-accent" />
                {form.id ? 'Mitteilung bearbeiten' : 'Neue Mitteilung'}
              </h2>
              <button type="button" onClick={() => setForm(emptyForm)} className="text-sm font-bold text-slate-400 hover:text-white">
                Neu
              </button>
            </div>

            <Field label="Titel">
              <input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className="admin-input" required />
            </Field>
            <Field label="Kurztext">
              <input value={form.excerpt} onChange={(event) => setForm({ ...form, excerpt: event.target.value })} className="admin-input" />
            </Field>
            <Field label="Inhalt">
              <HtmlEditor
                value={form.content}
                onChange={(content) => setForm({ ...form, content })}
                minHeightClassName="min-h-40"
                required
              />
            </Field>

            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Typ">
                <select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value as Announcement['type'] })} className="admin-input">
                  <option value="info">Info</option>
                  <option value="success">Erfolg</option>
                  <option value="warning">Warnung</option>
                  <option value="error">Störung</option>
                  <option value="promotion">Aktion</option>
                  <option value="maintenance">Wartung</option>
                </select>
              </Field>
              <Field label="Priorität">
                <select value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value as Announcement['priority'] })} className="admin-input">
                  <option value="low">Niedrig</option>
                  <option value="normal">Normal</option>
                  <option value="high">Hoch</option>
                  <option value="urgent">Dringend</option>
                </select>
              </Field>
              <Field label="Status">
                <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as Announcement['status'] })} className="admin-input">
                  <option value="published">Veröffentlicht</option>
                  <option value="draft">Entwurf</option>
                  <option value="archived">Archiv</option>
                </select>
              </Field>
              <Field label="Zielgruppe">
                <select value={form.audience} onChange={(event) => setForm({ ...form, audience: event.target.value as Announcement['audience'] })} className="admin-input">
                  <option value="all">Alle</option>
                  <option value="customers">Kunden</option>
                  <option value="guests">Gäste</option>
                  <option value="selected_customers">Ausgewählte Kunden</option>
                </select>
              </Field>
            </div>

            <Field label="Platzierungen">
              <div className="grid gap-2 sm:grid-cols-2">
                {placements.map(([value, label]) => (
                  <label key={value} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm font-bold text-slate-200">
                    <input
                      type="checkbox"
                      checked={form.placements.includes(value)}
                      onChange={(event) => {
                        const next = event.target.checked
                          ? [...form.placements, value]
                          : form.placements.filter((item) => item !== value)
                        setForm({ ...form, placements: next })
                      }}
                    />
                    {label}
                  </label>
                ))}
              </div>
            </Field>

            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Start">
                <input type="datetime-local" value={form.startsAt} onChange={(event) => setForm({ ...form, startsAt: event.target.value })} className="admin-input" />
              </Field>
              <Field label="Ende">
                <input type="datetime-local" value={form.endsAt} onChange={(event) => setForm({ ...form, endsAt: event.target.value })} className="admin-input" />
              </Field>
              <Field label="Button Text">
                <input value={form.buttonText} onChange={(event) => setForm({ ...form, buttonText: event.target.value })} className="admin-input" />
              </Field>
              <Field label="Button URL">
                <input value={form.buttonUrl} onChange={(event) => setForm({ ...form, buttonUrl: event.target.value })} className="admin-input" />
              </Field>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="Farbe">
                <input type="color" value={form.accentColor} onChange={(event) => setForm({ ...form, accentColor: event.target.value })} className="h-12 w-full rounded-xl border border-white/10 bg-slate-900" />
              </Field>
              <Field label="Reihenfolge">
                <input type="number" value={form.sortOrder} onChange={(event) => setForm({ ...form, sortOrder: Number(event.target.value) })} className="admin-input" />
              </Field>
              <label className="flex items-end gap-2 pb-3 text-sm font-bold text-slate-200">
                <input type="checkbox" checked={form.active} onChange={(event) => setForm({ ...form, active: event.target.checked })} />
                Aktiv
              </label>
            </div>

            <button disabled={loading} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-accent px-5 py-4 text-sm font-black uppercase tracking-widest text-slate-950 transition hover:brightness-110 disabled:opacity-60">
              <Save className="h-5 w-5" />
              Speichern
            </button>
          </form>

          <section className="space-y-4">
            {items.length === 0 ? (
              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-10 text-center text-slate-300">
                <Megaphone className="mx-auto mb-4 h-12 w-12 text-accent" />
                Noch keine Mitteilungen erstellt.
              </div>
            ) : items.map((item) => (
              <article key={item.id} className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full px-3 py-1 text-xs font-black text-slate-950" style={{ backgroundColor: item.accentColor || '#22c55e' }}>
                        {item.priority}
                      </span>
                      <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-slate-300">{item.status}</span>
                      {item.active && <CheckCircle2 className="h-4 w-4 text-accent" />}
                    </div>
                    <h3 className="mt-3 text-xl font-black">{item.title}</h3>
                    <p className="mt-2 text-sm text-slate-300">{item.excerpt || stripHtml(item.content)}</p>
                    <p className="mt-3 text-xs text-slate-500">
                      {item.placements.join(', ')} · gelesen {item.readBy?.length || 0} · ausgeblendet {item.dismissedBy?.length || 0}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setForm({ ...emptyForm, ...item })} className="rounded-xl border border-white/10 p-3 text-slate-300 hover:bg-white/10 hover:text-white" aria-label="Bearbeiten">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => remove(item.id)} className="rounded-xl border border-red-400/30 p-3 text-red-300 hover:bg-red-500/10" aria-label="Löschen">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </section>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="text-xs font-black uppercase tracking-widest text-slate-400">{label}</span>
      {children}
    </label>
  )
}

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
      <p className="text-xs font-black uppercase tracking-widest text-slate-400">{label}</p>
      <p className="mt-2 text-3xl font-black">{value}</p>
    </div>
  )
}
