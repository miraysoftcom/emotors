import fs from 'fs'
import path from 'path'

const FAQ_FILE = path.join(process.cwd(), '.data', 'faqs.json')
const CATEGORY_FILE = path.join(process.cwd(), '.data', 'faq-categories.json')

export interface FAQCategory {
  id: number
  name: string
  slug: string
  description: string
  order: number
  active: boolean
  seoTitle?: string
  seoDescription?: string
  createdAt: string
  updatedAt: string
}

export interface FAQItem {
  id: number
  slug: string
  category: string
  categorySlug: string
  question: string
  title: string
  answer: string
  keywords: string[]
  searchTerms: string[]
  seoTitle: string
  seoDescription: string
  canonicalUrl: string
  popular: boolean
  featured: boolean
  showOnHomepage: boolean
  showInFooter: boolean
  showOnCategoryPage: boolean
  showOnProductPage: boolean
  showOnBlog: boolean
  status: 'active' | 'inactive'
  order: number
  createdAt: string
  updatedAt: string
}

export interface FAQListOptions {
  query?: string
  category?: string
  status?: string
  page?: number
  limit?: number
  featured?: boolean
  homepage?: boolean
  popular?: boolean
  footer?: boolean
  product?: boolean
  blog?: boolean
}

function ensureDataDir() {
  const dir = path.dirname(FAQ_FILE)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

function readJson<T>(file: string, fallback: T): T {
  ensureDataDir()
  if (!fs.existsSync(file)) return fallback
  try {
    return JSON.parse(fs.readFileSync(file, 'utf-8')) as T
  } catch {
    return fallback
  }
}

function writeJson<T>(file: string, data: T) {
  ensureDataDir()
  fs.writeFileSync(file, JSON.stringify(data, null, 2))
}

export function getFAQCategories() {
  return readJson<FAQCategory[]>(CATEGORY_FILE, [])
    .sort((a, b) => a.order - b.order)
}

export function saveFAQCategories(categories: FAQCategory[]) {
  writeJson(CATEGORY_FILE, categories)
}

export function getAllFAQs() {
  return readJson<FAQItem[]>(FAQ_FILE, [])
    .sort((a, b) => a.order - b.order || a.id - b.id)
}

export function saveFAQs(faqs: FAQItem[]) {
  writeJson(FAQ_FILE, faqs)
}

export function listFAQs(options: FAQListOptions = {}) {
  const page = Math.max(1, options.page || 1)
  const limit = Math.min(500, Math.max(1, options.limit || 30))
  const query = (options.query || '').trim().toLowerCase()

  let faqs = getAllFAQs()

  if (options.status && options.status !== 'all') {
    faqs = faqs.filter((faq) => faq.status === options.status)
  }

  if (options.category && options.category !== 'all') {
    faqs = faqs.filter((faq) => (
      faq.categorySlug === options.category || faq.category === options.category
    ))
  }

  if (options.featured) faqs = faqs.filter((faq) => faq.featured)
  if (options.homepage) faqs = faqs.filter((faq) => faq.showOnHomepage)
  if (options.popular) faqs = faqs.filter((faq) => faq.popular)
  if (options.footer) faqs = faqs.filter((faq) => faq.showInFooter)
  if (options.product) faqs = faqs.filter((faq) => faq.showOnProductPage)
  if (options.blog) faqs = faqs.filter((faq) => faq.showOnBlog)

  if (query) {
    faqs = faqs.filter((faq) => {
      const haystack = [
        faq.question,
        faq.answer,
        faq.category,
        faq.slug,
        ...faq.keywords,
        ...faq.searchTerms,
      ].join(' ').toLowerCase()
      return haystack.includes(query)
    })
  }

  const total = faqs.length
  const offset = (page - 1) * limit

  return {
    faqs: faqs.slice(offset, offset + limit),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  }
}

export function getFAQById(id: number) {
  return getAllFAQs().find((faq) => faq.id === id) || null
}

export function getFAQBySlug(slug: string) {
  return getAllFAQs().find((faq) => faq.slug === slug) || null
}

export function upsertFAQ(data: Partial<FAQItem>) {
  const faqs = getAllFAQs()
  const now = new Date().toISOString()

  if (data.id) {
    const existing = faqs.find((faq) => faq.id === data.id)
    if (!existing) return null
    const updated = { ...existing, ...data, updatedAt: now } as FAQItem
    saveFAQs(faqs.map((faq) => faq.id === data.id ? updated : faq))
    return updated
  }

  const nextId = Math.max(0, ...faqs.map((faq) => faq.id)) + 1
  const item = {
    id: nextId,
    slug: data.slug || `faq-${nextId}`,
    category: data.category || 'Allgemein',
    categorySlug: data.categorySlug || 'allgemein',
    question: data.question || '',
    title: data.title || data.question || '',
    answer: data.answer || '',
    keywords: data.keywords || [],
    searchTerms: data.searchTerms || [],
    seoTitle: data.seoTitle || data.question || '',
    seoDescription: data.seoDescription || '',
    canonicalUrl: data.canonicalUrl || `/faq#faq-${nextId}`,
    popular: data.popular || false,
    featured: data.featured || false,
    showOnHomepage: data.showOnHomepage || false,
    showInFooter: data.showInFooter || false,
    showOnCategoryPage: data.showOnCategoryPage !== false,
    showOnProductPage: data.showOnProductPage || false,
    showOnBlog: data.showOnBlog || false,
    status: data.status || 'active',
    order: data.order || nextId,
    createdAt: now,
    updatedAt: now,
  } satisfies FAQItem

  saveFAQs([...faqs, item])
  return item
}

export function deleteFAQ(id: number) {
  const faqs = getAllFAQs()
  const next = faqs.filter((faq) => faq.id !== id)
  if (next.length === faqs.length) return false
  saveFAQs(next)
  return true
}

export function upsertFAQCategory(data: Partial<FAQCategory>) {
  const categories = getFAQCategories()
  const now = new Date().toISOString()

  if (data.id) {
    const existing = categories.find((category) => category.id === data.id)
    if (!existing) return null
    const updated = {
      ...existing,
      ...data,
      slug: data.slug || existing.slug,
      updatedAt: now,
    } as FAQCategory
    saveFAQCategories(categories.map((category) => category.id === data.id ? updated : category))
    return updated
  }

  const nextId = Math.max(0, ...categories.map((category) => category.id)) + 1
  const name = data.name || 'Neue Kategorie'
  const category = {
    id: nextId,
    name,
    slug: data.slug || slugifyFAQ(name),
    description: data.description || '',
    order: data.order || nextId,
    active: data.active !== false,
    seoTitle: data.seoTitle || name,
    seoDescription: data.seoDescription || '',
    createdAt: now,
    updatedAt: now,
  } satisfies FAQCategory

  saveFAQCategories([...categories, category])
  return category
}

export function deleteFAQCategory(id: number) {
  const categories = getFAQCategories()
  const category = categories.find((item) => item.id === id)
  if (!category) return false

  saveFAQCategories(categories.filter((item) => item.id !== id))
  saveFAQs(getAllFAQs().map((faq) => (
    faq.categorySlug === category.slug
      ? { ...faq, category: 'Allgemein', categorySlug: 'allgemein', updatedAt: new Date().toISOString() }
      : faq
  )))
  return true
}

export function slugifyFAQ(value: string) {
  return value
    .toLowerCase()
    .replace(/[ä]/g, 'ae')
    .replace(/[ö]/g, 'oe')
    .replace(/[ü]/g, 'ue')
    .replace(/[ß]/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}
