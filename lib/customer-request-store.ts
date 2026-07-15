import fs from 'fs'
import path from 'path'

const STORE_FILE = path.join(process.cwd(), '.data', 'customer-requests.json')

export type CustomerRequestType =
  | 'warranty'
  | 'service'
  | 'return'
  | 'trade_in'
  | 'estimate'
  | 'coupon'
  | 'newsletter'
  | 'review'

export interface CustomerRequestRecord {
  id: string
  type: CustomerRequestType
  email: string
  name?: string
  phone?: string
  subject: string
  message?: string
  status: 'new' | 'in_review' | 'done'
  payload: Record<string, unknown>
  replies?: Array<{
    id: string
    message: string
    sentBy: string
    sentAt: string
  }>
  createdAt: string
  updatedAt: string
}

function ensureStoreDir() {
  const dir = path.dirname(STORE_FILE)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

function readRequests(): CustomerRequestRecord[] {
  ensureStoreDir()
  if (!fs.existsSync(STORE_FILE)) return []
  try {
    return JSON.parse(fs.readFileSync(STORE_FILE, 'utf-8')) as CustomerRequestRecord[]
  } catch {
    return []
  }
}

function writeRequests(requests: CustomerRequestRecord[]) {
  ensureStoreDir()
  fs.writeFileSync(STORE_FILE, JSON.stringify(requests, null, 2))
}

export function getCustomerRequests(email?: string) {
  const requests = readRequests().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  if (!email) return requests
  const normalized = email.trim().toLowerCase()
  return requests.filter((request) => request.email.toLowerCase() === normalized)
}

export function createCustomerRequest(data: Omit<CustomerRequestRecord, 'id' | 'status' | 'createdAt' | 'updatedAt'>) {
  const now = new Date().toISOString()
  const request: CustomerRequestRecord = {
    ...data,
    id: `cr_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    status: 'new',
    createdAt: now,
    updatedAt: now,
  }
  const requests = readRequests()
  requests.unshift(request)
  writeRequests(requests)
  return request
}

export function updateCustomerRequest(id: string, data: Partial<CustomerRequestRecord>) {
  const requests = readRequests()
  const existing = requests.find((request) => request.id === id)
  if (!existing) return null
  const updated: CustomerRequestRecord = {
    ...existing,
    ...data,
    payload: data.payload || existing.payload || {},
    replies: data.replies || existing.replies || [],
    updatedAt: new Date().toISOString(),
  }
  writeRequests(requests.map((request) => request.id === id ? updated : request))
  return updated
}

export function addCustomerRequestReply(id: string, message: string, sentBy = 'Admin') {
  const requests = readRequests()
  const existing = requests.find((request) => request.id === id)
  if (!existing) return null
  const reply = {
    id: `reply_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    message: message.trim(),
    sentBy,
    sentAt: new Date().toISOString(),
  }
  const updated: CustomerRequestRecord = {
    ...existing,
    status: 'in_review',
    replies: [reply, ...(existing.replies || [])],
    updatedAt: new Date().toISOString(),
  }
  writeRequests(requests.map((request) => request.id === id ? updated : request))
  return updated
}
