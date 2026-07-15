import fs from 'fs'
import path from 'path'
import { getCustomerRequests } from '@/lib/customer-request-store'
import { LOYALTY_POINTS_PER_CHF } from '@/lib/loyalty-points'

const STORE_FILE = path.join(process.cwd(), '.data', 'coupons.json')

export type DiscountType = 'percentage' | 'fixed' | 'free_shipping'
export type CouponKind = 'coupon' | 'voucher' | 'loyalty'

export interface CouponRecord {
  id: string
  code: string
  title: string
  kind: CouponKind
  discountType: DiscountType
  value: number
  balance: number
  minPurchase: number
  maxDiscount: number
  maxUses: number
  usedCount: number
  customerEmail: string
  validFrom: string
  validUntil: string
  active: boolean
  notes: string
  createdAt: string
  updatedAt: string
}

function ensureStore() {
  const dir = path.dirname(STORE_FILE)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  if (!fs.existsSync(STORE_FILE)) fs.writeFileSync(STORE_FILE, '[]')
}

function readCoupons() {
  ensureStore()
  try {
    return JSON.parse(fs.readFileSync(STORE_FILE, 'utf-8')) as CouponRecord[]
  } catch {
    return []
  }
}

function writeCoupons(coupons: CouponRecord[]) {
  ensureStore()
  fs.writeFileSync(STORE_FILE, JSON.stringify(coupons, null, 2))
}

export function getCoupons() {
  return readCoupons().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export function getCoupon(id: string) {
  return readCoupons().find((coupon) => coupon.id === id) || null
}

export function getCouponRequests() {
  return getCustomerRequests().filter((request) => request.type === 'coupon')
}

export function upsertCoupon(input: Partial<CouponRecord>) {
  const coupons = readCoupons()
  const now = new Date().toISOString()
  const code = String(input.code || '').trim().toUpperCase()
  if (!code) throw new Error('Coupon Code ist erforderlich.')
  const duplicate = coupons.find((coupon) => coupon.code === code && coupon.id !== input.id)
  if (duplicate) throw new Error('Dieser Coupon Code existiert bereits.')

  const existing = coupons.find((coupon) => coupon.id === input.id)
  const kind = input.kind || existing?.kind || 'coupon'
  const value = Number(input.value ?? existing?.value ?? 0)
  const balance = Number(input.balance ?? existing?.balance ?? input.value ?? 0)
  const coupon: CouponRecord = {
    id: existing?.id || `cp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    code,
    title: String(input.title || existing?.title || code).trim(),
    kind,
    discountType: kind === 'loyalty' ? 'fixed' : input.discountType || existing?.discountType || 'fixed',
    value: kind === 'loyalty' ? Math.max(0, Math.floor(value)) : value,
    balance: kind === 'loyalty' ? Math.max(0, Math.floor(balance)) : balance,
    minPurchase: Number(input.minPurchase ?? existing?.minPurchase ?? 0),
    maxDiscount: Number(input.maxDiscount ?? existing?.maxDiscount ?? 0),
    maxUses: Number(input.maxUses ?? existing?.maxUses ?? 0),
    usedCount: Number(input.usedCount ?? existing?.usedCount ?? 0),
    customerEmail: String(input.customerEmail || existing?.customerEmail || '').trim().toLowerCase(),
    validFrom: String(input.validFrom || existing?.validFrom || ''),
    validUntil: String(input.validUntil || existing?.validUntil || ''),
    active: Boolean(input.active ?? existing?.active ?? true),
    notes: String(input.notes || existing?.notes || ''),
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  }
  if (kind === 'loyalty' && !coupon.notes.includes('100 Punkte = CHF 1')) {
    coupon.notes = `${coupon.notes ? `${coupon.notes}\n` : ''}${LOYALTY_POINTS_PER_CHF} Punkte = CHF 1`
  }

  writeCoupons(existing
    ? coupons.map((item) => item.id === coupon.id ? coupon : item)
    : [coupon, ...coupons])
  return coupon
}

export function deleteCoupon(id: string) {
  const coupons = readCoupons()
  writeCoupons(coupons.filter((coupon) => coupon.id !== id))
}

export function activateCoupon(id: string) {
  const coupon = getCoupon(id)
  if (!coupon) return null
  return upsertCoupon({ ...coupon, active: true })
}
