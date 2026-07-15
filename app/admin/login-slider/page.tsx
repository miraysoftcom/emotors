'use client'

import { useEffect, useState, type ChangeEvent } from 'react'
import { ImagePlus, Loader2, Plus, Save, Trash2 } from 'lucide-react'
import type { AdminLoginSlide, AdminLoginSliderSettings } from '@/lib/admin-login-slider-store'

const newSlide = (index: number): AdminLoginSlide => ({
  id: `slide-${Date.now()}-${index}`,
  title: 'MK-eMotors Dornach',
  subtitle: 'E-Mobility aus Dornach',
  desktopImage: '/hero-background.png',
  mobileImage: '/hero-background.png',
  alt: 'MK-eMotors Dornach Login Hintergrund',
  sortOrder: index + 1,
  active: true,
  overlayOpacity: 0.68,
  startsAt: '',
  endsAt: '',
})

export default function AdminLoginSliderPage() {
  const [settings, setSettings] = useState<AdminLoginSliderSettings | null>(null)
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/login-slider')
      .then((response) => response.json())
      .then(setSettings)
      .catch(() => setMessage('Login-Slider konnte nicht geladen werden.'))
  }, [])

  const update = (patch: Partial<AdminLoginSliderSettings>) => {
    setSettings((current) => current ? { ...current, ...patch } : current)
  }

  const updateSlide = (id: string, patch: Partial<AdminLoginSlide>) => {
    update({ slides: (settings?.slides || []).map((slide) => slide.id === id ? { ...slide, ...patch } : slide) })
  }

  const save = async () => {
    if (!settings) return
    setSaving(true)
    setMessage('')
    try {
      const response = await fetch('/api/admin/login-slider', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Speichern fehlgeschlagen.')
      setSettings(data)
      setMessage('Login-Slider wurde gespeichert.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Speichern fehlgeschlagen.')
    } finally {
      setSaving(false)
    }
  }

  const uploadImage = async (id: string, field: 'desktopImage' | 'mobileImage', event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setUploading(`${id}-${field}`)
    try {
      const payload = new FormData()
      payload.append('file', file)
      const response = await fetch('/api/admin/uploads', { method: 'POST', body: payload })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Upload fehlgeschlagen.')
      updateSlide(id, { [field]: data.url })
      setMessage('Bild wurde hochgeladen. Bitte speichern.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Upload fehlgeschlagen.')
    } finally {
      setUploading(null)
    }
  }

  if (!settings) {
    return <main className="min-h-screen bg-slate-950 p-8 text-white"><Loader2 className="h-6 w-6 animate-spin text-accent" /></main>
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <h1 className="text-3xl font-black">Admin Login Slider</h1>
            <p className="mt-2 text-sm text-slate-400">Hintergründe und Overlay der Admin-Anmeldung verwalten.</p>
          </div>
          <button onClick={save} disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-5 py-3 font-black text-accent-foreground disabled:opacity-60">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Speichern
          </button>
        </div>

        {message && <div className="mb-6 rounded-lg border border-accent/30 bg-accent/10 px-4 py-3 text-sm text-accent">{message}</div>}

        <section className="mb-6 grid gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-5 md:grid-cols-4">
          <Toggle label="Slider aktiv" checked={settings.enabled} onChange={(enabled) => update({ enabled })} />
          <Toggle label="Autoplay" checked={settings.autoplay} onChange={(autoplay) => update({ autoplay })} />
          <NumberField label="Intervall ms" value={settings.intervalMs} onChange={(intervalMs) => update({ intervalMs })} />
          <ColorField label="Overlay Farbe" value={settings.overlayColor} onChange={(overlayColor) => update({ overlayColor })} />
        </section>

        <div className="grid gap-5">
          {[...settings.slides].sort((a, b) => a.sortOrder - b.sortOrder).map((slide, index) => (
            <section key={slide.id} className="grid gap-5 rounded-2xl border border-white/10 bg-white/[0.04] p-5 lg:grid-cols-[260px_1fr]">
              <div className="overflow-hidden rounded-xl border border-white/10 bg-slate-900">
                {slide.desktopImage ? <img src={slide.desktopImage} alt={slide.alt} className="h-44 w-full object-cover" /> : <div className="flex h-44 items-center justify-center text-slate-500">Kein Bild</div>}
                <div className="p-3 text-xs text-slate-400">#{index + 1} · {slide.active ? 'Aktiv' : 'Inaktiv'}</div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Toggle label="Aktiv" checked={slide.active} onChange={(active) => updateSlide(slide.id, { active })} />
                <NumberField label="Sortierung" value={slide.sortOrder} onChange={(sortOrder) => updateSlide(slide.id, { sortOrder })} />
                <Input label="Titel" value={slide.title} onChange={(title) => updateSlide(slide.id, { title })} />
                <Input label="Untertitel" value={slide.subtitle} onChange={(subtitle) => updateSlide(slide.id, { subtitle })} />
                <Input label="Desktop Bild URL" value={slide.desktopImage} onChange={(desktopImage) => updateSlide(slide.id, { desktopImage })} />
                <Input label="Mobile Bild URL" value={slide.mobileImage} onChange={(mobileImage) => updateSlide(slide.id, { mobileImage })} />
                <UploadButton label="Desktop Bild hochladen" loading={uploading === `${slide.id}-desktopImage`} onChange={(event) => uploadImage(slide.id, 'desktopImage', event)} />
                <UploadButton label="Mobile Bild hochladen" loading={uploading === `${slide.id}-mobileImage`} onChange={(event) => uploadImage(slide.id, 'mobileImage', event)} />
                <Input label="Alt Text" value={slide.alt} onChange={(alt) => updateSlide(slide.id, { alt })} />
                <RangeField label="Overlay Stärke" value={slide.overlayOpacity} onChange={(overlayOpacity) => updateSlide(slide.id, { overlayOpacity })} />
                <Input label="Startdatum" value={slide.startsAt} onChange={(startsAt) => updateSlide(slide.id, { startsAt })} placeholder="YYYY-MM-DD" />
                <Input label="Enddatum" value={slide.endsAt} onChange={(endsAt) => updateSlide(slide.id, { endsAt })} placeholder="YYYY-MM-DD" />
                <button type="button" onClick={() => update({ slides: settings.slides.filter((item) => item.id !== slide.id) })} className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-500/30 px-4 py-3 text-sm font-bold text-red-200 hover:bg-red-500/10 md:col-span-2">
                  <Trash2 className="h-4 w-4" /> Bild entfernen
                </button>
              </div>
            </section>
          ))}
        </div>

        <button type="button" onClick={() => update({ slides: [...settings.slides, newSlide(settings.slides.length)] })} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-white/20 px-5 py-5 font-black text-white hover:border-accent hover:text-accent">
          <Plus className="h-5 w-5" /> Neues Slider-Bild hinzufügen
        </button>
      </div>
    </main>
  )
}

