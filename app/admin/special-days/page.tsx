'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import { CalendarDays, Copy, Eye, Gift, Plus, Sparkles, Trash2 } from 'lucide-react'
import { CampaignEasterLayer, CampaignFireworksLayer, CampaignSchoolLayer, CampaignSnowLayer, CampaignSwissLayer } from '@/components/campaigns/SpecialDayCampaignSurfaces'

type Campaign = {
  id: string
  name: string
  holidayKey: string
  holidayType: string
  templateId: string
  theme: string
  animation: string
  animationSpeed: string
  placements: string[]
  status: string
  couponCode?: string
  discountPercent?: number
  buttonUrl: string
  startsAt: string
  endsAt: string
  countdown: boolean
  media: Record<string, string>
  colors: { background: string; foreground: string; accent: string; glow: string }
  translations: Record<string, { title: string; subtitle: string; description: string; buttonText: string; secondaryButtonText?: string }>
  analytics: { impressions: number; clicks: number; closes: number }
}

type Template = {
  id: string
  name: string
  category: string
  holidayKey: string
  theme: string
  animation: string
  colors: Campaign['colors']
  defaultTranslation: Campaign['translations']['de']
}

const placements = [
  ['cinematic_popup', 'Cinematic Popup'],
  ['fullscreen_popup', 'Fullscreen Popup'],
  ['hero_banner', 'Hero Banner'],
  ['announcement_bar', 'Announcement Bar'],
  ['floating_card', 'Floating Card'],
  ['bottom_sheet', 'Bottom Sheet'],
  ['countdown_banner', 'Countdown Banner'],
  ['product_page', 'Product Page'],
  ['checkout', 'Checkout'],
  ['customer_dashboard', 'Customer Dashboard'],
]

