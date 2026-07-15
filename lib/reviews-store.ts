import fs from 'fs'
import path from 'path'

const STORE_FILE = path.join(process.cwd(), '.data', 'reviews.json')

export interface StoredReview {
  id: number
  productId: number
  customerName: string
  rating: number
  title: string
  comment: string
  image?: string | null
  approved: boolean
  status: 'pending' | 'approved' | 'rejected' | 'spam' | 'archived'
  verifiedPurchase: boolean
  adminReply?: string | null
  createdAt: string
  updatedAt: string
}

function ensureStore() {
  const dir = path.dirname(STORE_FILE)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  if (!fs.existsSync(STORE_FILE)) fs.writeFileSync(STORE_FILE, '[]')
}

export function getStoredReviews() {
  ensureStore()
  try {
    return JSON.parse(fs.readFileSync(STORE_FILE, 'utf-8')) as StoredReview[]
  } catch {
    return []
  }
}

function saveReviews(reviews: StoredReview[]) {
  ensureStore()
  fs.writeFileSync(STORE_FILE, JSON.stringify(reviews, null, 2))
}

export function listProductReviews(productId: number, approvedOnly = true) {
  return getStoredReviews()
    .filter((review) => review.productId === productId)
    .filter((review) => !approvedOnly || review.approved || review.status === 'approved')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export function createStoredReview(data: Omit<StoredReview, 'id' | 'createdAt' | 'updatedAt' | 'approved' | 'status'>) {
  const reviews = getStoredReviews()
  const now = new Date().toISOString()
  const review: StoredReview = {
    ...data,
    id: Math.max(0, ...reviews.map((item) => item.id)) + 1,
    rating: Math.min(5, Math.max(1, Number(data.rating || 1))),
    approved: false,
    status: 'pending',
    createdAt: now,
    updatedAt: now,
  }
  saveReviews([...reviews, review])
  return review
}

export function updateStoredReview(id: number, data: Partial<StoredReview>) {
  const reviews = getStoredReviews()
  const existing = reviews.find((review) => review.id === id)
  if (!existing) return null
  const status = data.status || (data.approved ? 'approved' : existing.status)
  const updated = {
    ...existing,
    ...data,
    approved: data.approved ?? status === 'approved',
    status,
    updatedAt: new Date().toISOString(),
  } satisfies StoredReview
  saveReviews(reviews.map((review) => review.id === id ? updated : review))
  return updated
}

export function deleteStoredReview(id: number) {
  const reviews = getStoredReviews()
  const next = reviews.filter((review) => review.id !== id)
  if (next.length === reviews.length) return false
  saveReviews(next)
  return true
}

export function getReviewSummary(productId: number) {
  const approvedReviews = listProductReviews(productId, true)
  const total = approvedReviews.length
  const average = total
    ? approvedReviews.reduce((sum, review) => sum + review.rating, 0) / total
    : 0
  const distribution = [5, 4, 3, 2, 1].reduce<Record<number, number>>((acc, rating) => {
    acc[rating] = approvedReviews.filter((review) => review.rating === rating).length
    return acc
  }, {})

  return { total, average, distribution, reviews: approvedReviews }
}
