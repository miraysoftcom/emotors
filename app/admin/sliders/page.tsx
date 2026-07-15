'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, Copy, Eye, ImageIcon, Plus, Save, Sparkles, Trash2, X } from 'lucide-react'
import Link from 'next/link'

interface Slide {
  id: number
  title: string
  subtitle?: string
  description?: string
  desktopImage?: string
  mobileImage?: string
  ctaText?: string
  ctaLink?: string
  animationType?: string
  textPosition?: string
  order?: number
  active?: boolean
  overlayOpacity?: number
  textColor?: string
  backgroundColor?: string
  createdAt?: string
  updatedAt?: string
}

const blankSlide = (order = 1): Slide => ({
  id: 0,
  title: 'Neuer Premium Slide',
  subtitle: 'MK-eMotors Dornach',
  description: 'Kuratiert, hochwertig und bereit für Ihre nächste Kampagne.',
  desktopImage: '/hero-background.png',
  mobileImage: '/hero-background.png',
  ctaText: 'Jetzt entdecken',
  ctaLink: '/produkte',
  animationType: 'zoom',
  textPosition: 'center',
  order,
  active: true,
  overlayOpacity: 42,
  textColor: '#ffffff',
  backgroundColor: '#050b08',
})

export default function SlidersManagement() {
  const [slides, setSlides] = useState<Slide[]>([])
  const [editing, setEditing] = useState<Slide | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [source, setSource] = useState('')

  async function loadSlides() {
    setLoading(true)
    const response = await fetch('/api/admin/sliders', { credentials: 'include', cache: 'no-store' })
    const data = await response.json()
    setSlides(Array.isArray(data.sliders) ? data.sliders : [])
    setSource(data.source || '')
    setLoading(false)
  }

  useEffect(() => {
    loadSlides()
  }, [])

  const stats = useMemo(() => ({
    total: slides.length,
    active: slides.filter((slide) => slide.active).length,
    inactive: slides.filter((slide) => !slide.active).length,
    media: slides.filter((slide) => slide.desktopImage || slide.mobileImage).length,
  }), [slides])

  async function saveSlide(event: FormEvent) {
    event.preventDefault()
    if (!editing) return
    setSaving(true)
    const response = await fetch('/api/admin/sliders', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editing),
    })
    const data = await response.json()
    setSaving(false)
    if (!response.ok) {
      window.alert(data.error || 'Slide konnte nicht gespeichert werden.')
      return
    }
    setEditing(null)
    await loadSlides()
  }

  async function removeSlide(slide: Slide) {
    if (!window.confirm(`Slide "${slide.title}" löschen?`)) return
    const response = await fetch(`/api/admin/sliders?id=${slide.id}`, { method: 'DELETE', credentials: 'include' })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) window.alert(data.error || 'Slide konnte nicht gelöscht werden.')
    await loadSlides()
  }

  async function toggleSlide(slide: Slide) {
    await saveInline({ ...slide, active: !slide.active })
  }

  async function duplicateSlide(slide: Slide) {
    const copy = { ...slide, id: 0, title: `${slide.title} Kopie`, order: slides.length + 1 }
    await saveInline(copy)
  }

  async function moveSlide(slide: Slide, direction: -1 | 1) {
    const ordered = [...slides].sort((a, b) => (a.order || 0) - (b.order || 0))
    const index = ordered.findIndex((item) => item.id === slide.id)
    const target = index + direction
    if (target < 0 || target >= ordered.length) return
    const swapped = [...ordered]
    ;[swapped[index], swapped[target]] = [swapped[target], swapped[index]]
    const items = swapped.map((item, itemIndex) => ({ id: item.id, order: itemIndex + 1 }))
    await fetch('/api/admin/sliders', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reorder', items }),
    })
    await loadSlides()
  }

  async function saveInline(slide: Slide) {
    await fetch('/api/admin/sliders', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(slide),
    })
    await loadSlides()
  }

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#040806] p-6 text-white shadow-2xl">
        <div className="pointer-events-none absolute inset-0 opacity-50 [background:radial-gradient(circle_at_20%_10%,rgba(38,216,114,.26),transparent_32%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,.12),transparent_28%)]" />
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.32em] text-accent">Homepage Hero Experience</p>
            <h1 className="mt-2 text-4xl font-black">Slider Verwaltung</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">Premium Hero Slides mit Live Preview, sauberer Speicherung, Reihenfolge und responsive Bildsteuerung.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/" target="_blank" className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-4 py-2 font-black hover:bg-white/10">
              <Eye className="h-4 w-4" />
              Startseite ansehen
            </Link>
            <button onClick={() => setEditing(blankSlide(slides.length + 1))} className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 font-black text-accent-foreground">
              <Plus className="h-4 w-4" />
              Neuer Slide
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <Stat label="Slides" value={String(stats.total)} />
        <Stat label="Aktiv" value={String(stats.active)} />
        <Stat label="Inaktiv" value={String(stats.inactive)} />
        <Stat label="Medien" value={String(stats.media)} />
      </div>

      <div className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
        Datenquelle: <span className="font-black text-foreground">{source || 'auto'}</span>. Änderungen werden über `/api/admin/sliders` gespeichert und auf der Startseite verwendet.
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_24rem]">
        <section className="space-y-4">
          {loading && <div className="rounded-lg border border-border bg-card p-10 text-center text-muted-foreground">Slides werden geladen...</div>}
          {!loading && slides.length === 0 && (
            <button onClick={() => setEditing(blankSlide(1))} className="w-full rounded-lg border border-dashed border-border bg-card p-10 text-center font-black hover:border-accent">
              Ersten Premium Slide erstellen
            </button>
          )}
          {slides.map((slide, index) => (
            <article key={slide.id} className="overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
              <div className="grid md:grid-cols-[16rem_1fr]">
                <div className="relative min-h-48 bg-black">
                  {slide.desktopImage ? <img src={slide.desktopImage} alt="" className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-muted-foreground"><ImageIcon /></div>}
                  <div className="absolute inset-0 bg-black/35" />
                  <span className="absolute left-3 top-3 rounded-full bg-black/65 px-3 py-1 text-xs font-black text-white">#{slide.order || index + 1}</span>
                </div>
                <div className="p-5">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-2xl font-black">{slide.title}</h2>
                        <span className={`rounded-full px-3 py-1 text-xs font-black ${slide.active ? 'bg-emerald-500/15 text-emerald-500' : 'bg-red-500/15 text-red-500'}`}>{slide.active ? 'Aktiv' : 'Inaktiv'}</span>
                      </div>
                      {slide.subtitle && <p className="mt-1 font-bold text-accent">{slide.subtitle}</p>}
                      {slide.description && <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{stripHtml(slide.description)}</p>}
                      <div className="mt-4 grid gap-2 text-xs text-muted-foreground sm:grid-cols-4">
                        <Meta label="Animation" value={slide.animationType || 'zoom'} />
                        <Meta label="Position" value={slide.textPosition || 'center'} />
                        <Meta label="Overlay" value={`${slide.overlayOpacity ?? 42}%`} />
                        <Meta label="CTA" value={slide.ctaText || '-'} />
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2">
                      <IconButton label="Hoch" onClick={() => moveSlide(slide, -1)} disabled={index === 0}><ArrowUp className="h-4 w-4" /></IconButton>
                      <IconButton label="Runter" onClick={() => moveSlide(slide, 1)} disabled={index === slides.length - 1}><ArrowDown className="h-4 w-4" /></IconButton>
                      <IconButton label="Aktiv" onClick={() => toggleSlide(slide)}>{slide.active ? <X className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}</IconButton>
                      <IconButton label="Duplizieren" onClick={() => duplicateSlide(slide)}><Copy className="h-4 w-4" /></IconButton>
                      <IconButton label="Bearbeiten" onClick={() => setEditing(slide)}><Save className="h-4 w-4" /></IconButton>
                      <IconButton label="Löschen" onClick={() => removeSlide(slide)}><Trash2 className="h-4 w-4" /></IconButton>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </section>

        <aside className="sticky top-24 h-fit rounded-2xl border border-border bg-card p-4">
          <p className="mb-3 text-sm font-black uppercase tracking-widest text-muted-foreground">Live Preview</p>
          <SlidePreview slide={editing || slides[0] || blankSlide(1)} compact />
        </aside>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 p-4 backdrop-blur">
          <form onSubmit={saveSlide} className="mx-auto grid max-w-6xl gap-5 rounded-2xl border border-border bg-background p-5 shadow-2xl xl:grid-cols-[1fr_28rem]">
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.28em] text-accent">Slide Editor</p>
                  <h2 className="text-2xl font-black">{editing.id ? 'Slide bearbeiten' : 'Neuer Slide'}</h2>
                </div>
                <button type="button" onClick={() => setEditing(null)} className="rounded-lg border border-border p-2"><X className="h-5 w-5" /></button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Titel" value={editing.title} onChange={(value) => setEditing({ ...editing, title: value })} required />
                <Field label="Untertitel" value={editing.subtitle || ''} onChange={(value) => setEditing({ ...editing, subtitle: value })} />
                <Field label="Desktop Bild URL" value={editing.desktopImage || ''} onChange={(value) => setEditing({ ...editing, desktopImage: value })} />
                <Field label="Mobile Bild URL" value={editing.mobileImage || ''} onChange={(value) => setEditing({ ...editing, mobileImage: value })} />
                <Field label="CTA Text" value={editing.ctaText || ''} onChange={(value) => setEditing({ ...editing, ctaText: value })} />
                <Field label="CTA Link" value={editing.ctaLink || ''} onChange={(value) => setEditing({ ...editing, ctaLink: value })} />
                <label className="space-y-1 text-sm font-bold">
                  <span>Animation</span>
                  <select value={editing.animationType || 'zoom'} onChange={(event) => setEditing({ ...editing, animationType: event.target.value })} className="w-full rounded-lg border border-border bg-card px-3 py-2">
                    <option value="zoom">Ken Burns Zoom</option>
                    <option value="fade">Fade</option>
                    <option value="slide">Slide</option>
                    <option value="parallax">Parallax</option>
                  </select>
                </label>
                <label className="space-y-1 text-sm font-bold">
                  <span>Textposition</span>
                  <select value={editing.textPosition || 'center'} onChange={(event) => setEditing({ ...editing, textPosition: event.target.value })} className="w-full rounded-lg border border-border bg-card px-3 py-2">
                    <option value="left">Links</option>
                    <option value="center">Mitte</option>
                    <option value="right">Rechts</option>
                  </select>
                </label>
                <Field label="Reihenfolge" type="number" value={String(editing.order || 1)} onChange={(value) => setEditing({ ...editing, order: Number(value) })} />
                <Field label="Overlay %" type="number" value={String(editing.overlayOpacity ?? 42)} onChange={(value) => setEditing({ ...editing, overlayOpacity: Number(value) })} />
              </div>

              <textarea value={editing.description || ''} onChange={(event) => setEditing({ ...editing, description: event.target.value })} className="min-h-28 w-full rounded-lg border border-border bg-card px-3 py-2" placeholder="Beschreibung" />

              <div className="grid gap-4 md:grid-cols-3">
                <ColorField label="Textfarbe" value={editing.textColor || '#ffffff'} onChange={(value) => setEditing({ ...editing, textColor: value })} />
                <ColorField label="Fallback Hintergrund" value={editing.backgroundColor || '#050b08'} onChange={(value) => setEditing({ ...editing, backgroundColor: value })} />
                <label className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2 text-sm font-black">
                  <input type="checkbox" checked={editing.active !== false} onChange={(event) => setEditing({ ...editing, active: event.target.checked })} className="h-5 w-5" />
                  Aktiv veröffentlichen
                </label>
              </div>

              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setEditing(null)} className="rounded-lg border border-border px-4 py-2 font-bold">Abbrechen</button>
                <button disabled={saving} className="rounded-lg bg-accent px-5 py-2 font-black text-accent-foreground">{saving ? 'Speichert...' : 'Speichern'}</button>
              </div>
            </div>
            <SlidePreview slide={editing} />
          </form>
        </div>
      )}
    </div>
  )
}

