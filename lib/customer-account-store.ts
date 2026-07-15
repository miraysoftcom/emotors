import fs from 'fs'
import path from 'path'
import { getInvoices } from '@/lib/invoice-store'
import { getStoredOrders } from '@/lib/orders-store'

const STORE_FILE = path.join(process.cwd(), '.data', 'customer-accounts.json')

export type ThemePreference = 'dunkel' | 'hell'

export interface CustomerAddress {
  id: number
  type: 'shipping' | 'billing'
  firstName: string
  lastName: string
  company?: string
  street: string
  houseNumber?: string
  addressLine2?: string
  postalCode: string
  city: string
  canton?: string
  country: string
  phone?: string
  isDefaultShipping: boolean
  isDefaultBilling: boolean
  createdAt: string
  updatedAt: string
}

export interface CustomerAccountRecord {
  key: string
  email: string
  userId?: string
  firstName?: string
  lastName?: string
  phone?: string
  company?: string
  preferredLanguage: 'de' | 'en' | 'tr'
  theme: ThemePreference
  notifications: {
    orderUpdates: boolean
    paymentUpdates: boolean
    shippingUpdates: boolean
    invoiceUpdates: boolean
    marketing: boolean
    productNews: boolean
    security: boolean
  }
  security: {
    twoFactorEnabled: boolean
    twoFactorSecret?: string
    twoFactorPendingSecret?: string
    twoFactorEnabledAt?: string
    twoFactorLastVerifiedAt?: string
    recoveryCodes?: string[]
  }
  addresses: CustomerAddress[]
  createdAt: string
  updatedAt: string
}

const defaultNotifications = {
  orderUpdates: true,
  paymentUpdates: true,
  shippingUpdates: true,
  invoiceUpdates: true,
  marketing: false,
  productNews: false,
  security: true,
}

const defaultSecurity = {
  twoFactorEnabled: false,
  twoFactorSecret: '',
  twoFactorPendingSecret: '',
  twoFactorEnabledAt: '',
  twoFactorLastVerifiedAt: '',
  recoveryCodes: [],
}

function ensureStore() {
  const dir = path.dirname(STORE_FILE)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  if (!fs.existsSync(STORE_FILE)) fs.writeFileSync(STORE_FILE, '{}')
}

function readStore() {
  ensureStore()
  try {
    const store = JSON.parse(fs.readFileSync(STORE_FILE, 'utf-8')) as Record<string, CustomerAccountRecord>
    return Object.fromEntries(
      Object.entries(store).map(([key, account]) => [key, normalizeAccount(account)])
    ) as Record<string, CustomerAccountRecord>
  } catch {
    return {}
  }
}

function normalizeAccount(account: CustomerAccountRecord): CustomerAccountRecord {
  return {
    ...account,
    notifications: { ...defaultNotifications, ...account.notifications },
    security: { ...defaultSecurity, ...account.security },
  }
}

function writeStore(store: Record<string, CustomerAccountRecord>) {
  ensureStore()
  fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2))
}

export function normalizeCustomerKey(userId?: string | null, email?: string | null) {
  return userId ? `user:${userId}` : `email:${String(email || '').trim().toLowerCase()}`
}

function normalizePhone(value?: string | null) {
  return String(value || '').replace(/[^\d+]/g, '').trim()
}

export function findCustomerAccountByEmail(email?: string | null) {
  const normalizedEmail = String(email || '').trim().toLowerCase()
  if (!normalizedEmail) return null
  return Object.values(readStore()).find((account) => account.email.toLowerCase() === normalizedEmail) || null
}

export function findCustomerAccountByPhone(phone?: string | null) {
  const normalizedPhone = normalizePhone(phone)
  if (!normalizedPhone) return null
  return Object.values(readStore()).find((account) => normalizePhone(account.phone) === normalizedPhone) || null
}

