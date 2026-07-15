import fs from 'fs'
import path from 'path'

const STORE_FILE = path.join(process.cwd(), '.data', 'warranty-records.json')

export type WarrantyStatus = 'active' | 'expired' | 'void' | 'service'

export interface WarrantyRecord {
  id: string
  serialNumber: string
  vehicleNumber: string
  productName: string
  orderNumber: string
  customerEmail: string
  customerName: string
  purchaseDate: string
  warrantyUntil: string
  status: WarrantyStatus
  notes: string
  createdAt: string
  updatedAt: string
}

export type WarrantyInput = Omit<WarrantyRecord, 'id' | 'createdAt' | 'updatedAt'>

function ensureStore() {
  const dir = path.dirname(STORE_FILE)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  if (!fs.existsSync(STORE_FILE)) fs.writeFileSync(STORE_FILE, '[]')
}

function readRecords(): WarrantyRecord[] {
  ensureStore()
  try {
    return JSON.parse(fs.readFileSync(STORE_FILE, 'utf-8')) as WarrantyRecord[]
  } catch {
    return []
  }
}

function writeRecords(records: WarrantyRecord[]) {
  ensureStore()
  fs.writeFileSync(STORE_FILE, JSON.stringify(records, null, 2))
}

export function normalizeWarrantyCode(value: string) {
  return value.trim().replace(/\s+/g, '').toUpperCase()
}

export function getWarrantyRecords() {
  return readRecords().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export function findWarrantyRecord(code: string) {
  const normalized = normalizeWarrantyCode(code)
  if (!normalized) return null
  return readRecords().find((record) => (
    normalizeWarrantyCode(record.serialNumber) === normalized ||
    normalizeWarrantyCode(record.vehicleNumber) === normalized
  )) || null
}

export function upsertWarrantyRecord(input: WarrantyInput, id?: string) {
  const now = new Date().toISOString()
  const records = readRecords()
  const normalizedSerial = normalizeWarrantyCode(input.serialNumber)
  const normalizedVehicle = normalizeWarrantyCode(input.vehicleNumber)
  const existingIndex = id
    ? records.findIndex((record) => record.id === id)
    : records.findIndex((record) => (
        normalizeWarrantyCode(record.serialNumber) === normalizedSerial ||
        (normalizedVehicle && normalizeWarrantyCode(record.vehicleNumber) === normalizedVehicle)
      ))

  const base: WarrantyRecord = existingIndex >= 0 ? records[existingIndex] : {
    id: `wr_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    createdAt: now,
    updatedAt: now,
    ...input,
  }

  const next: WarrantyRecord = {
    ...base,
    ...input,
    serialNumber: input.serialNumber.trim(),
    vehicleNumber: input.vehicleNumber.trim(),
    updatedAt: now,
  }

  if (existingIndex >= 0) {
    records[existingIndex] = next
  } else {
    records.unshift(next)
  }
  writeRecords(records)
  return next
}

export function deleteWarrantyRecord(id: string) {
  const records = readRecords()
  const next = records.filter((record) => record.id !== id)
  writeRecords(next)
  return next.length !== records.length
}

export function getWarrantyState(record: WarrantyRecord) {
  if (record.status === 'void') return 'void'
  if (record.status === 'service') return 'service'
  const until = new Date(record.warrantyUntil)
  if (Number.isNaN(until.getTime())) return record.status
  return until >= new Date() ? 'active' : 'expired'
}