export default function SpecialDaysCampaignPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [templates, setTemplates] = useState<Template[]>([])
  const [holidays, setHolidays] = useState<Array<{ key: string; label: string; type: string; date: string }>>([])
  const [editing, setEditing] = useState<Campaign | null>(null)
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    const response = await fetch('/api/admin/special-day-campaigns', { credentials: 'include', cache: 'no-store' })
    const data = await response.json()
    setCampaigns(data.campaigns || [])
    setTemplates(data.templates || [])
    setHolidays(data.holidays || [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const stats = useMemo(() => ({
    active: campaigns.filter((item) => item.status === 'active').length,
    scheduled: campaigns.filter((item) => item.status === 'scheduled').length,
    impressions: campaigns.reduce((sum, item) => sum + (item.analytics?.impressions || 0), 0),
    clicks: campaigns.reduce((sum, item) => sum + (item.analytics?.clicks || 0), 0),
  }), [campaigns])

  function newCampaign(templateId?: string) {
    const template = templates.find((item) => item.id === templateId) || templates[0]
    const now = new Date()
    const end = new Date(now)
    end.setDate(end.getDate() + 7)
    setEditing({
      id: '',
      name: template?.name || 'Neue Kampagne',
      holidayKey: template?.holidayKey || 'custom',
      holidayType: 'commercial',
      templateId: template?.id || '',
      theme: template?.theme || 'minimal',
      animation: template?.animation || 'fade-in',
      animationSpeed: 'normal',
      placements: ['cinematic_popup'],
      status: 'draft',
      couponCode: '',
      discountPercent: 0,
      buttonUrl: '/produkte',
      startsAt: toLocalInput(now),
      endsAt: toLocalInput(end),
      countdown: true,
      media: {},
      colors: template?.colors || { background: '#07110d', foreground: '#ffffff', accent: '#26D872', glow: '#26D872' },
      translations: {
        de: template?.defaultTranslation || { title: 'Special Deal', subtitle: 'Kurzzeitig verfügbar.', description: 'Entdecken Sie unsere aktuelle Aktion.', buttonText: 'Jetzt entdecken' },
        fr: template?.defaultTranslation || { title: '', subtitle: '', description: '', buttonText: '' },
        it: template?.defaultTranslation || { title: '', subtitle: '', description: '', buttonText: '' },
        en: template?.defaultTranslation || { title: '', subtitle: '', description: '', buttonText: '' },
      },
      analytics: { impressions: 0, clicks: 0, closes: 0 },
    })
  }

  async function saveCampaign(event: FormEvent) {
    event.preventDefault()
    if (!editing) return
    const response = await fetch('/api/admin/special-day-campaigns', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...editing,
        startsAt: new Date(editing.startsAt).toISOString(),
        endsAt: new Date(editing.endsAt).toISOString(),
        timezone: 'Europe/Zurich',
      }),
    })
    const data = await response.json()
    if (!response.ok) {
      window.alert(data.error || 'Kampagne konnte nicht gespeichert werden.')
      return
    }
    setEditing(null)
    await load()
  }

  async function deleteItem(id: string) {
    if (!window.confirm('Kampagne löschen?')) return
    await fetch(`/api/admin/special-day-campaigns?id=${encodeURIComponent(id)}`, { method: 'DELETE', credentials: 'include' })
    await load()
  }

  function applyTemplate(templateId: string) {
    const template = templates.find((item) => item.id === templateId)
    if (!template || !editing) return
    setEditing({
      ...editing,
      templateId: template.id,
      name: template.name,
      holidayKey: template.holidayKey,
      theme: template.theme,
      animation: template.animation,
      colors: template.colors,
      translations: {
        ...editing.translations,
        de: template.defaultTranslation,
      },
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-black">Aktionen & Feiertage</h1>
          <p className="text-muted-foreground">Special Days Campaign Manager für Schweizer Feiertage und Sales Events</p>
        </div>
        <button onClick={() => newCampaign()} className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 font-black text-accent-foreground">
          <Plus className="h-4 w-4" />
          Neue Kampagne
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <Stat label="Aktiv" value={String(stats.active)} />
        <Stat label="Geplant" value={String(stats.scheduled)} />
        <Stat label="Impressions" value={String(stats.impressions)} />
        <Stat label="Clicks" value={String(stats.clicks)} />
      </div>

      <section className="rounded-lg border border-border bg-card p-5">
        <div className="mb-4 flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-accent" />
          <h2 className="text-xl font-black">Feiertagskalender & Vorlagen</h2>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {templates.slice(0, 20).map((template) => (
            <button key={template.id} onClick={() => newCampaign(template.id)} className="rounded-lg border border-border p-4 text-left transition hover:border-accent" style={{ background: template.colors.background, color: template.colors.foreground }}>
              <div className="text-xs font-black uppercase opacity-70">{template.category}</div>
              <div className="mt-2 font-black">{template.name}</div>
              <div className="mt-3 inline-flex rounded-full px-3 py-1 text-xs font-black" style={{ background: template.colors.accent, color: template.colors.background }}>Vorlage nutzen</div>
            </button>
          ))}
        </div>
      </section>

      <section className="overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border"><th className="px-4 py-3 text-left">Kampagne</th><th>Status</th><th>Zeitraum</th><th>Placements</th><th>Analytics</th><th className="text-right">Aktionen</th></tr></thead>
          <tbody>
            {campaigns.map((campaign) => (
              <tr key={campaign.id} className="border-b border-border">
                <td className="px-4 py-3">
                  <div className="font-black">{campaign.name}</div>
                  <div className="text-xs text-muted-foreground">{campaign.translations.de?.title}</div>
                </td>
                <td className="px-4 py-3"><span className="rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-black">{campaign.status}</span></td>
                <td className="px-4 py-3 text-muted-foreground">{formatDate(campaign.startsAt)} - {formatDate(campaign.endsAt)}</td>
                <td className="px-4 py-3 text-muted-foreground">{campaign.placements.join(', ')}</td>
                <td className="px-4 py-3 text-muted-foreground">{campaign.analytics.impressions} / {campaign.analytics.clicks} / {campaign.analytics.closes}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setEditing({ ...campaign, startsAt: toLocalInput(campaign.startsAt), endsAt: toLocalInput(campaign.endsAt) })} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border hover:border-accent"><Eye className="h-4 w-4" /></button>
                    <button onClick={() => setEditing({ ...campaign, id: '', name: `${campaign.name} Kopie`, startsAt: toLocalInput(campaign.startsAt), endsAt: toLocalInput(campaign.endsAt) })} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border hover:border-accent"><Copy className="h-4 w-4" /></button>
                    <button onClick={() => deleteItem(campaign.id)} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border hover:border-accent"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && campaigns.length === 0 && <div className="p-10 text-center text-muted-foreground">Noch keine Kampagnen vorhanden.</div>}
      </section>

      {editing && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 p-4">
          <form onSubmit={saveCampaign} className="mx-auto grid max-w-6xl gap-5 rounded-lg border border-border bg-background p-5 shadow-2xl lg:grid-cols-[1fr_25rem]">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black">Kampagne bearbeiten</h2>
                <button type="button" onClick={() => setEditing(null)} className="rounded-lg border border-border px-3 py-2 font-bold">Schließen</button>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Kampagnenname" value={editing.name} onChange={(value) => setEditing({ ...editing, name: value })} />
                <label className="space-y-1 text-sm font-bold">
                  <span>Vorlage</span>
                  <select value={editing.templateId} onChange={(event) => applyTemplate(event.target.value)} className="w-full rounded-lg border border-border bg-card px-3 py-2">
                    {templates.map((template) => <option key={template.id} value={template.id}>{template.name}</option>)}
                  </select>
                </label>
                <label className="space-y-1 text-sm font-bold">
                  <span>Feiertag</span>
                  <select value={editing.holidayKey} onChange={(event) => setEditing({ ...editing, holidayKey: event.target.value })} className="w-full rounded-lg border border-border bg-card px-3 py-2">
                    {holidays.map((holiday) => <option key={holiday.key} value={holiday.key}>{holiday.label}</option>)}
                    <option value="custom">Custom</option>
                  </select>
                </label>
                <label className="space-y-1 text-sm font-bold">
                  <span>Status</span>
                  <select value={editing.status} onChange={(event) => setEditing({ ...editing, status: event.target.value })} className="w-full rounded-lg border border-border bg-card px-3 py-2">
                    <option value="draft">Entwurf</option>
                    <option value="scheduled">Geplant</option>
                    <option value="active">Aktiv</option>
                    <option value="inactive">Passiv</option>
                  </select>
                </label>
                <Field label="Start" type="datetime-local" value={editing.startsAt} onChange={(value) => setEditing({ ...editing, startsAt: value })} />
                <Field label="Ende" type="datetime-local" value={editing.endsAt} onChange={(value) => setEditing({ ...editing, endsAt: value })} />
                <Field label="Button URL" value={editing.buttonUrl} onChange={(value) => setEditing({ ...editing, buttonUrl: value })} />
                <Field label="Coupon Code" value={editing.couponCode || ''} onChange={(value) => setEditing({ ...editing, couponCode: value })} />
                <Field label="Desktop Bild" value={editing.media.desktopImage || ''} onChange={(value) => setEditing({ ...editing, media: { ...editing.media, desktopImage: value } })} />
                <Field label="Video URL" value={editing.media.videoUrl || ''} onChange={(value) => setEditing({ ...editing, media: { ...editing.media, videoUrl: value } })} />
              </div>

              <div className="grid gap-3 md:grid-cols-4">
                {(['background', 'foreground', 'accent', 'glow'] as const).map((key) => (
                  <label key={key} className="space-y-1 text-sm font-bold">
                    <span>{key}</span>
                    <input type="color" value={editing.colors[key]} onChange={(event) => setEditing({ ...editing, colors: { ...editing.colors, [key]: event.target.value } })} className="h-10 w-full rounded border border-border bg-card" />
                  </label>
                ))}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Titel DE" value={editing.translations.de.title} onChange={(value) => setEditing({ ...editing, translations: { ...editing.translations, de: { ...editing.translations.de, title: value } } })} />
                <Field label="Untertitel DE" value={editing.translations.de.subtitle} onChange={(value) => setEditing({ ...editing, translations: { ...editing.translations, de: { ...editing.translations.de, subtitle: value } } })} />
                <Field label="Button DE" value={editing.translations.de.buttonText} onChange={(value) => setEditing({ ...editing, translations: { ...editing.translations, de: { ...editing.translations.de, buttonText: value } } })} />
                <Field label="Animation" value={editing.animation} onChange={(value) => setEditing({ ...editing, animation: value })} />
              </div>
              <textarea value={editing.translations.de.description} onChange={(event) => setEditing({ ...editing, translations: { ...editing.translations, de: { ...editing.translations.de, description: event.target.value } } })} className="min-h-24 w-full rounded-lg border border-border bg-card px-3 py-2" />

              <div>
                <p className="mb-2 text-sm font-black">Placements</p>
                <div className="flex flex-wrap gap-2">
                  {placements.map(([value, label]) => (
                    <label key={value} className={`rounded-full border px-3 py-2 text-xs font-black ${editing.placements.includes(value) ? 'border-accent bg-accent text-accent-foreground' : 'border-border'}`}>
                      <input type="checkbox" className="sr-only" checked={editing.placements.includes(value)} onChange={(event) => {
                        const next = event.target.checked ? [...editing.placements, value] : editing.placements.filter((item) => item !== value)
                        setEditing({ ...editing, placements: next })
                      }} />
                      {label}
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setEditing(null)} className="rounded-lg border border-border px-4 py-2 font-bold">Abbrechen</button>
                <button className="rounded-lg bg-accent px-5 py-2 font-black text-accent-foreground">Speichern</button>
              </div>
            </div>
            <CampaignPreview campaign={editing} />
          </form>
        </div>
      )}
    </div>
  )
}

function CampaignPreview({ campaign }: { campaign: Campaign }) {
  const t = campaign.translations.de
  return (
    <aside className="rounded-lg border border-border bg-card p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-black text-muted-foreground"><Sparkles className="h-4 w-4" /> Live Preview</div>
      <div className="relative overflow-hidden rounded-2xl p-6 text-center shadow-2xl" style={{ background: campaign.colors.background, color: campaign.colors.foreground }}>
        <div className="pointer-events-none absolute inset-0 opacity-40" style={{ background: `radial-gradient(circle at 20% 10%, ${campaign.colors.glow}, transparent 35%), radial-gradient(circle at 80% 0%, ${campaign.colors.accent}, transparent 30%)` }} />
        {campaign.theme === 'christmas' && <CampaignSnowLayer soft />}
        {(campaign.theme === 'new-year' || campaign.theme === 'silvester') && <CampaignFireworksLayer soft />}
        {campaign.theme === 'easter' && <CampaignEasterLayer soft />}
        {campaign.theme === 'school' && <CampaignSchoolLayer soft />}
        {campaign.theme === 'swiss' && <CampaignSwissLayer soft />}
        <div className="relative">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl" style={{ background: campaign.colors.accent, color: campaign.colors.background }}><Gift /></div>
          <p className="text-xs font-black uppercase tracking-[0.25em] opacity-80">{campaign.name}</p>
          <h3 className="mt-3 text-3xl font-black">{t.title}</h3>
          <p className="mt-2 font-bold opacity-80">{t.subtitle}</p>
          <p className="mt-4 text-sm opacity-80">{t.description}</p>
          {campaign.countdown && <div className="mt-5 grid grid-cols-4 gap-2 text-xs font-black"><span>07<br />Tage</span><span>12<br />Std</span><span>30<br />Min</span><span>00<br />Sek</span></div>}
          <button type="button" className="mt-6 rounded-full px-5 py-3 text-sm font-black" style={{ background: campaign.colors.accent, color: campaign.colors.background }}>{t.buttonText}</button>
        </div>
      </div>
    </aside>
  )
}

function Field({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return <label className="space-y-1 text-sm font-bold"><span>{label}</span><input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-lg border border-border bg-card px-3 py-2" /></label>
}

function Stat({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg border border-border bg-card p-4"><div className="text-xs font-black uppercase text-muted-foreground">{label}</div><div className="mt-2 text-2xl font-black">{value}</div></div>
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('de-CH')
}

function toLocalInput(value: string | Date) {
  const date = new Date(value)
  const offset = date.getTimezoneOffset()
  return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 16)
}
