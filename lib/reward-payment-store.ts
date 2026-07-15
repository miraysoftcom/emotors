import fs from 'fs'
import path from 'path'

const STORE_FILE = path.join(process.cwd(), '.data', 'reward-payments.json')

export type RewardPaymentStatus = 'pending' | 'processing' | 'paid' | 'cancelled'

export interface RewardPaymentRecord {
  id: string
  requestId: string
  couponId: string
  couponCode: string
  customerEmail: string
  customerName: string
  title: string
  amount: number
  currency: 'CHF'
  status: RewardPaymentStatus
  selectedMethod: string
  note: string
  createdAt: string
  updatedAt: string
  paidAt?: string
}

function ensureStore() {
  const dir = path.dirname(STORE_FILE)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  if (!fs.existsSync(STORE_FILE)) fs.writeFileSync(STORE_FILE, '[]')
}

function readPayments() {
  ensureStore()
  try {
    return JSON.parse(fs.readFileSync(STORE_FILE, 'utf-8')) as RewardPaymentRecord[]
  } catch {
    return []
  }
}

function writePayments(payments: RewardPaymentRecord[]) {
  ensureStore()
  fs.writeFileSync(STORE_FILE, JSON.stringify(payments, null, 2))
}

export function getRewardPayments(email?: string) {
  const payments = readPayments().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  if (!email) return payments
  const normalized = email.trim().toLowerCase()
  return payments.filter((payment) => payment.customerEmail.toLowerCase() === normalized)
}

export function createRewardPayment(input: Omit<RewardPaymentRecord, 'id' | 'status' | 'selectedMethod' | 'createdAt' | 'updatedAt'>) {
  const existing = readPayments().find((payment) => payment.requestId === input.requestId && payment.status !== 'cancelled')
  if (existing) return existing

  const now = new Date().toISOString()
  const payment: RewardPaymentRecord = {
    ...input,
    id: `rp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    status: 'pending',
    selectedMethod: '',
    createdAt: now,
    updatedAt: now,
  }

  writePayments([payment, ...readPayments()])
  return payment
}

export function updateRewardPayment(id: string, data: Partial<RewardPaymentRecord>) {
  const payments = readPayments()
  const existing = payments.find((payment) => payment.id === id)
  if (!existing) return null

  const updated: RewardPaymentRecord = {
    ...existing,
    ...data,
    updatedAt: new Date().toISOString(),
  }
  writePayments(payments.map((payment) => payment.id === id ? updated : payment))
  return updated
}
