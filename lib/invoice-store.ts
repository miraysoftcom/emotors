import fs from 'fs'
import path from 'path'
import { formatMoney, normalizeMoneyAmount } from '@/lib/money'
import { getStoredOrders } from '@/lib/orders-store'
import type { TaxCalculationResult } from '@/lib/tax-calculation'
import { renderInvoiceHtmlDocument } from '@/lib/invoice-document'
import { createQrMatrix } from '@/lib/qr-code'
import { buildSwissQrBillPayload, buildSwissQrPaymentReference, renderSwissQrInvoicePdfBuffer } from '@/lib/swiss-qr-bill'

const INVOICE_FILE = path.join(process.cwd(), '.data', 'invoices.json')
const SETTINGS_FILE = path.join(process.cwd(), '.data', 'invoice-settings.json')

export type ReferenceType = 'QRR' | 'SCOR' | 'NON'
export type SwissQrConfigStatus = 'vollstaendig' | 'unvollstaendig' | 'nicht_konfiguriert' | 'fehlerhaft' | 'deaktiviert'

export interface InvoiceSettings {
  enabled: boolean
  logoUrl: string
  logoWidthMm: number
  logoHeightMm: number
  website: string
  companyName: string
  companyAddition: string
  street: string
  houseNumber: string
  postalCode: string
  city: string
  canton: string
  country: string
  email: string
  phone: string
  vatNumber: string
  commercialRegisterNumber: string
  iban: string
  qrIban: string
  bankName: string
  accountHolder: string
  bic: string
  referenceType: ReferenceType
  standardReference: string
  creditorReference: string
  additionalInformation: string
  invoiceText: string
  paymentTerms: string
  currency: 'CHF' | 'EUR'
  qrBillEnabled: boolean
  showQrForPaidInvoices: boolean
  qrBillNotes: string
  warrantyText: string
  signatureText: string
  swissQrVersion: '2.3' | '2.4'
  invoiceDueDays: number
  prepaymentDueDays: number
  invoicePrefix: string
  numberLength: number
  lastInvoiceNumber: number
  footerNote: string
  paymentInstructions: string
}

export interface InvoiceRecord {
  id: number
  orderId: number
  orderNumber: string
  invoiceNumber: string
  status: 'Offen' | 'Zahlung ausstehend' | 'Bezahlt' | 'Überfällig' | 'Storniert' | 'settings_required'
  paymentMethod: string
  amount: number
  currency: 'CHF' | 'EUR'
  dueDate: string
  taxSnapshot?: TaxCalculationResult | null
  swissQrSnapshot?: InvoiceSettings | null
  qrReference?: string | null
  swissQrPayload?: string | null
  createdAt: string
  updatedAt: string
}

const defaultSettings: InvoiceSettings = {
  enabled: false,
  logoUrl: '',
  logoWidthMm: 42,
  logoHeightMm: 14,
  website: 'https://mk-emotors.ch',
  companyName: '',
  companyAddition: '',
  street: '',
  houseNumber: '',
  postalCode: '',
  city: '',
  canton: '',
  country: 'CH',
  email: '',
  phone: '',
  vatNumber: '',
  commercialRegisterNumber: '',
  iban: '',
  qrIban: '',
  bankName: '',
  accountHolder: '',
  bic: '',
  referenceType: 'NON',
  standardReference: '',
  creditorReference: '',
  additionalInformation: '',
  invoiceText: '',
  paymentTerms: 'Zahlbar innerhalb der angegebenen Zahlungsfrist.',
  currency: 'CHF',
  qrBillEnabled: false,
  showQrForPaidInvoices: false,
  qrBillNotes: '',
  warrantyText: '',
  signatureText: '',
  swissQrVersion: '2.3',
  invoiceDueDays: 14,
  prepaymentDueDays: 10,
  invoicePrefix: 'RE',
  numberLength: 6,
  lastInvoiceNumber: 0,
  footerNote: '',
  paymentInstructions: 'Bitte überweisen Sie den offenen Betrag fristgerecht.',
}

function ensureFile(file: string, fallback: unknown) {
  const dir = path.dirname(file)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  if (!fs.existsSync(file)) fs.writeFileSync(file, JSON.stringify(fallback, null, 2))
}

function readJson<T>(file: string, fallback: T): T {
  ensureFile(file, fallback)
  try {
    return JSON.parse(fs.readFileSync(file, 'utf-8')) as T
  } catch {
    return fallback
  }
}

