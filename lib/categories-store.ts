import fs from 'fs'
import path from 'path'

const STORE_FILE = path.join(process.cwd(), '.data', 'categories.json')

export interface Category {
  id: number
  name: string
  slug: string
  description?: string | null
  long_description?: string | null
  type: string
  parent_id?: number | null
  license_required: boolean
  icon?: string | null
  image?: string | null
  banner?: string | null
  color: string
  featured: boolean
  active: boolean
  seo_title?: string | null
  seo_description?: string | null
  sort_priority: number
  order: number
  metadata?: any
  createdAt: Date
  updatedAt: Date
}

let categories: Map<number, Category> = new Map()
let nextId = 1
let storeInitialized = false

const defaultShopCategories: Array<Omit<Category, 'id' | 'createdAt' | 'updatedAt'>> = [
  {
    name: 'Ohne Führerschein',
    slug: 'ohne-fuehrerschein',
    description: 'Elektromobilität, die je nach Modell ohne Führerschein genutzt werden kann.',
    long_description: 'Alle passenden Fahrzeuge und Modelle für einfache, flexible Mobilität im Alltag.',
    type: 'main',
    parent_id: null,
    license_required: false,
    icon: 'OF',
    image: '',
    banner: '',
    color: '#16a34a',
    featured: true,
    active: true,
    seo_title: 'Elektromobilität ohne Führerschein',
    seo_description: 'Fahrzeuge und Scooter ohne Führerschein entdecken.',
    sort_priority: 10,
    order: 1,
    metadata: { shopFilter: 'license', license: 'ohne' },
  },
  {
    name: 'Mit Führerschein',
    slug: 'mit-fuehrerschein',
    description: 'Leistungsstärkere E-Mopeds und E-Motorräder für Kundinnen und Kunden mit Führerschein.',
    long_description: 'Mehr Leistung, höhere Geschwindigkeit und grössere Reichweite für anspruchsvolle Mobilität.',
    type: 'main',
    parent_id: null,
    license_required: true,
    icon: 'MF',
    image: '',
    banner: '',
    color: '#2563eb',
    featured: true,
    active: true,
    seo_title: 'Elektromobilität mit Führerschein',
    seo_description: 'E-Mopeds und E-Motorräder mit Führerschein entdecken.',
    sort_priority: 20,
    order: 2,
    metadata: { shopFilter: 'license', license: 'mit' },
  },
  {
    name: 'eScooter',
    slug: 'escooter',
    description: 'Kompakte E-Scooter für Stadt, Pendeln und kurze Wege.',
    long_description: 'Wendige Modelle mit moderner Akkutechnik für tägliche Wege und urbane Mobilität.',
    type: 'main',
    parent_id: null,
    license_required: false,
    icon: 'ES',
    image: '',
    banner: '',
    color: '#0f766e',
    featured: true,
    active: true,
    seo_title: 'eScooter kaufen',
    seo_description: 'eScooter und passende Modelle im Shop entdecken.',
    sort_priority: 30,
    order: 3,
    metadata: { shopFilter: 'category' },
  },
  {
    name: 'Ersatzteile',
    slug: 'ersatzteile',
    description: 'Ersatzteile für Service, Reparatur und Pflege.',
    long_description: 'Passende Teile für Fahrzeuge, Scooter und Zubehör direkt über den Shop verwalten.',
    type: 'main',
    parent_id: null,
    license_required: false,
    icon: 'ET',
    image: '',
    banner: '',
    color: '#7c3aed',
    featured: true,
    active: true,
    seo_title: 'Ersatzteile',
    seo_description: 'Ersatzteile für Elektromobilität bestellen.',
    sort_priority: 40,
    order: 4,
    metadata: { shopFilter: 'category' },
  },
  {
    name: 'Zubehör',
    slug: 'zubehoer',
    description: 'Zubehör für Komfort, Sicherheit und Alltag.',
    long_description: 'Helme, Taschen, Ladezubehör und weitere Ergänzungen für Ihre Elektromobilität.',
    type: 'main',
    parent_id: null,
    license_required: false,
    icon: 'ZU',
    image: '',
    banner: '',
    color: '#ea580c',
    featured: true,
    active: true,
    seo_title: 'Zubehör',
    seo_description: 'Zubehör für E-Scooter, E-Mopeds und E-Motorräder.',
    sort_priority: 50,
    order: 5,
    metadata: { shopFilter: 'category' },
  },
]

// Initialize store - always reload from disk
function initStore() {
  try {
    const dir = path.dirname(STORE_FILE)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    
    categories.clear()
    nextId = 1
    
    if (fs.existsSync(STORE_FILE)) {
      const data = fs.readFileSync(STORE_FILE, 'utf-8')
      const parsed = JSON.parse(data)
      for (const cat of parsed) {
        categories.set(cat.id, {
          ...cat,
          createdAt: new Date(cat.createdAt),
          updatedAt: new Date(cat.updatedAt),
        })
        if (cat.id >= nextId) {
          nextId = cat.id + 1
        }
      }
    }

    ensureDefaultShopCategories()
    
    storeInitialized = true
  } catch (error) {
    console.error('[Store Init Error]', error)
    categories.clear()
    storeInitialized = true
  }
}

function ensureDefaultShopCategories() {
  let changed = false

  defaultShopCategories.forEach((defaultCategory) => {
    const existing = Array.from(categories.values()).find((category) => category.slug === defaultCategory.slug)
    if (!existing) {
      const now = new Date()
      const category: Category = {
        ...defaultCategory,
        id: nextId++,
        createdAt: now,
        updatedAt: now,
      }
      categories.set(category.id, category)
      changed = true
      return
    }

    const shouldHydrate = !existing.description || !existing.icon || !existing.color || !existing.metadata
    if (shouldHydrate) {
      categories.set(existing.id, {
        ...defaultCategory,
        ...existing,
        description: existing.description || defaultCategory.description,
        long_description: existing.long_description || defaultCategory.long_description,
        icon: existing.icon || defaultCategory.icon,
        color: existing.color || defaultCategory.color,
        featured: existing.featured || defaultCategory.featured,
        active: existing.active !== false,
        sort_priority: existing.sort_priority || defaultCategory.sort_priority,
        order: existing.order || defaultCategory.order,
        metadata: existing.metadata || defaultCategory.metadata,
        updatedAt: new Date(),
      })
      changed = true
    }
  })

  if (changed) saveStore()
}

// Persist store
function saveStore() {
  try {
    const data = Array.from(categories.values())
    const dir = path.dirname(STORE_FILE)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error('[Store Save Error]', error)
  }
}

// Get all categories
export function getCategories(): Category[] {
  initStore()
  return Array.from(categories.values()).sort((a, b) => a.order - b.order)
}

// Get single category
export function getCategory(id: number): Category | undefined {
  initStore()
  return categories.get(id)
}

// Create category
export function createCategory(data: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Category {
  initStore()
  
  const id = nextId++
  const category: Category = {
    ...data,
    id,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
  
  categories.set(id, category)
  saveStore()
  return category
}

// Update category
export function updateCategory(id: number, data: Partial<Omit<Category, 'id' | 'createdAt'>>): Category | null {
  initStore()
  
  const existing = categories.get(id)
  if (!existing) return null
  
  const updated: Category = {
    ...existing,
    ...data,
    id,
    createdAt: existing.createdAt,
    updatedAt: new Date(),
  }
  
  categories.set(id, updated)
  saveStore()
  return updated
}

// Delete category
export function deleteCategory(id: number): boolean {
  initStore()
  
  if (!categories.has(id)) return false
  
  categories.delete(id)
  saveStore()
  return true
}
