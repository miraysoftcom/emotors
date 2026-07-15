'use client'

import { useEffect, useMemo, useState, type ChangeEvent } from 'react'
import Link from 'next/link'
import { ArrowLeft, Eye, Loader, Save, Send, UploadCloud } from 'lucide-react'
import { ManagedHero } from '@/components/sections/ManagedHero'
import type { HeroButtonSettings, HeroSettings } from '@/lib/hero-settings-store'
import { HtmlEditor } from '@/components/admin/HtmlEditor'

type PreviewMode = 'desktop' | 'tablet' | 'mobile'
type HeroImageField = 'desktopImage' | 'tabletImage' | 'mobileImage' | 'lightDesktopImage' | 'lightTabletImage' | 'lightMobileImage'

const emptyButton = (index: number): HeroButtonSettings => ({
  id: `button-${Date.now()}-${index}`,
  active: true,
  text: 'Neuer Button',
  url: '/produkte',
  target: '_self',
  sortOrder: index + 1,
  variant: 'outline',
  backgroundColor: 'transparent',
  textColor: '#ffffff',
  borderColor: '#ffffff',
  hoverBackgroundColor: 'rgba(255,255,255,0.12)',
  hoverTextColor: '#ffffff',
  borderWidth: 2,
  borderRadius: 999,
  height: 56,
  paddingX: 36,
  fontSize: 16,
  fontWeight: 800,
})