function SlidePreview({ slide, compact = false }: { slide: Slide; compact?: boolean }) {
  const position = slide.textPosition === 'left' ? 'items-start text-left' : slide.textPosition === 'right' ? 'items-end text-right' : 'items-center text-center'
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-black ${compact ? 'min-h-80' : 'min-h-[34rem]'}`}>
      {slide.desktopImage ? <img src={slide.desktopImage} alt="" className={`absolute inset-0 h-full w-full object-cover ${slide.animationType === 'zoom' ? 'scale-105' : ''}`} /> : <div className="absolute inset-0" style={{ background: slide.backgroundColor || '#050b08' }} />}
      <div className="absolute inset-0" style={{ background: `rgba(0,0,0,${(slide.overlayOpacity ?? 42) / 100})` }} />
      <div className={`relative flex h-full min-h-[inherit] flex-col justify-center p-8 ${position}`} style={{ color: slide.textColor || '#fff' }}>
        {slide.subtitle && <p className="text-xs font-black uppercase tracking-[0.3em] text-accent">{slide.subtitle}</p>}
        <h3 className={`${compact ? 'text-3xl' : 'text-5xl'} mt-3 font-black leading-tight`}>{slide.title}</h3>
        {slide.description && <p className="mt-4 max-w-xl text-sm leading-6 opacity-85">{stripHtml(slide.description)}</p>}
        {slide.ctaText && <span className="mt-6 inline-flex rounded-full bg-accent px-5 py-3 text-sm font-black text-accent-foreground">{slide.ctaText}</span>}
      </div>
    </div>
  )
}

function Field({ label, value, onChange, type = 'text', required = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean }) {
  return <label className="space-y-1 text-sm font-bold"><span>{label}</span><input required={required} type={type} value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-lg border border-border bg-card px-3 py-2" /></label>
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="space-y-1 text-sm font-bold"><span>{label}</span><input type="color" value={value} onChange={(event) => onChange(event.target.value)} className="h-10 w-full rounded-lg border border-border bg-card" /></label>
}

function Stat({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg border border-border bg-card p-4"><div className="text-xs font-black uppercase text-muted-foreground">{label}</div><div className="mt-2 text-2xl font-black">{value}</div></div>
}

function Meta({ label, value }: { label: string; value: string }) {
  return <div><span>{label}</span><p className="font-black text-foreground">{value}</p></div>
}

function IconButton({ label, onClick, disabled, children }: { label: string; onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return <button type="button" onClick={onClick} disabled={disabled} title={label} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border hover:border-accent disabled:opacity-40">{children}</button>
}

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}
