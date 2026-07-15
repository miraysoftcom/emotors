import fs from 'fs'
import path from 'path'

const STORE_FILE = path.join(process.cwd(), '.data', 'special-day-campaigns.json')

export type CampaignStatus = 'draft' | 'scheduled' | 'active' | 'inactive' | 'expired'
export type CampaignPlacement =
  | 'cinematic_popup'
  | 'fullscreen_popup'
  | 'hero_banner'
  | 'slider_banner'
  | 'announcement_bar'
  | 'floating_card'
  | 'bottom_sheet'
  | 'exit_intent'
  | 'scroll_trigger'
  | 'mobile_fullscreen'
  | 'desktop_modal'
  | 'countdown_banner'
  | 'product_page'
  | 'checkout'
  | 'customer_dashboard'

export interface CampaignTranslation {
  title: string
  subtitle: string
  description: string
  buttonText: string
  secondaryButtonText?: string
}

export interface SpecialDayCampaign {
  id: string
  name: string
  holidayKey: string
  holidayType: 'official' | 'commercial' | 'custom'
  templateId: string
  theme: string
  animation: string
  animationSpeed: 'slow' | 'normal' | 'fast' | 'custom'
  customDurationMs?: number
  placements: CampaignPlacement[]
  status: CampaignStatus
  couponCode?: string
  discountPercent?: number
  buttonUrl: string
  secondaryButtonUrl?: string
  startsAt: string
  endsAt: string
  timezone: string
  countdown: boolean
  dismissMode: 'session' | 'daily' | 'campaign' | 'never'
  trigger: {
    onLoad: boolean
    delaySeconds: number
    scrollPercent: number
    exitIntent: boolean
  }
  targeting: {
    pagePaths: string[]
    device: 'all' | 'mobile' | 'desktop'
    authenticated: 'all' | 'yes' | 'no'
    language: 'de' | 'fr' | 'it' | 'en' | 'all'
  }
  media: {
    desktopImage?: string
    tabletImage?: string
    mobileImage?: string
    videoUrl?: string
    posterUrl?: string
    logoUrl?: string
    productImage?: string
  }
  colors: {
    background: string
    foreground: string
    accent: string
    glow: string
  }
  translations: Record<'de' | 'fr' | 'it' | 'en', CampaignTranslation>
  analytics: {
    impressions: number
    clicks: number
    closes: number
  }
  createdAt: string
  updatedAt: string
}

export interface CampaignTemplate {
  id: string
  name: string
  category: string
  holidayKey: string
  theme: string
  animation: string
  colors: SpecialDayCampaign['colors']
  defaultTranslation: CampaignTranslation
}

export const swissSpecialDays = [
  { key: 'new-year', type: 'official', date: '01-01', label: '1. Januar - Neujahr' },
  { key: 'berchtoldstag', type: 'official', date: '01-02', label: '2. Januar - Berchtoldstag' },
  { key: 'good-friday', type: 'official', date: 'easter-2', label: 'Karfreitag' },
  { key: 'easter-monday', type: 'official', date: 'easter+1', label: 'Ostermontag' },
  { key: 'auffahrt', type: 'official', date: 'easter+39', label: 'Auffahrt' },
  { key: 'pfingstmontag', type: 'official', date: 'easter+50', label: 'Pfingstmontag' },
  { key: 'swiss-national-day', type: 'official', date: '08-01', label: '1. August - Schweizer Bundesfeier' },
  { key: 'christmas', type: 'official', date: '12-25', label: '25. Dezember - Weihnachten' },
  { key: 'stephanstag', type: 'official', date: '12-26', label: '26. Dezember - Stephanstag' },
  { key: 'valentines', type: 'commercial', date: '02-14', label: 'Valentinstag' },
  { key: 'spring', type: 'commercial', date: '03-20', label: 'Frühlingsangebote' },
  { key: 'summer-sale', type: 'commercial', date: '06-21', label: 'Sommer Sale' },
  { key: 'school-start', type: 'commercial', date: '08-12', label: 'Schulanfang Aktionen' },
  { key: 'autumn-sale', type: 'commercial', date: '09-22', label: 'Herbst Sale' },
  { key: 'halloween', type: 'commercial', date: '10-31', label: 'Halloween' },
  { key: 'black-friday', type: 'commercial', date: '11-last-friday', label: 'Black Friday' },
  { key: 'cyber-monday', type: 'commercial', date: 'black-friday+3', label: 'Cyber Monday' },
  { key: 'advent', type: 'commercial', date: '12-01', label: 'Advent Aktionen' },
  { key: 'nikolaus', type: 'commercial', date: '12-06', label: 'Nikolaus' },
  { key: 'silvester', type: 'commercial', date: '12-31', label: 'Silvester Angebote' },
] as const