function Input({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string }) {
  return <label className="block"><span className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-400">{label}</span><input value={value || ''} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} className="h-11 w-full rounded-lg border border-white/10 bg-slate-950 px-3 text-sm text-white outline-none focus:border-accent" /></label>
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return <label className="block"><span className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-400">{label}</span><input type="number" value={value} onChange={(event) => onChange(Number(event.target.value) || 0)} className="h-11 w-full rounded-lg border border-white/10 bg-slate-950 px-3 text-sm text-white outline-none focus:border-accent" /></label>
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="block"><span className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-400">{label}</span><input type="color" value={value || '#020617'} onChange={(event) => onChange(event.target.value)} className="h-11 w-full rounded-lg border border-white/10 bg-slate-950 p-1" /></label>
}

function RangeField({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return <label className="block"><span className="mb-2 flex justify-between text-xs font-bold uppercase tracking-wide text-slate-400"><span>{label}</span><span>{value}</span></span><input type="range" min={0} max={0.95} step={0.01} value={value} onChange={(event) => onChange(Number(event.target.value))} className="w-full accent-accent" /></label>
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return <label className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-slate-950 px-3 py-3 text-sm font-bold">{label}<input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="h-4 w-4 accent-accent" /></label>
}

function UploadButton({ label, loading, onChange }: { label: string; loading: boolean; onChange: (event: ChangeEvent<HTMLInputElement>) => void }) {
  return <label className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-white/15 px-3 text-sm font-bold text-slate-300 hover:border-accent hover:text-accent">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}{label}<input type="file" accept="image/*" onChange={onChange} className="sr-only" /></label>
}
