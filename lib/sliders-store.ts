import fs from 'fs'
import path from 'path'

const STORE_FILE = path.join(process.cwd(), '.data', 'sliders.json')

export interface StoredSlider {
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

const defaultSliders: StoredSlider[] = [
  {
    id: 1,
    title: 'Premium E-Mobility aus Dornach',
    subtitle: 'MK-eMotors Dornach',
    description: 'Entdecken Sie E-Scooter, E-Motorräder und urbane Mobilität mit Beratung, Service und Finanzierung.',
    desktopImage: '/hero-background.png',
    mobileImage: '/hero-background.png',
    ctaText: 'Jetzt kaufen',
    ctaLink: '/produkte',
    animationType: 'zoom',
    textPosition: 'center',
    order: 1,
    active: true,
    overlayOpacity: 42,
    textColor: '#ffffff',
    backgroundColor: '#050b08',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

function ensureStore() {
  const dir = path.dirname(STORE_FILE)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  if (!fs.existsSync(STORE_FILE)) fs.writeFileSync(STORE_FILE, JSON.stringify(defaultSliders, null, 2))
}

function readStore() {
  ensureStore()
  try {
    const data = JSON.parse(fs.readFileSync(STORE_FILE, 'utf-8')) as StoredSlider[]
    return data.map(normalizeSlider)
  } catch {
    return defaultSliders
  }
}

function writeStore(items: StoredSlider[]) {
  ensureStore()
  fs.writeFileSync(STORE_FILE, JSON.stringify(items.map(normalizeSlider), null, 2))
}

export function getStoredSliders() {
  return readStore().sort((a, b) => (a.order || 0) - (b.order || 0))
}

export function upsertStoredSlider(input: Partial<StoredSlider>) {
  const items = getStoredSliders()
  const now = new Date().toISOString()
  const existing = input.id ? items.find((item) => item.id === Number(input.id)) : null
  const id = existing?.id || Math.max(0, ...items.map((item) => item.id)) + 1
  const slider = normalizeSlider({
    id,
    title: input.title || 'Neuer Premium Slide',
    subtitle: input.subtitle || '',
    description: input.description || '',
    desktopImage: input.desktopImage || '',
    mobileImage: input.mobileImage || input.desktopImage || '',
    ctaText: input.ctaText || 'Mehr erfahren',
    ctaLink: input.ctaLink || '/produkte',
    animationType: input.animationType || 'zoom',
    textPosition: input.textPosition || 'center',
    order: Number(input.order || items.length + 1),
    active: input.active !== false,
    overlayOpacity: Number(input.overlayOpacity ?? 42),
    textColor: input.textColor || '#ffffff',
    backgroundColor: input.backgroundColor || '#050b08',
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  })
  writeStore(existing ? items.map((item) => item.id === id ? slider : item) : [...items, slider])
  return slider
}

export function deleteStoredSlider(id: number) {
  const items = getStoredSliders()
  const existing = items.find((item) => item.id === id)
  if (!existing) return null
  writeStore(items.filter((item) => item.id !== id).map((item, index) => ({ ...item, order: index + 1 })))
  return existing
}

export function reorderStoredSliders(orderItems: Array<{ id: number; order: number }>) {
  const orderMap = new Map(orderItems.map((item) => [item.id, item.order]))
  const items = getStoredSliders().map((item) => ({
    ...item,
    order: orderMap.get(item.id) ?? item.order,
    updatedAt: new Date().toISOString(),
  }))
  writeStore(items)
  return getStoredSliders()
}

function normalizeSlider(slider: StoredSlider): StoredSlider {
  return {
    ...slider,
    id: Number(slider.id),
    title: String(slider.title || 'Slide'),
    order: Number(slider.order || 0),
    active: slider.active !== false,
    overlayOpacity: Math.max(0, Math.min(90, Number(slider.overlayOpacity ?? 42))),
  }
}