export const campaignTemplates: CampaignTemplate[] = [
  template('new-year-gold', 'Neujahr Gold Fireworks', 'Cinematic', 'new-year', 'new-year', 'fireworks', '#080605', '#fff7d6', '#f6c453', '#f6c453', 'Frohes neues Jahr', 'Starten Sie elektrisch ins neue Jahr.', 'Exklusive Neujahrsvorteile auf ausgewählte E-Mobility Modelle.'),
  template('valentine-glow', 'Valentinstag Glow', 'Seasonal', 'valentines', 'valentine', 'floating-hearts', '#220714', '#ffe7ef', '#ff4d8d', '#ff9dbc', 'Valentinstag Aktion', 'Mobilität, die Freude schenkt.', 'Romantische Angebote für Premium E-Scooter und City Fahrzeuge.'),
  template('spring-pastel', 'Frühling Pastell', 'Light', 'spring', 'spring', 'petals', '#f4fff7', '#102016', '#65c985', '#b5f5c9', 'Frühlingsangebote', 'Leicht, frisch, elektrisch.', 'Entdecken Sie neue Mobilität für sonnige Tage.'),
  template('easter-soft', 'Ostern Soft Motion', 'Seasonal', 'easter-monday', 'easter', 'bounce', '#fff8e8', '#261a09', '#f59e0b', '#fcd34d', 'Osterangebote', 'Premium Deals zu Ostern.', 'Sichern Sie sich zeitlich begrenzte E-Mobility Vorteile.'),
  template('summer-light', 'Sommer Sale Light', 'Modern', 'summer-sale', 'summer', 'heat-shimmer', '#041b2d', '#f7fbff', '#ffd34d', '#38bdf8', 'Sommer Sale', 'Elektrisch durch den Sommer.', 'Sommerliche Preisvorteile auf ausgewählte Modelle.'),
  template('swiss-august', 'Swiss Alps 1. August', 'Swiss', 'swiss-national-day', 'swiss', 'swiss-flag-wave', '#b00020', '#ffffff', '#ffffff', '#ff3355', '1. August Aktion', 'Schweizer Mobilität. Elektrisch gedacht.', 'Feiern Sie die Bundesfeier mit exklusiven MK-eMotors Angeboten.'),
  template('school-modern', 'Schulanfang Modern', 'Modern', 'school-start', 'school', 'slide-up', '#082f49', '#eff6ff', '#facc15', '#38bdf8', 'Schulanfang Aktionen', 'Smart in den Alltag starten.', 'Praktische Mobilität für Ausbildung, Arbeit und Stadt.'),
  template('autumn-leaves', 'Herbst Falling Leaves', 'Seasonal', 'autumn-sale', 'autumn', 'falling-leaves', '#23130a', '#fff7ed', '#f97316', '#fb923c', 'Herbst Sale', 'Starke Deals für kühle Tage.', 'Jetzt Premium E-Mobility mit Herbstvorteil sichern.'),
  template('halloween-fog', 'Halloween Fog', 'Dark', 'halloween', 'halloween', 'smoke', '#10051f', '#fff7ed', '#f97316', '#a855f7', 'Halloween Deals', 'Nur für kurze Zeit.', 'Dunkle Preise, helle Performance.'),
  template('black-friday-neon', 'Black Friday Neon', 'Black Friday', 'black-friday', 'black-friday', 'red-light-pulse', '#020202', '#ffffff', '#ef233c', '#ff0033', 'Black Friday', 'Nur für kurze Zeit.', 'Maximale Rabatte auf ausgewählte E-Scooter und E-Motorräder.'),
  template('cyber-grid', 'Cyber Monday Grid', 'Dark', 'cyber-monday', 'cyber', 'glitch', '#020617', '#e0f2fe', '#38bdf8', '#2563eb', 'Cyber Monday', 'Digitale Deals. Elektrische Power.', 'Online exklusive Angebote für Premium Mobilität.'),
  template('christmas-snow', 'Christmas Snow Luxury', 'Christmas', 'christmas', 'christmas', 'snow', '#170507', '#fff7ed', '#d4af37', '#f87171', 'Frohe Weihnachten', 'Festliche E-Mobility Angebote.', 'Schenken Sie Bewegungsfreiheit mit Premium Elektrofahrzeugen.'),
  template('advent-calendar', 'Advent Calendar', 'Countdown', 'advent', 'advent', 'sparkle', '#1f0f05', '#fff7ed', '#f59e0b', '#fde68a', 'Advent Aktionen', 'Jeden Tag ein neuer Vorteil.', 'Entdecken Sie täglich wechselnde Weihnachtsangebote.'),
  template('nikolaus-gift', 'Nikolaus Gift', 'Seasonal', 'nikolaus', 'nikolaus', 'gift-pop', '#7f1d1d', '#ffffff', '#ffffff', '#fecaca', 'Nikolaus Aktion', 'Kleine Überraschung, großer Fahrspaß.', 'Kurzzeitige Vorteile auf ausgewählte Modelle.'),
  template('silvester-premium', 'Silvester Premium', 'Luxury', 'silvester', 'silvester', 'golden-glow', '#050505', '#fff7d6', '#fbbf24', '#fde68a', 'Silvester Angebote', 'Elektrisch ins neue Jahr.', 'Premium Deals vor Mitternacht sichern.'),
  template('minimal-green', 'Minimal Green', 'Minimal', 'custom', 'minimal', 'fade-in', '#07110d', '#f7fff9', '#26D872', '#26D872', 'Special Deal', 'Kurzzeitig verfügbar.', 'Entdecken Sie unsere aktuelle Aktion.'),
  template('luxury-glass', 'Luxury Glass', 'Luxury', 'custom', 'glass', 'glassmorphism', '#08110d', '#ffffff', '#b6f7c8', '#26D872', 'Premium Aktion', 'Exklusiv bei MK-eMotors.', 'Ein eleganter Vorteil für Ihre nächste Fahrt.'),
  template('product-focus', 'Product Focus', 'Product Focus', 'custom', 'product', '3d-card', '#101820', '#ffffff', '#26D872', '#38bdf8', 'Produkt im Fokus', 'Nur solange Vorrat reicht.', 'Top Modell mit besonderem Kampagnenvorteil.'),
  template('fullscreen-impact', 'Fullscreen Impact', 'Fullscreen', 'custom', 'impact', 'zoom-in', '#000000', '#ffffff', '#ef4444', '#f97316', 'Mega Aktion', 'Jetzt entdecken.', 'Ein starker Auftritt für Ihre wichtigste Kampagne.'),
  template('countdown-urgent', 'Countdown Urgent', 'Countdown', 'custom', 'countdown', 'light-sweep', '#111827', '#ffffff', '#facc15', '#f59e0b', 'Countdown Deal', 'Die Zeit läuft.', 'Sichern Sie sich den Vorteil vor Ablauf der Aktion.'),
]

