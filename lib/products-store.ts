import fs from 'fs'
import path from 'path'

const STORE_FILE = path.join(process.cwd(), '.data', 'products.json')

export interface StoredProduct {
  id: number
  title: string
  slug: string
  price: number
  discount_price?: number | null
  discount_percentage?: number | null
  monthly_price?: number | null
  sales_start?: string | Date | null
  sales_end?: string | Date | null
  short_description?: string | null
  description?: string | null
  long_description?: string | null
  category_id?: number | null
  subcategory_id?: number | null
  brand?: string | null
  sku?: string | null
  ean?: string | null
  image?: string | null
  images?: string[]
  power_watts?: number | null
  battery_capacity?: string | null
  range_km?: number | null
  max_speed?: number | null
  weight_kg?: number | null
  charge_time?: string | null
  max_load?: string | null
  warranty?: string | null
  delivery_time?: string | null
  color?: string[]
  availability?: string
  stock_quantity?: number
  financing_available?: boolean
  license_required?: string | null
  license_type?: string | null
  condition?: string
  seo_title?: string | null
  seo_description?: string | null
  featured?: boolean
  bestseller?: boolean
  new_product?: boolean
  recommended?: boolean
  active?: boolean
  archived?: boolean
  specs?: Record<string, unknown>
  metadata?: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
}

let products: Map<number, StoredProduct> = new Map()
let nextId = 1

function initStore() {
  const dir = path.dirname(STORE_FILE)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }

  products.clear()
  nextId = 1

  if (!fs.existsSync(STORE_FILE)) return

  const parsed = JSON.parse(fs.readFileSync(STORE_FILE, 'utf-8')) as StoredProduct[]
  for (const product of parsed) {
    products.set(product.id, {
      ...product,
      createdAt: new Date(product.createdAt),
      updatedAt: new Date(product.updatedAt),
    })
    if (product.id >= nextId) nextId = product.id + 1
  }
}

function saveStore() {
  const dir = path.dirname(STORE_FILE)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }

  fs.writeFileSync(
    STORE_FILE,
    JSON.stringify(Array.from(products.values()), null, 2)
  )
}

export function getStoredProducts() {
  initStore()
  return Array.from(products.values()).sort((a, b) => (
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ))
}

export function getStoredProduct(id: number) {
  initStore()
  return products.get(id) || null
}

export function createStoredProduct(data: Omit<StoredProduct, 'id' | 'createdAt' | 'updatedAt'>) {
  initStore()
  const now = new Date()
  const product: StoredProduct = {
    ...data,
    id: nextId++,
    createdAt: now,
    updatedAt: now,
  }

  products.set(product.id, product)
  saveStore()
  return product
}

export function updateStoredProduct(id: number, data: Partial<Omit<StoredProduct, 'id' | 'createdAt'>>) {
  initStore()
  const existing = products.get(id)
  if (!existing) return null

  const product: StoredProduct = {
    ...existing,
    ...data,
    id,
    createdAt: existing.createdAt,
    updatedAt: new Date(),
  }

  products.set(id, product)
  saveStore()
  return product
}

export function deleteStoredProduct(id: number, permanent = false) {
  initStore()
  if (!products.has(id)) return false

  if (permanent) {
    products.delete(id)
  } else {
    const existing = products.get(id)!
    products.set(id, {
      ...existing,
      active: false,
      archived: true,
      updatedAt: new Date(),
    })
  }

  saveStore()
  return true
}

export function findStoredProductByUniqueField(field: 'slug' | 'sku' | 'ean', value: string, exceptId?: number) {
  initStore()
  const normalized = value.trim().toLowerCase()
  if (!normalized) return null

  return Array.from(products.values()).find((product) => {
    if (exceptId && product.id === exceptId) return false
    const current = String(product[field] || '').trim().toLowerCase()
    return current === normalized
  }) || null
}