export default function AdminHeroPage() {
  const [settings, setSettings] = useState<HeroSettings | null>(null)
  const [previewMode, setPreviewMode] = useState<PreviewMode>('desktop')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingField, setUploadingField] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/hero-settings')
      .then((response) => response.json())
      .then(setSettings)
      .catch(() => setMessage('Hero-Einstellungen konnten nicht geladen werden.'))
      .finally(() => setLoading(false))
  }, [])

  const previewWidth = useMemo(() => {
    if (previewMode === 'mobile') return '390px'
    if (previewMode === 'tablet') return '768px'
    return '100%'
  }, [previewMode])

  const update = (patch: Partial<HeroSettings>) => {
    setSettings((current) => current ? { ...current, ...patch } : current)
  }

  const updateButton = (id: string, patch: Partial<HeroButtonSettings>) => {
    update({
      buttons: (settings?.buttons || []).map((button) => (
        button.id === id ? { ...button, ...patch } : button
      )),
    })
  }

  const moveButton = (id: string, direction: -1 | 1) => {
    const buttons = [...(settings?.buttons || [])].sort((a, b) => a.sortOrder - b.sortOrder)
    const index = buttons.findIndex((button) => button.id === id)
    const target = index + direction
    if (index < 0 || target < 0 || target >= buttons.length) return
    const next = [...buttons]
    const temp = next[index]
    next[index] = next[target]
    next[target] = temp
    update({ buttons: next.map((button, buttonIndex) => ({ ...button, sortOrder: buttonIndex + 1 })) })
  }

  const save = async (action: 'draft' | 'publish') => {
    if (!settings) return
    setSaving(true)
    setMessage('')
    try {
      const response = await fetch('/api/admin/hero-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, settings }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Speichern fehlgeschlagen.')
      setSettings(data)
      setMessage(action === 'publish' ? 'Hero wurde veröffentlicht.' : 'Entwurf wurde gespeichert.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Speichern fehlgeschlagen.')
    } finally {
      setSaving(false)
    }
  }

  const uploadImage = async (field: HeroImageField, event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setUploadingField(field)
    try {
      const payload = new FormData()
      payload.append('file', file)
      const response = await fetch('/api/admin/uploads', { method: 'POST', body: payload })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Upload fehlgeschlagen.')
      update({ [field]: data.url } as Partial<HeroSettings>)
      setMessage('Bild wurde hochgeladen. Bitte speichern oder veröffentlichen.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Upload fehlgeschlagen.')
    } finally {
      setUploadingField(null)
    }
  }

  if (loading || !settings) {
    return (
      <main className="min-h-screen bg-slate-950 p-8 text-white">
        <Loader className="h-6 w-6 animate-spin text-accent" />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="border-b border-white/10 bg-slate-950/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard" className="rounded-lg border border-white/10 p-2 text-slate-300 hover:text-white">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-black">Hero-Bereich</h1>
              <p className="mt-1 text-sm text-slate-400">Startseiten-Banner verwalten und live prüfen.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => save('draft')} disabled={saving} className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-4 py-2 text-sm font-bold text-white hover:bg-white/10">
              <Save className="h-4 w-4" /> Entwurf speichern
            </button>
            <button onClick={() => save('publish')} disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-bold text-accent-foreground">
              <Send className="h-4 w-4" /> Veröffentlichen
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[430px_1fr] lg:px-8">
        <section className="space-y-5">
          {message && <div className="rounded-lg border border-accent/30 bg-accent/10 px-4 py-3 text-sm text-accent">{message}</div>}

          <Panel title="Allgemein">
            <Toggle label="Hero aktiv" checked={settings.enabled} onChange={(enabled) => update({ enabled })} />
            <Select label="Status" value={settings.status} onChange={(status) => update({ status: status as HeroSettings['status'] })}>
              <option value="draft">Entwurf</option>
              <option value="published">Veröffentlicht</option>
            </Select>
            <p className="text-xs text-slate-500">Aktualisiert: {new Date(settings.updatedAt).toLocaleString('de-CH')}</p>
          </Panel>

          <Panel title="Hintergrundbild">
            <UploadField label="Desktop Bild" field="desktopImage" value={settings.desktopImage} uploading={uploadingField === 'desktopImage'} onUpload={uploadImage} onChange={(value) => update({ desktopImage: value })} />
            <UploadField label="Tablet Bild" field="tabletImage" value={settings.tabletImage} uploading={uploadingField === 'tabletImage'} onUpload={uploadImage} onChange={(value) => update({ tabletImage: value })} />
            <UploadField label="Mobile Bild" field="mobileImage" value={settings.mobileImage} uploading={uploadingField === 'mobileImage'} onUpload={uploadImage} onChange={(value) => update({ mobileImage: value })} />
            <Input label="Alt Text" value={settings.imageAlt} onChange={(imageAlt) => update({ imageAlt })} />
            <div className="grid grid-cols-2 gap-3">
              <Select label="Position" value={settings.imagePosition} onChange={(imagePosition) => update({ imagePosition: imagePosition as HeroSettings['imagePosition'] })}>
                <option value="center">center</option>
                <option value="top">top</option>
                <option value="bottom">bottom</option>
                <option value="left">left</option>
                <option value="right">right</option>
              </Select>
              <Select label="Grösse" value={settings.imageSize} onChange={(imageSize) => update({ imageSize: imageSize as HeroSettings['imageSize'] })}>
                <option value="cover">cover</option>
                <option value="contain">contain</option>
                <option value="auto">auto</option>
              </Select>
            </div>
            <Input label="Eigene Position" value={settings.customImagePosition} onChange={(customImagePosition) => update({ customImagePosition })} placeholder="z.B. 50% 42%" />
            <Range label="Zoom" value={settings.imageZoom} min={1} max={1.6} step={0.05} onChange={(imageZoom) => update({ imageZoom })} />
          </Panel>

          <Panel title="Hell Theme Hero">
            <p className="text-sm leading-6 text-slate-400">
              Diese Werte gelten nur, wenn Kunden die helle Seite nutzen. Leere Werte fallen automatisch auf die normalen Hero-Einstellungen zurück.
            </p>
            <UploadField label="Hell Desktop Bild" field="lightDesktopImage" value={settings.lightDesktopImage} uploading={uploadingField === 'lightDesktopImage'} onUpload={uploadImage} onChange={(value) => update({ lightDesktopImage: value })} />
            <UploadField label="Hell Tablet Bild" field="lightTabletImage" value={settings.lightTabletImage} uploading={uploadingField === 'lightTabletImage'} onUpload={uploadImage} onChange={(value) => update({ lightTabletImage: value })} />
            <UploadField label="Hell Mobile Bild" field="lightMobileImage" value={settings.lightMobileImage} uploading={uploadingField === 'lightMobileImage'} onUpload={uploadImage} onChange={(value) => update({ lightMobileImage: value })} />
            <div className="grid grid-cols-2 gap-3">
              <Color label="Overlay Hell" value={settings.lightOverlayColor} onChange={(lightOverlayColor) => update({ lightOverlayColor })} />
              <Color label="Eyebrow Hell" value={settings.lightEyebrowColor} onChange={(lightEyebrowColor) => update({ lightEyebrowColor })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Color label="Titel Hell" value={settings.lightTitleColor} onChange={(lightTitleColor) => update({ lightTitleColor })} />
              <Color label="Text Hell" value={settings.lightDescriptionColor} onChange={(lightDescriptionColor) => update({ lightDescriptionColor })} />
            </div>
            <Range label="Hell Desktop Opazität" value={settings.lightOverlayOpacity} min={0} max={0.9} step={0.01} onChange={(lightOverlayOpacity) => update({ lightOverlayOpacity })} />
            <Range label="Hell Mobile Opazität" value={settings.lightOverlayOpacityMobile} min={0} max={0.95} step={0.01} onChange={(lightOverlayOpacityMobile) => update({ lightOverlayOpacityMobile })} />
            <Input label="Hell Gradient von" value={settings.lightGradientFrom} onChange={(lightGradientFrom) => update({ lightGradientFrom })} />
            <Input label="Hell Gradient bis" value={settings.lightGradientTo} onChange={(lightGradientTo) => update({ lightGradientTo })} />
          </Panel>

          <Panel title="Overlay">
            <Toggle label="Overlay aktiv" checked={settings.overlayEnabled} onChange={(overlayEnabled) => update({ overlayEnabled })} />
            <Color label="Overlay Farbe" value={settings.overlayColor} onChange={(overlayColor) => update({ overlayColor })} />
            <Range label="Desktop Opazität" value={settings.overlayOpacity} min={0} max={0.9} step={0.01} onChange={(overlayOpacity) => update({ overlayOpacity })} />
            <Range label="Mobile Opazität" value={settings.overlayOpacityMobile} min={0} max={0.95} step={0.01} onChange={(overlayOpacityMobile) => update({ overlayOpacityMobile })} />
            <Toggle label="Gradient aktiv" checked={settings.gradientEnabled} onChange={(gradientEnabled) => update({ gradientEnabled })} />
            <Input label="Gradient von" value={settings.gradientFrom} onChange={(gradientFrom) => update({ gradientFrom })} />
            <Input label="Gradient bis" value={settings.gradientTo} onChange={(gradientTo) => update({ gradientTo })} />
            <Input label="Gradient Richtung" value={settings.gradientDirection} onChange={(gradientDirection) => update({ gradientDirection })} placeholder="to bottom" />
          </Panel>

          <Panel title="Texte">
            <Toggle label="Kleiner Titel aktiv" checked={settings.eyebrowEnabled} onChange={(eyebrowEnabled) => update({ eyebrowEnabled })} />
            <Input label="Kleiner Titel" value={settings.eyebrow} onChange={(eyebrow) => update({ eyebrow })} />
            <Color label="Kleiner Titel Farbe" value={settings.eyebrowColor} onChange={(eyebrowColor) => update({ eyebrowColor })} />
            <Textarea label="Haupttitel" value={settings.title} onChange={(title) => update({ title })} rows={3} />
            <Color label="Titel Farbe" value={settings.titleColor} onChange={(titleColor) => update({ titleColor })} />
            <div className="grid grid-cols-3 gap-3">
              <NumberInput label="Desktop" value={settings.titleDesktopSize} onChange={(titleDesktopSize) => update({ titleDesktopSize })} />
              <NumberInput label="Tablet" value={settings.titleTabletSize} onChange={(titleTabletSize) => update({ titleTabletSize })} />
              <NumberInput label="Mobile" value={settings.titleMobileSize} onChange={(titleMobileSize) => update({ titleMobileSize })} />
            </div>
            <Toggle label="Beschreibung aktiv" checked={settings.descriptionEnabled} onChange={(descriptionEnabled) => update({ descriptionEnabled })} />
            <Textarea label="Beschreibung" value={settings.description} onChange={(description) => update({ description })} rows={3} />
            <Color label="Beschreibung Farbe" value={settings.descriptionColor} onChange={(descriptionColor) => update({ descriptionColor })} />
          </Panel>

          <Panel title="Layout">
            <div className="grid grid-cols-3 gap-3">
              <NumberInput label="Desktop vh" value={settings.heightDesktop} onChange={(heightDesktop) => update({ heightDesktop })} />
              <NumberInput label="Tablet vh" value={settings.heightTablet} onChange={(heightTablet) => update({ heightTablet })} />
              <NumberInput label="Mobile vh" value={settings.heightMobile} onChange={(heightMobile) => update({ heightMobile })} />
            </div>
            <NumberInput label="Min Höhe px" value={settings.minHeight} onChange={(minHeight) => update({ minHeight })} />
            <NumberInput label="Content Breite" value={settings.contentMaxWidth} onChange={(contentMaxWidth) => update({ contentMaxWidth })} />
            <div className="grid grid-cols-2 gap-3">
              <NumberInput label="Offset X" value={settings.contentOffsetX} onChange={(contentOffsetX) => update({ contentOffsetX })} />
              <NumberInput label="Offset Y" value={settings.contentOffsetY} onChange={(contentOffsetY) => update({ contentOffsetY })} />
            </div>
            <NumberInput label="Button Abstand" value={settings.buttonGap} onChange={(buttonGap) => update({ buttonGap })} />
          </Panel>

          <Panel title="Buttons">
            <div className="space-y-4">
              {[...settings.buttons].sort((a, b) => a.sortOrder - b.sortOrder).map((button, index) => (
                <div key={button.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <Toggle label={`Button ${index + 1}`} checked={button.active} onChange={(active) => updateButton(button.id, { active })} />
                    <div className="flex gap-2">
                      <button type="button" onClick={() => moveButton(button.id, -1)} className="rounded border border-white/10 px-2 py-1 text-xs">↑</button>
                      <button type="button" onClick={() => moveButton(button.id, 1)} className="rounded border border-white/10 px-2 py-1 text-xs">↓</button>
                    </div>
                  </div>
                  <Input label="Text" value={button.text} onChange={(text) => updateButton(button.id, { text })} />
                  <Input label="URL" value={button.url} onChange={(url) => updateButton(button.id, { url })} />
                  <div className="grid grid-cols-3 gap-3">
                    <Color label="BG" value={button.backgroundColor} onChange={(backgroundColor) => updateButton(button.id, { backgroundColor })} />
                    <Color label="Text" value={button.textColor} onChange={(textColor) => updateButton(button.id, { textColor })} />
                    <Color label="Border" value={button.borderColor} onChange={(borderColor) => updateButton(button.id, { borderColor })} />
                  </div>
                </div>
              ))}
            </div>
            <button type="button" onClick={() => update({ buttons: [...settings.buttons, emptyButton(settings.buttons.length)] })} className="mt-4 w-full rounded-lg border border-dashed border-white/20 px-4 py-3 text-sm font-bold text-white hover:border-accent">
              Button hinzufügen
            </button>
          </Panel>
        </section>

        <section className="lg:sticky lg:top-24 lg:h-fit">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-300">
              <Eye className="h-4 w-4" /> Live Vorschau
            </div>
            <div className="flex rounded-lg border border-white/10 p-1">
              {(['desktop', 'tablet', 'mobile'] as PreviewMode[]).map((mode) => (
                <button key={mode} onClick={() => setPreviewMode(mode)} className={`rounded px-3 py-1 text-xs font-bold ${previewMode === mode ? 'bg-accent text-accent-foreground' : 'text-slate-300'}`}>
                  {mode}
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900 p-3">
            <div className="mx-auto overflow-hidden rounded-xl" style={{ width: previewWidth, maxWidth: '100%' }}>
              <ManagedHero settings={settings} />
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/20">
      <h2 className="mb-4 text-lg font-black">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  )
}

function Input({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-400">{label}</span>
      <input value={value || ''} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="h-11 w-full rounded-lg border border-white/10 bg-slate-950 px-3 text-sm text-white outline-none focus:border-accent" />
    </label>
  )
}

function Textarea({ label, value, onChange, rows = 2 }: { label: string; value: string; onChange: (value: string) => void; rows?: number }) {
  return (
    <HtmlEditor label={label} value={value || ''} onChange={onChange} minHeightClassName={rows > 2 ? 'min-h-44' : 'min-h-32'} />
  )
}

function Select({ label, value, onChange, children }: { label: string; value: string; onChange: (value: string) => void; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-400">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="h-11 w-full rounded-lg border border-white/10 bg-slate-950 px-3 text-sm text-white outline-none focus:border-accent">
        {children}
      </select>
    </label>
  )
}

function NumberInput({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-400">{label}</span>
      <input type="number" value={value} onChange={(event) => onChange(Number(event.target.value) || 0)} className="h-11 w-full rounded-lg border border-white/10 bg-slate-950 px-3 text-sm text-white outline-none focus:border-accent" />
    </label>
  )
}

function Range({ label, value, min, max, step, onChange }: { label: string; value: number; min: number; max: number; step: number; onChange: (value: number) => void }) {
  return (
    <label className="block">
      <span className="mb-2 flex justify-between text-xs font-bold uppercase tracking-wide text-slate-400"><span>{label}</span><span>{value}</span></span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} className="w-full accent-accent" />
    </label>
  )
}

function Color({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const colorValue = /^#[0-9a-f]{6}$/i.test(value) ? value : '#ffffff'
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-400">{label}</span>
      <div className="flex h-11 overflow-hidden rounded-lg border border-white/10 bg-slate-950">
        <input type="color" value={colorValue} onChange={(event) => onChange(event.target.value)} className="h-full w-12 border-0 bg-transparent" />
        <input value={value} onChange={(event) => onChange(event.target.value)} className="min-w-0 flex-1 bg-transparent px-3 text-sm text-white outline-none" />
      </div>
    </label>
  )
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-slate-950 px-3 py-3 text-sm font-bold">
      {label}
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="h-4 w-4 accent-accent" />
    </label>
  )
}

function UploadField({ label, field, value, uploading, onUpload, onChange }: {
  label: string
  field: HeroImageField
  value: string
  uploading: boolean
  onUpload: (field: HeroImageField, event: ChangeEvent<HTMLInputElement>) => void
  onChange: (value: string) => void
}) {
  return (
    <div>
      <Input label={label} value={value} onChange={onChange} />
      <label className="mt-2 flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-white/15 px-3 py-2 text-sm font-bold text-slate-300 hover:border-accent hover:text-accent">
        {uploading ? <Loader className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
        Bild hochladen
        <input type="file" accept="image/*" className="sr-only" onChange={(event) => onUpload(field, event)} />
      </label>
    </div>
  )
}