function template(id: string, name: string, category: string, holidayKey: string, theme: string, animation: string, background: string, foreground: string, accent: string, glow: string, title: string, subtitle: string, description: string): CampaignTemplate {
  return {
    id,
    name,
    category,
    holidayKey,
    theme,
    animation,
    colors: { background, foreground, accent, glow },
    defaultTranslation: { title, subtitle, description, buttonText: 'Jetzt entdecken', secondaryButtonText: 'Später' },
  }
}

function ensureStore() {
  const dir = path.dirname(STORE_FILE)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  if (!fs.existsSync(STORE_FILE)) fs.writeFileSync(STORE_FILE, JSON.stringify([], null, 2))
}

function readCampaigns() {
  ensureStore()
  try {
    return JSON.parse(fs.readFileSync(STORE_FILE, 'utf-8')) as SpecialDayCampaign[]
  } catch {
    return []
  }
}

function writeCampaigns(items: SpecialDayCampaign[]) {
  ensureStore()
  fs.writeFileSync(STORE_FILE, JSON.stringify(items, null, 2))
}

export function getCampaigns() {
  return readCampaigns().map(normalizeCampaign).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
}

export function getCampaign(id: string) {
  return getCampaigns().find((item) => item.id === id) || null
}

export function upsertCampaign(input: Partial<SpecialDayCampaign>) {
  const items = getCampaigns()
  const now = new Date().toISOString()
  const templateItem = campaignTemplates.find((item) => item.id === input.templateId) || campaignTemplates[0]
  const existing = input.id ? items.find((item) => item.id === input.id) : null
  const id = input.id || `campaign-${Date.now()}`
  const campaign = normalizeCampaign({
    ...defaultCampaignFromTemplate(templateItem),
    ...existing,
    ...input,
    id,
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  } as SpecialDayCampaign)
  writeCampaigns(existing ? items.map((item) => item.id === id ? campaign : item) : [campaign, ...items])
  return campaign
}