export function getOrCreateCustomerAccount(input: {
  userId?: string | null
  email: string
  name?: string | null
}) {
  const store = readStore()
  const key = normalizeCustomerKey(input.userId, input.email)
  const now = new Date().toISOString()
  const existing = store[key]
  if (existing) return normalizeAccount(existing)

  const [firstName = '', ...lastNameParts] = String(input.name || '').trim().split(/\s+/).filter(Boolean)
  const account: CustomerAccountRecord = {
    key,
    userId: input.userId || undefined,
    email: input.email.trim().toLowerCase(),
    firstName,
    lastName: lastNameParts.join(' '),
    preferredLanguage: 'de',
    theme: 'dunkel',
    notifications: defaultNotifications,
    security: defaultSecurity,
    addresses: [],
    createdAt: now,
    updatedAt: now,
  }
  store[key] = account
  writeStore(store)
  return account
}

export function updateCustomerAccount(key: string, data: Partial<CustomerAccountRecord>) {
  const store = readStore()
  if (!store[key]) return null
  store[key] = {
    ...store[key],
    ...data,
    notifications: { ...store[key].notifications, ...data.notifications },
    security: { ...defaultSecurity, ...store[key].security, ...data.security },
    addresses: data.addresses || store[key].addresses,
    updatedAt: new Date().toISOString(),
  }
  writeStore(store)
  return store[key]
}

export function saveCustomerAddress(key: string, data: Partial<CustomerAddress>) {
  const store = readStore()
  const account = store[key]
  if (!account) return null
  const now = new Date().toISOString()
  const addresses = [...account.addresses]
  const id = data.id || Math.max(0, ...addresses.map((item) => item.id)) + 1
  const nextAddress: CustomerAddress = {
    id,
    type: data.type === 'billing' ? 'billing' : 'shipping',
    firstName: String(data.firstName || account.firstName || '').trim(),
    lastName: String(data.lastName || account.lastName || '').trim(),
    company: data.company || '',
    street: String(data.street || '').trim(),
    houseNumber: data.houseNumber || '',
    addressLine2: data.addressLine2 || '',
    postalCode: String(data.postalCode || '').trim(),
    city: String(data.city || '').trim(),
    canton: data.canton || '',
    country: data.country || 'CH',
    phone: data.phone || account.phone || '',
    isDefaultShipping: Boolean(data.isDefaultShipping),
    isDefaultBilling: Boolean(data.isDefaultBilling),
    createdAt: addresses.find((item) => item.id === id)?.createdAt || now,
    updatedAt: now,
  }

  const normalized = addresses.filter((item) => item.id !== id).map((item) => ({
    ...item,
    isDefaultShipping: nextAddress.isDefaultShipping ? false : item.isDefaultShipping,
    isDefaultBilling: nextAddress.isDefaultBilling ? false : item.isDefaultBilling,
  }))
  store[key] = { ...account, addresses: [nextAddress, ...normalized], updatedAt: now }
  writeStore(store)
  return store[key]
}

export function deleteCustomerAddress(key: string, id: number) {
  const store = readStore()
  const account = store[key]
  if (!account) return null
  store[key] = {
    ...account,
    addresses: account.addresses.filter((item) => item.id !== id),
    updatedAt: new Date().toISOString(),
  }
  writeStore(store)
  return store[key]
}

export function getCustomerOrders(email: string, userId?: string | null) {
  const normalizedEmail = email.trim().toLowerCase()
  return getStoredOrders().filter((order) => (
    order.email.toLowerCase() === normalizedEmail || Boolean(userId && (order as { userId?: string }).userId === userId)
  ))
}

export function getCustomerInvoices(email: string, userId?: string | null) {
  const orders = getCustomerOrders(email, userId)
  const orderKeys = new Set(orders.flatMap((order) => [String(order.id), order.orderNumber]))
  return getInvoices().filter((invoice) => orderKeys.has(String(invoice.orderId)) || orderKeys.has(invoice.orderNumber))
}