function writeJson(file: string, data: unknown) {
  ensureFile(file, data)
  fs.writeFileSync(file, JSON.stringify(data, null, 2))
}

export function getInvoiceSettings() {
  return {
    ...defaultSettings,
    ...readJson<Partial<InvoiceSettings>>(SETTINGS_FILE, defaultSettings),
  } as InvoiceSettings
}

export function saveInvoiceSettings(settings: InvoiceSettings) {
  const next = withAutomaticReferences({
    ...defaultSettings,
    ...settings,
    enabled: settings.qrBillEnabled ?? settings.enabled,
    logoWidthMm: normalizeDimension(settings.logoWidthMm, defaultSettings.logoWidthMm, 10, 90),
    logoHeightMm: normalizeDimension(settings.logoHeightMm, defaultSettings.logoHeightMm, 6, 40),
  })
  const status = getSwissQrStatus(next)
  if (status.status === 'fehlerhaft') {
    throw new Error(status.errors[0] || 'Die Swiss-QR-Einstellungen sind fehlerhaft.')
  }
  writeJson(SETTINGS_FILE, next)
  return next
}

function withAutomaticReferences(settings: InvoiceSettings) {
  const next = { ...settings }
  if (next.referenceType === 'QRR') {
    if (!isValidQrReference(next.standardReference)) {
      next.standardReference = buildReference(1, 'QRR') || ''
    }
    if (!next.creditorReference) {
      next.creditorReference = buildCreditorReference(next.lastInvoiceNumber || 1)
    }
  }
  if (next.referenceType === 'SCOR') {
    if (!next.creditorReference || !/^RF[0-9]{2}[A-Z0-9]{1,21}$/.test(next.creditorReference.replace(/\s+/g, '').toUpperCase())) {
      next.creditorReference = buildCreditorReference(next.lastInvoiceNumber || 1)
    }
    if (!next.standardReference) {
      next.standardReference = next.creditorReference
    }
  }
  if (next.referenceType === 'NON') {
    if (!next.standardReference) next.standardReference = `MK-${String(next.lastInvoiceNumber || 1).padStart(8, '0')}`
    if (!next.creditorReference) next.creditorReference = buildCreditorReference(next.lastInvoiceNumber || 1)
  }
  return next
}

function normalizeDimension(value: number | string | undefined, fallback: number, min: number, max: number) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return fallback
  return Math.max(min, Math.min(max, parsed))
}

export function validateInvoiceSettings(settings: InvoiceSettings) {
  const status = getSwissQrStatus(settings)
  if (status.status === 'fehlerhaft' || (settings.qrBillEnabled && status.status !== 'vollstaendig')) {
    throw new Error(status.errors[0] || 'Die Swiss-QR-Einstellungen sind unvollständig.')
  }
}

export function getSwissQrStatus(settings = getInvoiceSettings()) {
  const missing: string[] = []
  const errors: string[] = []
  if (!settings.qrBillEnabled) {
    return { status: 'deaktiviert' as SwissQrConfigStatus, missing, errors, label: 'Deaktiviert' }
  }

  const required: Array<[keyof InvoiceSettings, string]> = [
    ['companyName', 'Firmenname'],
    ['street', 'Straße'],
    ['houseNumber', 'Hausnummer'],
    ['postalCode', 'Postleitzahl'],
    ['city', 'Ort'],
    ['country', 'Land'],
    ['accountHolder', 'Kontoinhaber'],
    ['email', 'Firma E-Mail-Adresse'],
  ]
  for (const [key, label] of required) {
    if (!String(settings[key] || '').trim()) missing.push(label)
  }

  const iban = normalizeIban(settings.iban)
  const qrIban = normalizeIban(settings.qrIban)
  if (!['CHF', 'EUR'].includes(settings.currency)) errors.push('Die Währung muss CHF oder EUR sein.')
  if (settings.country && !/^[A-Z]{2}$/.test(settings.country)) errors.push('Bitte geben Sie das Land als ISO-Code ein, z. B. CH.')
  if (settings.postalCode && !/^[0-9]{4,5}$/.test(settings.postalCode)) errors.push('Die Postleitzahl ist ungültig.')
  if (iban && !isValidIbanFormat(iban)) errors.push('Die IBAN ist ungültig.')
  if (qrIban && !isValidIbanFormat(qrIban)) errors.push('Die QR-IBAN ist ungültig.')
  if (qrIban && !/^(CH|LI)/.test(qrIban)) errors.push('Die QR-IBAN muss mit CH oder LI beginnen.')

  if (settings.referenceType === 'QRR') {
    if (!qrIban) missing.push('QR-IBAN')
    const reference = settings.standardReference || buildReference(1, 'QRR')
    if (!isValidQrReference(reference || '')) errors.push('Die Referenznummer ist ungültig.')
  }
  if (settings.referenceType === 'SCOR') {
    if (!iban) missing.push('Normale IBAN')
    if (settings.creditorReference && !/^RF[0-9]{2}[A-Z0-9]{1,21}$/.test(settings.creditorReference.replace(/\s+/g, '').toUpperCase())) {
      errors.push('Die Creditor Reference ist ungültig.')
    }
  }
  if (settings.referenceType === 'NON' && !iban) missing.push('Normale IBAN')

  if (!iban && !qrIban) missing.push('IBAN oder QR-IBAN')
  if (errors.length) return { status: 'fehlerhaft' as SwissQrConfigStatus, missing, errors, label: 'Fehlerhaft' }
  if (missing.length) return { status: 'unvollstaendig' as SwissQrConfigStatus, missing: unique(missing), errors, label: 'Unvollständig' }
  return { status: 'vollstaendig' as SwissQrConfigStatus, missing, errors, label: 'Vollständig' }
}

