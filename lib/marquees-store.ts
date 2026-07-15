import fs from 'fs'
import path from 'path'

const STORE_FILE = path.join(process.cwd(), '.data', 'marquees.json')

export interface MarqueeBanner {
  id: number
  title: string
  text: string
  imageUrl: string
  icon: string
  linkUrl: string
  buttonText: string
  buttonUrl: string
  placement: string
  pages: string
  fontFamily: string
  fontSize: number
  fontWeight: number
  textColor: string
  backgroundColor: string
  borderColor: string
  borderWidth: number
  animationDirection: 'left' | 'right'
  animationSpeed: number
  pauseOnHover: boolean
  active: boolean
  showDesktop: boolean
  showTablet: boolean
  showMobile: boolean
  startsAt: string
  endsAt: string
  sortOrder: number
  views: number
  clicks: number
  createdAt: string
  updatedAt: string
}

const defaultMarquees: MarqueeBanner[] = [
  {
    id: 1,
    title: 'Header Angebot',
    text: 'Kostenlose Beratung für E-Scooter, E-Bikes und E-Motorräder in der Schweiz',
    imageUrl: '',
    icon: 'Zap',
    linkUrl: '/kontakt',
    buttonText: 'Beratung anfragen',
    buttonUrl: '/kontakt',
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
    views: 0,
    clicks: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

function ensureStore() {
  const dir = path.dirname(STORE_FILE)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  if (!fs.existsSync(STORE_FILE)) fs.writeFileSync(STORE_FILE, JSON.stringify(defaultMarquees, null, 2))
}

export function getMarquees() {
  ensureStore()
  try {
    return JSON.parse(fs.readFileSync(STORE_FILE, 'utf-8')) as MarqueeBanner[]
  } catch {
    return defaultMarquees
  }
}

export function getActiveMarqueesForPlacement(placement: string, pagePath = '/') {
  const now = Date.now()
  return getMarquees()
    .filter((item) => item.active)
    .filter((item) => item.placement === placement)
    .filter((item) => {
      const startsAt = item.startsAt ? new Date(item.startsAt).getTime() : 0
      const endsAt = item.endsAt ? new Date(item.endsAt).getTime() : Number.POSITIVE_INFINITY
      return now >= startsAt && now <= endsAt
    })
    .filter((item) => {
      const pages = String(item.pages || '*')
        .split(',')
        .map((page) => page.trim())
        .filter(Boolean)
      return pages.length === 0 || pages.includes('*') || pages.includes(pagePath)
    })
    .sort((a, b) => a.sortOrder - b.sortOrder)
}

function saveMarquees(items: MarqueeBanner[]) {
  ensureStore()
  fs.writeFileSync(STORE_FILE, JSON.stringify(items, null, 2))
}

export function upsertMarquee(data: Partial<MarqueeBanner>) {
  const items = getMarquees()
  const now = new Date().toISOString()
  if (data.id) {
    const existing = items.find((item) => item.id === data.id)
    if (!existing) return null
    const updated = { ...existing, ...data, updatedAt: now } as MarqueeBanner
    saveMarquees(items.map((item) => item.id === data.id ? updated : item))
    return updated
  }

  const item: MarqueeBanner = {
    ...defaultMarquees[0],
    ...data,
    id: Math.max(0, ...items.map((entry) => entry.id)) + 1,
    title: data.title || 'Neuer Marquee',
    text: data.text || '',
    createdAt: now,
    updatedAt: now,
    views: 0,
    clicks: 0,
  }
  saveMarquees([...items, item])
  return item
}

export function deleteMarquee(id: number) {
  const items = getMarquees()
  const next = items.filter((item) => item.id !== id)
  if (next.length === items.length) return false
  saveMarquees(next)
  return true
}
