import fs from 'fs'
import path from 'path'

const STORE_FILE = path.join(process.cwd(), '.data', 'admin-login-slider.json')

export interface AdminLoginSlide {
  id: string
  title: string
  subtitle: string
  desktopImage: string
  mobileImage: string
  alt: string
  sortOrder: number
  active: boolean
  overlayOpacity: number
  startsAt: string
  endsAt: string
}

export interface AdminLoginSliderSettings {
  enabled: boolean
  autoplay: boolean
  intervalMs: number
  overlayColor: string
  overlayOpacity: number
  updatedAt: string
  slides: AdminLoginSlide[]
}

export const defaultAdminLoginSlider: AdminLoginSliderSettings = {
  enabled: true,
  autoplay: true,
  intervalMs: 6500,
  overlayColor: '#020617',
  overlayOpacity: 0.62,
  updatedAt: new Date().toISOString(),
  slides: [
    {
      id: 'dornach-night',
      title: 'MK-eMotors Dornach',
      subtitle: 'Sichere Verwaltung für Ihr E-Mobility-Geschäft',
      desktopImage: '/hero-background.png',
      mobileImage: '/hero-background.png',
      alt: 'Dornach und Schweizer Stadtpanorama bei Nacht',
      sortOrder: 1,
      active: true,
      overlayOpacity: 0.66,
      startsAt: '',
      endsAt: '',
    },
    {
      id: 'dornach-light',
      title: 'E-Mobility aus Dornach',
      subtitle: 'Produkte, Kunden, Bestellungen und Rechnungen zentral verwalten',
      desktopImage: '/hero-background-hell.png',
      mobileImage: '/hero-background-hell.png',
      alt: 'Helles MK-eMotors Dornach Hero Motiv',
      sortOrder: 2,
      active: true,
      overlayOpacity: 0.7,
      startsAt: '',
      endsAt: '',
    },
    {
      id: 'product-premium',
      title: 'Premium Elektromobilität',
      subtitle: 'Adminbereich für MK-eMotors Dornach',
      desktopImage: '/uploads/products/1783986326325-whatsappimage2024-10-24at17-09-30.webp',
      mobileImage: '/uploads/products/1783986326325-whatsappimage2024-10-24at17-09-30.webp',
      alt: 'Premium E-Mobility Produkt',
      sortOrder: 3,
      active: true,
      overlayOpacity: 0.68,
      startsAt: '',
      endsAt: '',
    },
    {
      id: 'brand-location',
      title: 'MK-eMotors Dornach',
      subtitle: 'E-Mobility mit Schweizer Präzision',
      desktopImage: '/images/location-motorcycle.png',
      mobileImage: '/images/location-motorcycle.png',
      alt: 'Motorrad und Standortmotiv',
      sortOrder: 4,
      active: true,
      overlayOpacity: 0.72,
      startsAt: '',
      endsAt: '',
    },
  ],
}

function ensureStore() {
  const dir = path.dirname(STORE_FILE)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  if (!fs.existsSync(STORE_FILE)) fs.writeFileSync(STORE_FILE, JSON.stringify(defaultAdminLoginSlider, null, 2))
}

export function getAdminLoginSliderSettings() {
  ensureStore()
  try {
    const stored = JSON.parse(fs.readFileSync(STORE_FILE, 'utf-8'))
    return normalizeSettings(stored)
  } catch {
    return defaultAdminLoginSlider
  }
}

export function saveAdminLoginSliderSettings(settings: Partial<AdminLoginSliderSettings>) {
  const next = normalizeSettings({
    ...getAdminLoginSliderSettings(),
    ...settings,
    slides: Array.isArray(settings.slides) ? settings.slides : getAdminLoginSliderSettings().slides,
    updatedAt: new Date().toISOString(),
  })
  ensureStore()
  fs.writeFileSync(STORE_FILE, JSON.stringify(next, null, 2))
  return next
}

function normalizeSettings(settings: Partial<AdminLoginSliderSettings>): AdminLoginSliderSettings {
  return {
    ...defaultAdminLoginSlider,
    ...settings,
    intervalMs: Math.max(3000, Math.min(12000, Number(settings.intervalMs || defaultAdminLoginSlider.intervalMs))),
    overlayOpacity: clampOpacity(settings.overlayOpacity ?? defaultAdminLoginSlider.overlayOpacity),
    slides: normalizeSlides(settings.slides),
  }
}

function normalizeSlides(slides?: Partial<AdminLoginSlide>[]) {
  const source = Array.isArray(slides) && slides.length > 0 ? slides : defaultAdminLoginSlider.slides
  return source.map((slide, index) => ({
    ...defaultAdminLoginSlider.slides[index % defaultAdminLoginSlider.slides.length],
    ...slide,
    id: String(slide.id || `slide-${index + 1}`),
    sortOrder: Number(slide.sortOrder || index + 1),
    overlayOpacity: clampOpacity(slide.overlayOpacity ?? defaultAdminLoginSlider.overlayOpacity),
  }))
}

function clampOpacity(value: number) {
  return Math.max(0, Math.min(0.95, Number(value)))
}
