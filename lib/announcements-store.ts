import fs from 'fs'
import path from 'path'
import { randomUUID } from 'crypto'

const STORE_FILE = path.join(process.cwd(), '.data', 'announcements.json')

export type AnnouncementType = 'info' | 'success' | 'warning' | 'error' | 'promotion' | 'maintenance'
export type AnnouncementPriority = 'low' | 'normal' | 'high' | 'urgent'
export type AnnouncementStatus = 'draft' | 'published' | 'archived'
export type AnnouncementAudience = 'all' | 'customers' | 'guests' | 'selected_customers'

export interface AnnouncementRecord {
  id: string
  title: string
  excerpt: string
  content: string
  type: AnnouncementType
  priority: AnnouncementPriority
  status: AnnouncementStatus
  active: boolean
  audience: AnnouncementAudience
  selectedEmails: string[]
  placements: string[]
  startsAt?: string
  endsAt?: string
  imageUrl?: string
  icon?: string
  accentColor?: string
  buttonText?: string
  buttonUrl?: string
  buttonTarget?: '_self' | '_blank'
  dismissible: boolean
  sortOrder: number
  views: number
  readBy: string[]
  dismissedBy: string[]
  createdAt: string
  updatedAt: string
  publishedAt?: string
}

export const announcementPlacements = [
  'homepage_top',
  'homepage_banner',
  'homepage_marquee',
  'customer_dashboard',
  'customer_messages',
  'checkout',
  'popup',
] as const

function ensureStore() {
  const dir = path.dirname(STORE_FILE)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  if (!fs.existsSync(STORE_FILE)) {
    fs.writeFileSync(STORE_FILE, JSON.stringify([
      {
        id: randomUUID(),
        title: 'Willkommen im Kundenportal',
        excerpt: 'Ihre Bestellungen, Rechnungen, Adressen und Mitteilungen sind jetzt zentral verfügbar.',
        content: 'Verwalten Sie Ihr MK-eMotors Dornach Kundenkonto komfortabel an einem Ort.',
        type: 'info',
        priority: 'normal',
        status: 'published',
        active: true,
        audience: 'customers',
        selectedEmails: [],
        placements: ['customer_dashboard'],
        accentColor: '#22c55e',
        buttonText: 'Produkte ansehen',
        buttonUrl: '/produkte',
        buttonTarget: '_self',
        dismissible: true,
        sortOrder: 1,
        views: 0,
        readBy: [],
        dismissedBy: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        publishedAt: new Date().toISOString(),
      },
    ], null, 2))
  }
}

function readStore() {
  ensureStore()
  try {
    return JSON.parse(fs.readFileSync(STORE_FILE, 'utf-8')) as AnnouncementRecord[]
  } catch {
    return []
  }
}

function writeStore(records: AnnouncementRecord[]) {
  ensureStore()
  fs.writeFileSync(STORE_FILE, JSON.stringify(records, null, 2))
}

function normalizeEmails(value: unknown) {
  if (!Array.isArray(value)) return []
  return value.map((item) => String(item).trim().toLowerCase()).filter(Boolean)
}

function normalizePlacements(value: unknown) {
  if (!Array.isArray(value)) return ['customer_dashboard']
  return value.map((item) => String(item).trim()).filter(Boolean)
}

export function getAnnouncements() {
  return readStore().sort((a, b) => a.sortOrder - b.sortOrder || b.updatedAt.localeCompare(a.updatedAt))
}

export function upsertAnnouncement(input: Partial<AnnouncementRecord>) {
  const records = readStore()
  const now = new Date().toISOString()
  const existing = input.id ? records.find((item) => item.id === input.id) : null
  const status = input.status === 'draft' || input.status === 'archived' ? input.status : 'published'
  const record: AnnouncementRecord = {
    id: existing?.id || randomUUID(),
    title: String(input.title || existing?.title || '').trim(),
    excerpt: String(input.excerpt || existing?.excerpt || '').trim(),
    content: String(input.content || existing?.content || '').trim(),
    type: input.type || existing?.type || 'info',
    priority: input.priority || existing?.priority || 'normal',
    status,
    active: typeof input.active === 'boolean' ? input.active : existing?.active ?? true,
    audience: input.audience || existing?.audience || 'customers',
    selectedEmails: normalizeEmails(input.selectedEmails ?? existing?.selectedEmails),
    placements: normalizePlacements(input.placements ?? existing?.placements),
    startsAt: input.startsAt || existing?.startsAt || '',
    endsAt: input.endsAt || existing?.endsAt || '',
    imageUrl: input.imageUrl || existing?.imageUrl || '',
    icon: input.icon || existing?.icon || 'Bell',
    accentColor: input.accentColor || existing?.accentColor || '#22c55e',
    buttonText: input.buttonText || existing?.buttonText || '',
    buttonUrl: input.buttonUrl || existing?.buttonUrl || '',
    buttonTarget: input.buttonTarget || existing?.buttonTarget || '_self',
    dismissible: typeof input.dismissible === 'boolean' ? input.dismissible : existing?.dismissible ?? true,
    sortOrder: Number(input.sortOrder ?? existing?.sortOrder ?? 100),
    views: existing?.views || 0,
    readBy: existing?.readBy || [],
    dismissedBy: existing?.dismissedBy || [],
    createdAt: existing?.createdAt || now,
    updatedAt: now,
    publishedAt: status === 'published' ? (existing?.publishedAt || now) : existing?.publishedAt,
  }

  if (!record.title) throw new Error('Titel ist erforderlich.')
  if (!record.content && !record.excerpt) throw new Error('Inhalt oder Kurztext ist erforderlich.')

  const next = existing
    ? records.map((item) => item.id === record.id ? record : item)
    : [record, ...records]
  writeStore(next)
  return record
}

export function deleteAnnouncement(id: string) {
  const records = readStore()
  writeStore(records.filter((item) => item.id !== id))
}

export function getPublicAnnouncements(options: {
  placement?: string
  email?: string
  authenticated?: boolean
  includeDismissed?: boolean
}) {
  const now = Date.now()
  const email = String(options.email || '').trim().toLowerCase()
  return getAnnouncements().filter((item) => {
    if (!item.active || item.status !== 'published') return false
    if (options.placement && !item.placements.includes(options.placement)) return false
    if (item.startsAt && new Date(item.startsAt).getTime() > now) return false
    if (item.endsAt && new Date(item.endsAt).getTime() < now) return false
    if (!options.includeDismissed && email && item.dismissedBy.includes(email)) return false
    if (item.audience === 'customers' && !options.authenticated && !email) return false
    if (item.audience === 'guests' && options.authenticated) return false
    if (item.audience === 'selected_customers' && !item.selectedEmails.includes(email)) return false
    return true
  })
}

export function markAnnouncementState(id: string, email: string, action: 'read' | 'dismiss') {
  const normalizedEmail = email.trim().toLowerCase()
  const records = readStore()
  const next = records.map((item) => {
    if (item.id !== id) return item
    return {
      ...item,
      readBy: item.readBy.includes(normalizedEmail) ? item.readBy : [...item.readBy, normalizedEmail],
      dismissedBy: action === 'dismiss' && !item.dismissedBy.includes(normalizedEmail)
        ? [...item.dismissedBy, normalizedEmail]
        : item.dismissedBy,
      updatedAt: new Date().toISOString(),
    }
  })
  writeStore(next)
}