export function normalizeIban(value?: string | null) {
  return String(value || '').replace(/\s+/g, '').toUpperCase()
}

export function isValidIbanFormat(value: string) {
  return /^[A-Z]{2}[0-9A-Z]{13,32}$/.test(value)
}

export function getInvoices() {
  return readJson<InvoiceRecord[]>(INVOICE_FILE, [])
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export function updateInvoice(id: number, data: Partial<InvoiceRecord>) {
  const invoices = getInvoices()
  const existing = invoices.find((invoice) => invoice.id === id)
  if (!existing) return null
  const updated = {
    ...existing,
    ...data,
    updatedAt: new Date().toISOString(),
  }
  writeJson(INVOICE_FILE, invoices.map((invoice) => invoice.id === id ? updated : invoice))
  return updated
}

function nextInvoiceNumber(settings: InvoiceSettings) {
  const year = new Date().getFullYear()
  const next = settings.lastInvoiceNumber + 1
  settings.lastInvoiceNumber = next
  writeJson(SETTINGS_FILE, settings)
  return `${settings.invoicePrefix}-${year}-${String(next).padStart(settings.numberLength, '0')}`
}

export function createInvoiceForOrder(order: {
  id: number
  orderNumber: string
  paymentMethod: string
  totalAmount: number
  currency?: 'CHF' | 'EUR'
  taxSnapshot?: TaxCalculationResult | null
  firstName?: string
  lastName?: string
  billingStreet?: string
  billingPostalCode?: string
  billingCity?: string
  billingCountry?: string
}) {
  const settings = getInvoiceSettings()
  const invoices = getInvoices()
  const now = new Date()
  const dueDays = order.paymentMethod === 'vorauszahlung' ? settings.prepaymentDueDays : settings.invoiceDueDays
  const dueDate = new Date(now)
  dueDate.setDate(dueDate.getDate() + dueDays)

  let payload: string | null = null
  let qrReference: string | null = null
  let status: InvoiceRecord['status'] = order.paymentMethod === 'vorauszahlung' ? 'Zahlung ausstehend' : 'Offen'

  try {
    const qrAllowedPayment = ['vorauszahlung', 'bank_transfer', 'auf_rechnung', 'rechnung'].includes(order.paymentMethod)
    const statusResult = getSwissQrStatus(settings)
    if (settings.qrBillEnabled && statusResult.status === 'vollstaendig' && (qrAllowedPayment || settings.showQrForPaidInvoices)) {
      qrReference = buildSwissQrPaymentReference(order.id, settings.referenceType)
      payload = buildSwissQrBillPayload(settings, {
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
        currency: 'CHF',
        customerName: `${order.firstName || ''} ${order.lastName || ''}`.trim(),
        customerStreet: order.billingStreet || '',
        customerPostalCode: order.billingPostalCode || '',
        customerCity: order.billingCity || '',
        customerCountry: order.billingCountry || 'CH',
      }, qrReference)
    } else if (settings.qrBillEnabled && statusResult.status !== 'vollstaendig') {
      status = 'settings_required'
    }
  } catch {
    status = 'settings_required'
  }

  const invoice: InvoiceRecord = {
    id: Math.max(0, ...invoices.map((item) => item.id)) + 1,
    orderId: order.id,
    orderNumber: order.orderNumber,
    invoiceNumber: nextInvoiceNumber(settings),
    status,
    paymentMethod: order.paymentMethod,
    amount: normalizeMoneyAmount(order.totalAmount),
    currency: order.currency || settings.currency,
    dueDate: dueDate.toISOString(),
    taxSnapshot: order.taxSnapshot || null,
    swissQrSnapshot: settings,
    qrReference,
    swissQrPayload: payload,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  }
  writeJson(INVOICE_FILE, [invoice, ...invoices])
  return invoice
}

function buildReference(orderId: number, type: ReferenceType) {
  if (type === 'NON') return null
  const base = String(orderId).padStart(26, '0')
  return type === 'QRR' ? `${base}${mod10Recursive(base)}` : `RF${String(98 - (Number(`${orderId}2715`) % 97)).padStart(2, '0')}${orderId}`
}

function buildCreditorReference(seed: number) {
  const base = `MK${String(seed || 1).padStart(10, '0')}`
  const rearranged = `${base}RF00`
  const numeric = rearranged.toUpperCase().replace(/[A-Z]/g, (char) => String(char.charCodeAt(0) - 55))
  let remainder = 0
  for (const digit of numeric) {
    remainder = (remainder * 10 + Number(digit)) % 97
  }
  return `RF${String(98 - remainder).padStart(2, '0')}${base}`
}

function isValidQrReference(value: string) {
  const digits = String(value || '').replace(/\s+/g, '')
  if (!/^[0-9]{27}$/.test(digits)) return false
  const base = digits.slice(0, 26)
  return Number(digits[26]) === mod10Recursive(base)
}

function mod10Recursive(value: string) {
  const table = [0, 9, 4, 6, 8, 2, 7, 1, 3, 5]
  let carry = 0
  for (const char of value) carry = table[(carry + Number(char)) % 10]
  return (10 - carry) % 10
}

function buildSwissQrPayload(settings: InvoiceSettings, order: { orderNumber: string; totalAmount: number; currency?: 'CHF' | 'EUR' }, reference: string | null) {
  const account = settings.referenceType === 'QRR' ? normalizeIban(settings.qrIban) : normalizeIban(settings.iban)
  const referenceType = settings.referenceType
  return [
    'SPC',
    settings.swissQrVersion,
    '1',
    account,
    'K',
    settings.companyName,
    `${settings.street} ${settings.houseNumber}`.trim(),
    '',
    settings.postalCode,
    settings.city,
    settings.country || 'CH',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    normalizeMoneyAmount(order.totalAmount).toFixed(2),
    order.currency || settings.currency,
    'K',
    '',
    '',
    '',
    '',
    '',
    '',
    referenceType,
    reference || '',
    `Bestellung ${order.orderNumber}`,
    'EPD',
  ].join('\n')
}

export function renderInvoicePdfBuffer(invoice: InvoiceRecord) {
  const settings = invoice.swissQrSnapshot || getInvoiceSettings()
  const order = getStoredOrders().find((item) => item.id === invoice.orderId || item.orderNumber === invoice.orderNumber)
  return renderSwissQrInvoicePdfBuffer(invoice, order, settings)
}

function renderLegacyInvoicePdfBuffer(invoice: InvoiceRecord) {
  const settings = invoice.swissQrSnapshot || getInvoiceSettings()
  const order = getStoredOrders().find((item) => item.id === invoice.orderId || item.orderNumber === invoice.orderNumber)
  const subtotal = order?.subtotal ?? invoice.amount
  const shipping = order?.shippingCost ?? 0
  const tax = invoice.taxSnapshot || null
  const taxLine = tax?.lines?.[0]
  const taxRate = taxLine?.percentage ?? 0
  const taxAmount = tax?.tax ?? order?.tax ?? 0
  const items = order?.items?.length ? order.items : [{ name: `Bestellung ${invoice.orderNumber}`, quantity: 1, price: invoice.amount }]
  const companyName = settings.companyName || 'MK - eMotors Dornach'
  const companyStreet = `${settings.street || 'Bruggweg'} ${settings.houseNumber || '15'}`.trim()
  const companyCity = `${settings.postalCode || '4143'} ${settings.city || 'Dornach'}`.trim()
  const customerName = order ? `${order.firstName} ${order.lastName}`.trim() : 'Peter Muster'
  const customerStreet = order?.billingStreet || 'Musterstrasse 1'
  const customerCity = `${order?.billingPostalCode || '1234'} ${order?.billingCity || 'Musterstadt'}`.trim()
  const account = settings.referenceType === 'QRR' ? settings.qrIban : settings.iban
  const reference = invoice.qrReference || settings.standardReference || invoice.orderNumber
  const amount = amountOnly(invoice.amount)
  const content: string[] = []
  const mm = (value: number) => value * 2.8346456693
  const pageHeight = 842
  const y = (mmFromTop: number) => pageHeight - mm(mmFromTop)
  const text = (x: number, top: number, value: string | number, size = 10, font: 'F1' | 'F2' = 'F1') => {
    content.push(`BT /${font} ${size} Tf ${mm(x).toFixed(2)} ${y(top).toFixed(2)} Td (${escapePdf(String(value))}) Tj ET`)
  }
  const line = (x1: number, top1: number, x2: number, top2: number, width = 0.6) => {
    content.push(`${width} w ${mm(x1).toFixed(2)} ${y(top1).toFixed(2)} m ${mm(x2).toFixed(2)} ${y(top2).toFixed(2)} l S`)
  }
  const rect = (x: number, top: number, w: number, h: number, fill = false, gray?: number) => {
    if (gray !== undefined) content.push(`${gray} g`)
    content.push(`${mm(x).toFixed(2)} ${y(top + h).toFixed(2)} ${mm(w).toFixed(2)} ${mm(h).toFixed(2)} re ${fill ? 'f' : 'S'}`)
    if (gray !== undefined) content.push('0 g')
  }
  const dashedLine = (x1: number, top1: number, x2: number, top2: number) => {
    content.push('[1.4 1.4] 0 d')
    line(x1, top1, x2, top2, 0.45)
    content.push('[] 0 d')
  }

  // Invoice body
  text(87, 27, companyName, 12, 'F2')
  text(87, 33, companyStreet, 10, 'F1')
  text(87, 38, companyCity, 10, 'F1')
  if (settings.email) text(87, 43, settings.email, 8, 'F1')
  text(60, 66, customerName, 9, 'F1')
  text(60, 71, customerStreet, 9, 'F1')
  text(60, 76, customerCity, 9, 'F1')
  text(148, 86, `${settings.city || 'Dornach'} ${formatDate(invoice.createdAt)}`, 9, 'F1')
  text(20, 106, `Rechnung Nr. ${invoice.invoiceNumber}`, 12, 'F2')

  const tableTop = 119
  rect(20, tableTop, 170, 8, true, 0.32)
  content.push('1 g')
  text(22, tableTop + 5.5, 'Position', 9, 'F2')
  text(40, tableTop + 5.5, 'Anzahl', 9, 'F2')
  text(62, tableTop + 5.5, 'Bezeichnung', 9, 'F2')
  text(162, tableTop + 5.5, 'Total', 9, 'F2')
  content.push('0 g')

  let rowTop = tableTop + 14
  items.slice(0, 5).forEach((item, index) => {
    text(22, rowTop, index + 1, 9, 'F1')
    text(42, rowTop, `${item.quantity} Stk.`, 9, 'F1')
    text(62, rowTop, item.name, 9, 'F1')
    text(162, rowTop, formatMoney(item.price * item.quantity, invoice.currency), 9, 'F1')
    rowTop += 8
  })

  const totalsTop = Math.max(rowTop + 4, 146)
  text(62, totalsTop, 'Summe', 10, 'F2')
  text(162, totalsTop, formatMoney(subtotal, invoice.currency), 10, 'F2')
  if (shipping > 0) {
    text(62, totalsTop + 12, 'Versand', 9, 'F1')
    text(162, totalsTop + 12, formatMoney(shipping, invoice.currency), 9, 'F1')
  }
  if (tax?.enabled) {
    text(62, totalsTop + 24, 'MwSt.', 9, 'F1')
    text(162, totalsTop + 24, taxRate ? `${taxRate}%` : 'steuerfrei', 9, 'F1')
    text(62, totalsTop + 32, 'MwSt. Betrag', 9, 'F1')
    text(162, totalsTop + 32, formatMoney(taxAmount, invoice.currency), 9, 'F1')
  }
  text(62, totalsTop + 42, 'Rechnungstotal', 10, 'F2')
  text(162, totalsTop + 42, formatMoney(invoice.amount, invoice.currency), 10, 'F2')
  line(162, totalsTop + 45, 188, totalsTop + 45, 0.7)
  text(20, 190, settings.paymentTerms || 'Wir bitten Sie um Ueberweisung des Rechnungsbetrages innerhalb der Zahlungsfrist.', 8, 'F1')
  text(20, 199, companyName, 8, 'F1')

  // Swiss QR slip
  dashedLine(0, 192, 210, 192)
  dashedLine(62, 192, 62, 297)
  text(102, 193.5, '✂', 9, 'F1')
  text(61, 204, '✂', 9, 'F1')
  text(5, 202, 'Empfangsschein', 10, 'F2')
  text(67, 202, 'Zahlteil', 10, 'F2')
  text(119, 202, 'Konto / Zahlbar an', 7, 'F2')
  text(5, 212, 'Konto / Zahlbar an', 6, 'F2')
  ;[account || '-', companyName, companyStreet, companyCity].forEach((value, index) => text(5, 216 + index * 4, value, 6, 'F1'))
  text(5, 237, 'Referenz', 6, 'F2')
  text(5, 241, reference, 6, 'F1')
  text(5, 252, 'Zahlbar durch', 6, 'F2')
  ;[customerName, customerStreet, customerCity].forEach((value, index) => text(5, 256 + index * 4, value, 6, 'F1'))
  text(5, 283, 'Waehrung', 6, 'F2')
  text(28, 283, 'Betrag', 6, 'F2')
  text(5, 288, invoice.currency, 7, 'F1')
  text(28, 288, amount, 7, 'F1')
  text(43, 294, 'Annahmestelle', 5, 'F2')

  const swissQrPayload = invoice.swissQrPayload || buildSwissQrPayload(settings, {
    orderNumber: invoice.orderNumber,
    totalAmount: invoice.amount,
    currency: invoice.currency,
  }, reference)
  drawSwissQrCode(content, swissQrPayload, mm(68), y(245), mm(48))
  text(68, 283, 'Waehrung', 7, 'F2')
  text(90, 283, 'Betrag', 7, 'F2')
  text(68, 289, invoice.currency, 9, 'F1')
  text(90, 289, amount, 9, 'F1')

  ;[account || '-', companyName, companyStreet, companyCity].forEach((value, index) => text(119, 207 + index * 5, value, 9, index === 0 ? 'F1' : 'F1'))
  text(119, 232, 'Referenz', 7, 'F2')
  text(119, 237, reference, 8, 'F1')
  text(119, 251, 'Zahlbar durch', 7, 'F2')
  ;[customerName, customerStreet, customerCity].forEach((value, index) => text(119, 256 + index * 5, value, 9, 'F1'))

  return buildPdf([
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 6 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    `<< /Length ${Buffer.byteLength(content.join('\n'), 'utf8')} >>\nstream\n${content.join('\n')}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>',
  ])
}

function buildPdf(objects: string[]) {
  const parts = ['%PDF-1.4\n']
  const offsets = [0]
  objects.forEach((object, index) => {
    offsets[index + 1] = Buffer.byteLength(parts.join(''), 'utf8')
    parts.push(`${index + 1} 0 obj\n${object}\nendobj\n`)
  })
  const xrefOffset = Buffer.byteLength(parts.join(''), 'utf8')
  parts.push(`xref\n0 ${objects.length + 1}\n`)
  parts.push('0000000000 65535 f \n')
  for (let index = 1; index <= objects.length; index += 1) {
    parts.push(`${String(offsets[index]).padStart(10, '0')} 00000 n \n`)
  }
  parts.push(`trailer << /Root 1 0 R /Size ${objects.length + 1} >>\nstartxref\n${xrefOffset}\n%%EOF`)
  return Buffer.from(parts.join(''), 'utf8')
}

export function renderFallbackPdfBuffer(title: string, message: string) {
  const content: string[] = []
  const mm = (value: number) => value * 2.8346456693
  const y = (top: number) => 842 - mm(top)
  const text = (x: number, top: number, value: string | number, size = 11, font: 'F1' | 'F2' = 'F1') => {
    content.push(`BT /${font} ${size} Tf ${mm(x).toFixed(2)} ${y(top).toFixed(2)} Td (${escapePdf(String(value))}) Tj ET`)
  }

  text(22, 28, 'MK-eMotors Dornach', 16, 'F2')
  text(22, 45, title, 13, 'F2')
  String(message || 'Die PDF-Datei konnte nicht erstellt werden.').split('\n').slice(0, 8).forEach((line, index) => {
    text(22, 60 + index * 7, line, 10, 'F1')
  })

  return buildPdf([
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 6 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    `<< /Length ${Buffer.byteLength(content.join('\n'), 'utf8')} >>\nstream\n${content.join('\n')}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>',
  ])
}

export function isPdfBuffer(buffer: Buffer) {
  const value = buffer.toString('latin1', 0, Math.min(buffer.length, 16))
  return value.startsWith('%PDF-') && buffer.includes(Buffer.from('%%EOF'))
}

function drawSwissQrCode(content: string[], payload: string, x: number, y: number, size: number) {
  const matrix = createQrMatrix(payload)
  const quietZone = 4
  const cells = matrix.size + quietZone * 2
  const cell = size / cells
  content.push('0 g')
  matrix.data.forEach((filled, index) => {
    if (!filled) return
    const row = Math.floor(index / matrix.size)
    const col = index % matrix.size
    const drawX = x + (col + quietZone) * cell
    const drawY = y + size - (row + quietZone + 1) * cell
    content.push(`${drawX.toFixed(2)} ${drawY.toFixed(2)} ${cell.toFixed(2)} ${cell.toFixed(2)} re f`)
  })

  const crossSize = size * 0.17
  const crossX = x + size / 2 - crossSize / 2
  const crossY = y + size / 2 - crossSize / 2
  content.push(`1 g ${crossX.toFixed(2)} ${crossY.toFixed(2)} ${crossSize.toFixed(2)} ${crossSize.toFixed(2)} re f 0 g`)
  content.push(`${(crossX + crossSize * 0.42).toFixed(2)} ${(crossY + crossSize * 0.18).toFixed(2)} ${(crossSize * 0.16).toFixed(2)} ${(crossSize * 0.64).toFixed(2)} re f`)
  content.push(`${(crossX + crossSize * 0.18).toFixed(2)} ${(crossY + crossSize * 0.42).toFixed(2)} ${(crossSize * 0.64).toFixed(2)} ${(crossSize * 0.16).toFixed(2)} re f`)
}

export function renderInvoiceHtml(invoice: InvoiceRecord) {
  const settings = invoice.swissQrSnapshot || getInvoiceSettings()
  const order = getStoredOrders().find((item) => item.id === invoice.orderId || item.orderNumber === invoice.orderNumber)
  return renderInvoiceHtmlDocument({ invoice, order, settings })
}

function escapePdf(value: string) {
  return value.replace(/[()\\]/g, '\\$&').replace(/[^\x20-\x7E]/g, '')
}

function amountOnly(value: number) {
  return new Intl.NumberFormat('de-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(normalizeMoneyAmount(value))
}

function formatDate(value?: string | null) {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('de-CH')
}

function unique(values: string[]) {
  return Array.from(new Set(values))
}

export function createTestInvoice() {
  const settings = getInvoiceSettings()
  const now = new Date().toISOString()
  const invoice: InvoiceRecord = {
    id: 0,
    orderId: 0,
    orderNumber: 'TEST-QR',
    invoiceNumber: 'TEST-QR-RECHNUNG',
    status: 'Offen',
    paymentMethod: 'vorauszahlung',
    amount: 100,
    currency: settings.currency,
    dueDate: now,
    taxSnapshot: null,
    swissQrSnapshot: settings,
    qrReference: buildSwissQrPaymentReference(1, settings.referenceType),
    swissQrPayload: null,
    createdAt: now,
    updatedAt: now,
  }
  const status = getSwissQrStatus(settings)
  if (settings.qrBillEnabled && status.status === 'vollstaendig') {
    invoice.swissQrPayload = buildSwissQrBillPayload(settings, {
      orderNumber: invoice.orderNumber,
      totalAmount: invoice.amount,
      currency: 'CHF',
      customerName: 'Peter Muster',
      customerStreet: 'Musterstrasse 1',
      customerPostalCode: '1234',
      customerCity: 'Musterstadt',
      customerCountry: 'CH',
    }, invoice.qrReference || null)
  }
  return invoice
}