export function deleteCampaign(id: string) {
  const items = getCampaigns()
  const existing = items.find((item) => item.id === id)
  if (!existing) return null
  writeCampaigns(items.filter((item) => item.id !== id))
  return existing
}

export function getActiveCampaigns(options: { placement?: CampaignPlacement; pagePath?: string; device?: 'mobile' | 'desktop' | 'all' } = {}) {
  const now = Date.now()
  return getCampaigns().filter((campaign) => {
    if (!['active', 'scheduled'].includes(campaign.status)) return false
    if (campaign.startsAt && new Date(campaign.startsAt).getTime() > now) return false
    if (campaign.endsAt && new Date(campaign.endsAt).getTime() < now) return false
    if (options.placement && !campaign.placements.includes(options.placement)) return false
    if (options.pagePath && campaign.targeting.pagePaths.length > 0 && !campaign.targeting.pagePaths.some((path) => options.pagePath?.startsWith(path))) return false
    if (options.device && campaign.targeting.device !== 'all' && campaign.targeting.device !== options.device) return false
    return true
  })
}

export function recordCampaignInteraction(id: string, type: 'impressions' | 'clicks' | 'closes') {
  const items = getCampaigns()
  const existing = items.find((item) => item.id === id)
  if (!existing) return null
  const next = {
    ...existing,
    analytics: {
      ...existing.analytics,
      [type]: (existing.analytics[type] || 0) + 1,
    },
    updatedAt: new Date().toISOString(),
  }
  writeCampaigns(items.map((item) => item.id === id ? next : item))
  return next
}

export function defaultCampaignFromTemplate(templateItem = campaignTemplates[0]): SpecialDayCampaign {
  const now = new Date()
  const end = new Date(now)
  end.setDate(end.getDate() + 7)
  const translations = {
    de: templateItem.defaultTranslation,
    fr: templateItem.defaultTranslation,
    it: templateItem.defaultTranslation,
    en: templateItem.defaultTranslation,
  }
  return {
    id: '',
    name: templateItem.name,
    holidayKey: templateItem.holidayKey,
    holidayType: templateItem.holidayKey === 'custom' ? 'custom' : (swissSpecialDays.find((item) => item.key === templateItem.holidayKey)?.type as 'official' | 'commercial') || 'commercial',
    templateId: templateItem.id,
    theme: templateItem.theme,
    animation: templateItem.animation,
    animationSpeed: 'normal',
    placements: ['cinematic_popup'],
    status: 'draft',
    couponCode: '',
    discountPercent: 0,
    buttonUrl: '/produkte',
    secondaryButtonUrl: '',
    startsAt: now.toISOString(),
    endsAt: end.toISOString(),
    timezone: 'Europe/Zurich',
    countdown: true,
    dismissMode: 'session',
    trigger: { onLoad: true, delaySeconds: 1, scrollPercent: 0, exitIntent: false },
    targeting: { pagePaths: ['/'], device: 'all', authenticated: 'all', language: 'de' },
    media: {},
    colors: templateItem.colors,
    translations,
    analytics: { impressions: 0, clicks: 0, closes: 0 },
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  }
}

function normalizeCampaign(campaign: SpecialDayCampaign): SpecialDayCampaign {
  const templateItem = campaignTemplates.find((item) => item.id === campaign.templateId) || campaignTemplates[0]
  const fallback = defaultCampaignFromTemplate(templateItem)
  return {
    ...fallback,
    ...campaign,
    placements: Array.isArray(campaign.placements) && campaign.placements.length ? campaign.placements : fallback.placements,
    trigger: { ...fallback.trigger, ...campaign.trigger },
    targeting: { ...fallback.targeting, ...campaign.targeting },
    media: { ...fallback.media, ...campaign.media },
    colors: { ...fallback.colors, ...campaign.colors },
    translations: { ...fallback.translations, ...campaign.translations },
    analytics: { ...fallback.analytics, ...campaign.analytics },
  }
}
