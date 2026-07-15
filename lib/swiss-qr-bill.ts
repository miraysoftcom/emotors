import { createQrMatrix } from '@/lib/qr-code'
import { formatMoney, normalizeMoneyAmount } from '@/lib/money'
import type { InvoiceRecord, InvoiceSettings, ReferenceType } from '@/lib/invoice-store'
import type { StoredOrder } from '@/lib/orders-store'

type SwissQrParty = {
  name: string
  street: string
  houseNumber?: string
  postalCode: string
  city: string
  country: string
}

type SwissQrOrderPayload = {
  orderNumber: string
  totalAmount: number
  currency?: 'CHF' | 'EUR'
  customerName?: string
  customerStreet?: string
  customerPostalCode?: string
  customerCity?: string
  customerCountry?: string
}

type PdfObject = string | Buffer

const A4_WIDTH = 595.28
const A4_HEIGHT = 841.89
const MM = 72 / 25.4
const QR_BILL_TOP_MM = 192
const QR_BILL_HEIGHT_MM = 105
const RECEIPT_WIDTH_MM = 62

export function renderSwissQrInvoicePdfBuffer(invoice: InvoiceRecord, order: StoredOrder | undefined, settings: InvoiceSettings) {
  const normalized = normalizeInvoiceInput(invoice, order, settings)
  const content: string[] = []
  const mm = (value: number) => value * MM
  const y = (topMm: number) => A4_HEIGHT - mm(topMm)
  const text = (xMm: number, topMm: number, value: string | number, size = 9, font: 'F1' | 'F2' = 'F1') => {
    content.push(`BT /${font} ${size} Tf ${mm(xMm).toFixed(2)} ${y(topMm).toFixed(2)} Td (${escapePdf(String(value))}) Tj ET`)
  }
  const rightText = (rightMm: number, topMm: number, value: string | number, size = 9, font: 'F1' | 'F2' = 'F1') => {
    const safe = String(value)
    const widthEstimateMm = safe.length * size * 0.18
    text(rightMm - widthEstimateMm, topMm, safe, size, font)
  }
  const line = (x1Mm: number, top1Mm: number, x2Mm: number, top2Mm: number, width = 0.45) => {
    content.push(`${width} w ${mm(x1Mm).toFixed(2)} ${y(top1Mm).toFixed(2)} m ${mm(x2Mm).toFixed(2)} ${y(top2Mm).toFixed(2)} l S`)
  }
  const rect = (xMm: number, topMm: number, widthMm: number, heightMm: number, fillGray?: number) => {
    if (fillGray !== undefined) content.push(`${fillGray} g`)
    content.push(`${mm(xMm).toFixed(2)} ${y(topMm + heightMm).toFixed(2)} ${mm(widthMm).toFixed(2)} ${mm(heightMm).toFixed(2)} re ${fillGray === undefined ? 'S' : 'f'}`)
    if (fillGray !== undefined) content.push('0 g')
  }
  const dashedLine = (x1Mm: number, top1Mm: number, x2Mm: number, top2Mm: number) => {
    content.push('[1.2 1.2] 0 d')
    line(x1Mm, top1Mm, x2Mm, top2Mm, 0.35)
    content.push('[] 0 d')
  }

  drawInvoiceBody({ content, text, rightText, line, rect, invoice, order, settings, normalized })
  drawSwissQrPaymentPart({ content, text, line, dashedLine, invoice, normalized })

  return buildPdf([
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /Font << /F1 4 0 R /F2 6 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    makeStream(content.join('\n')),
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>',
  ])
}

function drawInvoiceBody({
  content,
  text,
  rightText,
  line,
  rect,
  invoice,
  order,
  settings,
  normalized,
}: {
  content: string[]
  text: (xMm: number, topMm: number, value: string | number, size?: number, font?: 'F1' | 'F2') => void
  rightText: (rightMm: number, topMm: number, value: string | number, size?: number, font?: 'F1' | 'F2') => void
  line: (x1Mm: number, top1Mm: number, x2Mm: number, top2Mm: number, width?: number) => void
  rect: (xMm: number, topMm: number, widthMm: number, heightMm: number, fillGray?: number) => void
  invoice: InvoiceRecord
  order?: StoredOrder
  settings: InvoiceSettings
  normalized: ReturnType<typeof normalizeInvoiceInput>
}) {
  const items = order?.items?.length
    ? order.items
    : [{ productId: invoice.orderId, name: `Bestellung ${invoice.orderNumber}`, quantity: 1, price: invoice.amount }]
  const taxRate = invoice.taxSnapshot?.lines?.[0]?.percentage ?? 8.1
  const netAmount = roundChf((order?.subtotal ?? invoice.amount - (order?.tax || 0)))
  const taxAmount = roundChf(order?.tax ?? invoice.taxSnapshot?.tax ?? invoice.amount - netAmount)
  const total = roundChf(invoice.amount)

  text(22, 22, normalized.creditor.name, 15, 'F2')
  text(22, 29, normalized.creditor.streetLine, 9)
  text(22, 34, `${normalized.creditor.postalCode} ${normalized.creditor.city}`, 9)
  if (settings.email) text(22, 39, settings.email, 8)
  if (settings.phone) text(22, 44, settings.phone, 8)
  if (settings.website) text(22, 49, settings.website, 8)
  if (settings.vatNumber || settings.commercialRegisterNumber) {
    text(22, 54, [settings.vatNumber, settings.commercialRegisterNumber].filter(Boolean).join(' / '), 8)
  }

  text(132, 24, 'RECHNUNG', 20, 'F2')
  text(132, 36, `Rechnungsnr.: ${invoice.invoiceNumber}`, 9)
  text(132, 42, `Bestellnr.: ${invoice.orderNumber}`, 9)
  text(132, 48, `Kundennr.: ${order ? `K-${String(order.id).padStart(6, '0')}` : '-'}`, 9)
  text(132, 54, `Auftragsdatum: ${formatDate(order?.createdAt || invoice.createdAt)}`, 9)
  text(132, 60, `Lieferdatum: ${formatDate(order?.estimatedDeliveryDate || invoice.createdAt)}`, 9)
  text(132, 66, `Faelligkeit: ${formatDate(invoice.dueDate)}`, 9)
  text(132, 72, `Status: ${invoice.status}`, 9, 'F2')

  text(22, 79, 'Kunde', 10, 'F2')
  text(22, 86, normalized.debtor.name, 10)
  text(22, 92, normalized.debtor.streetLine, 9)
  text(22, 98, `${normalized.debtor.postalCode} ${normalized.debtor.city}`, 9)
  if (order?.email) text(22, 104, order.email, 8)

  const tableTop = 118
  rect(22, tableTop, 166, 8, 0.26)
  content.push('1 g')
  text(24, tableTop + 5.5, 'Pos.', 8, 'F2')
  text(38, tableTop + 5.5, 'Artikel', 8, 'F2')
  text(104, tableTop + 5.5, 'Menge', 8, 'F2')
  text(124, tableTop + 5.5, 'Einzelpreis', 8, 'F2')
  text(151, tableTop + 5.5, 'MwSt.', 8, 'F2')
  text(169, tableTop + 5.5, 'Gesamt', 8, 'F2')
  content.push('0 g')

  let rowTop = tableTop + 15
  items.slice(0, 8).forEach((item, index) => {
    const lineTotal = roundChf(item.price * item.quantity)
    text(24, rowTop, String(index + 1), 8)
    text(38, rowTop, clipText(`${item.productId ? `${item.productId} - ` : ''}${item.name}`, 46), 8)
    text(106, rowTop, `${item.quantity} Stk.`, 8)
    text(124, rowTop, formatMoney(item.price, 'CHF'), 8)
    text(152, rowTop, `${taxRate}%`, 8)
    rightText(188, rowTop, formatMoney(lineTotal, 'CHF'), 8)
    line(22, rowTop + 3, 188, rowTop + 3, 0.2)
    rowTop += 8
  })

  const totalsTop = Math.max(rowTop + 5, 160)
  text(124, totalsTop, 'Netto', 9)
  rightText(188, totalsTop, formatMoney(netAmount, 'CHF'), 9)
  text(124, totalsTop + 7, `MwSt. ${taxRate}%`, 9)
  rightText(188, totalsTop + 7, formatMoney(taxAmount, 'CHF'), 9)
  text(124, totalsTop + 16, 'Rechnungstotal', 11, 'F2')
  rightText(188, totalsTop + 16, formatMoney(total, 'CHF'), 11, 'F2')
  line(124, totalsTop + 19, 188, totalsTop + 19, 0.7)

  text(22, 179, settings.paymentTerms || 'Zahlbar innerhalb der angegebenen Zahlungsfrist.', 8)
  text(22, 185, settings.footerNote || 'Vielen Dank fuer Ihren Einkauf bei MK-eMotors Dornach.', 8)
}

function drawSwissQrPaymentPart({
  content,
  text,
  line,
  dashedLine,
  invoice,
  normalized,
}: {
  content: string[]
  text: (xMm: number, topMm: number, value: string | number, size?: number, font?: 'F1' | 'F2') => void
  line: (x1Mm: number, top1Mm: number, x2Mm: number, top2Mm: number, width?: number) => void
  dashedLine: (x1Mm: number, top1Mm: number, x2Mm: number, top2Mm: number) => void
  invoice: InvoiceRecord
  normalized: ReturnType<typeof normalizeInvoiceInput>
}) {
  dashedLine(0, QR_BILL_TOP_MM, 210, QR_BILL_TOP_MM)
  dashedLine(RECEIPT_WIDTH_MM, QR_BILL_TOP_MM, RECEIPT_WIDTH_MM, QR_BILL_TOP_MM + QR_BILL_HEIGHT_MM)
  text(103, QR_BILL_TOP_MM + 1.5, 'x', 7)
  text(RECEIPT_WIDTH_MM - 1.2, QR_BILL_TOP_MM + 11, 'x', 7)

  text(5, 202, 'Empfangsschein', 11, 'F2')
  text(67, 202, 'Zahlteil', 11, 'F2')

  drawReceiptText(text, invoice, normalized)
  drawPaymentText(text, invoice, normalized)
  drawSwissQrCode(content, normalized.payload, 67, 211, 46)

  text(67, 281, 'Waehrung', 7, 'F2')
  text(90, 281, 'Betrag', 7, 'F2')
  text(67, 288, 'CHF', 10)
  text(90, 288, amountOnly(invoice.amount), 10)
  line(0, QR_BILL_TOP_MM, 210, QR_BILL_TOP_MM, 0.25)
}

function drawReceiptText(text: (xMm: number, topMm: number, value: string | number, size?: number, font?: 'F1' | 'F2') => void, invoice: InvoiceRecord, normalized: ReturnType<typeof normalizeInvoiceInput>) {
  text(5, 213, 'Konto / Zahlbar an', 6, 'F2')
  ;[normalized.account, normalized.creditor.name, normalized.creditor.streetLine, `${normalized.creditor.postalCode} ${normalized.creditor.city}`]
    .forEach((value, index) => text(5, 217 + index * 4, value, 6))
  text(5, 238, 'Referenz', 6, 'F2')
  text(5, 242, formatReference(normalized.reference), 6)
  text(5, 253, 'Zahlbar durch', 6, 'F2')
  ;[normalized.debtor.name, normalized.debtor.streetLine, `${normalized.debtor.postalCode} ${normalized.debtor.city}`]
    .forEach((value, index) => text(5, 257 + index * 4, value, 6))
  text(5, 282, 'Waehrung', 6, 'F2')
  text(28, 282, 'Betrag', 6, 'F2')
  text(5, 288, 'CHF', 7)
  text(28, 288, amountOnly(invoice.amount), 7)
  text(43, 294, 'Annahmestelle', 5, 'F2')
}

function drawPaymentText(text: (xMm: number, topMm: number, value: string | number, size?: number, font?: 'F1' | 'F2') => void, _invoice: InvoiceRecord, normalized: ReturnType<typeof normalizeInvoiceInput>) {
  text(119, 207, 'Konto / Zahlbar an', 7, 'F2')
  ;[normalized.account, normalized.creditor.name, normalized.creditor.streetLine, `${normalized.creditor.postalCode} ${normalized.creditor.city}`]
    .forEach((value, index) => text(119, 213 + index * 5, value, 8))
  text(119, 238, 'Referenz', 7, 'F2')
  text(119, 243, formatReference(normalized.reference), 8)
  text(119, 257, 'Zahlbar durch', 7, 'F2')
  ;[normalized.debtor.name, normalized.debtor.streetLine, `${normalized.debtor.postalCode} ${normalized.debtor.city}`]
    .forEach((value, index) => text(119, 263 + index * 5, value, 8))
}

function normalizeInvoiceInput(invoice: InvoiceRecord, order: StoredOrder | undefined, settings: InvoiceSettings) {
  const creditor = normalizeParty({
    name: settings.accountHolder || settings.companyName || 'MK-eMotors Dornach',
    street: `${settings.street || 'Bruggweg'} ${settings.houseNumber || '15'}`.trim(),
    postalCode: settings.postalCode || '4143',
    city: settings.city || 'Dornach',
    country: settings.country || 'CH',
  })
  const debtor = normalizeParty({
    name: order ? `${order.firstName} ${order.lastName}`.trim() : 'Kunde',
    street: order?.billingStreet || 'Musterstrasse 1',
    postalCode: order?.billingPostalCode || '1234',
    city: order?.billingCity || 'Musterstadt',
    country: order?.billingCountry || 'CH',
  })
  const reference = invoice.qrReference || buildSwissQrPaymentReference(invoice.orderId, settings.referenceType)
  const account = selectPaymentAccount(settings)

  validateSwissQrInput({ account, referenceType: settings.referenceType, reference, creditor, debtor, amount: invoice.amount })

  const payload = invoice.swissQrPayload || buildSwissQrBillPayload(settings, {
    orderNumber: invoice.orderNumber,
    totalAmount: invoice.amount,
    currency: 'CHF',
    customerName: debtor.name,
    customerStreet: debtor.streetLine,
    customerPostalCode: debtor.postalCode,
    customerCity: debtor.city,
    customerCountry: debtor.country,
  }, reference)

  return { creditor, debtor, reference, account, payload }
}

export function buildSwissQrBillPayload(settings: InvoiceSettings, order: SwissQrOrderPayload, reference: string | null) {
  const account = selectPaymentAccount(settings)
  const creditor = normalizeParty({
    name: settings.accountHolder || settings.companyName,
    street: `${settings.street} ${settings.houseNumber}`.trim(),
    postalCode: settings.postalCode,
    city: settings.city,
    country: settings.country || 'CH',
  })
  const debtor = normalizeParty({
    name: order.customerName || '',
    street: order.customerStreet || '',
    postalCode: order.customerPostalCode || '',
    city: order.customerCity || '',
    country: order.customerCountry || 'CH',
  }, false)
  const referenceType = settings.referenceType || 'NON'
  const amount = roundChf(order.totalAmount).toFixed(2)

  validateSwissQrInput({ account, referenceType, reference, creditor, debtor, amount: order.totalAmount })

  return [
    'SPC',
    '0200',
    '1',
    account,
    'K',
    creditor.name,
    creditor.streetLine,
    '',
    creditor.postalCode,
    creditor.city,
    creditor.country,
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    amount,
    'CHF',
    debtor.name ? 'K' : '',
    debtor.name,
    debtor.streetLine,
    '',
    debtor.postalCode,
    debtor.city,
    debtor.country,
    referenceType,
    reference || '',
    `Bestellung ${order.orderNumber}`,
    'EPD',
  ].join('\n')
}

export function buildSwissQrPaymentReference(seed: number, type: ReferenceType) {
  if (type === 'NON') return null
  if (type === 'SCOR') return buildCreditorReference(seed)
  const base = String(Math.max(1, seed)).padStart(26, '0')
  return `${base}${mod10Recursive(base)}`
}

export function roundChf(value: number) {
  return Math.round(normalizeMoneyAmount(value) * 20) / 20
}

function selectPaymentAccount(settings: InvoiceSettings) {
  const account = settings.referenceType === 'QRR' ? settings.qrIban : settings.iban
  return normalizeIban(account)
}

function validateSwissQrInput(input: {
  account: string
  referenceType: ReferenceType
  reference: string | null
  creditor: ReturnType<typeof normalizeParty>
  debtor: ReturnType<typeof normalizeParty>
  amount: number
}) {
  if (!isValidIban(input.account)) throw new Error('Ungueltige IBAN fuer Swiss QR-Bill.')
  if (input.referenceType === 'QRR' && !isValidQrIban(input.account)) throw new Error('QRR-Zahlungen benoetigen eine gueltige Schweizer QR-IBAN.')
  if (input.referenceType === 'QRR' && !isValidQrReference(input.reference || '')) throw new Error('Ungueltige QR-Referenznummer.')
  if (input.referenceType === 'SCOR' && !isValidCreditorReference(input.reference || '')) throw new Error('Ungueltige Creditor Reference.')
  if (!input.creditor.name || !input.creditor.postalCode || !input.creditor.city) throw new Error('Zahlungsempfaenger ist unvollstaendig.')
  if (!Number.isFinite(input.amount) || input.amount <= 0) throw new Error('Rechnungsbetrag ist ungueltig.')
  if (input.debtor.postalCode && !/^[0-9A-Z -]{3,10}$/i.test(input.debtor.postalCode)) throw new Error('Postleitzahl des Zahlers ist ungueltig.')
}

function normalizeParty(party: SwissQrParty | { name?: string; street?: string; postalCode?: string; city?: string; country?: string }, required = true) {
  const name = sanitizeQrText(party.name || '')
  const streetLine = sanitizeQrText(party.street || '')
  const postalCode = sanitizeQrText(party.postalCode || '')
  const city = sanitizeQrText(party.city || '')
  const country = sanitizeQrText((party.country || 'CH').toUpperCase()).slice(0, 2)
  if (required && (!name || !streetLine || !postalCode || !city || !country)) throw new Error('Swiss QR-Bill Adressdaten sind unvollstaendig.')
  return { name, streetLine, postalCode, city, country }
}

function normalizeIban(value?: string | null) {
  return String(value || '').replace(/\s+/g, '').toUpperCase()
}

function isValidIban(value: string) {
  const iban = normalizeIban(value)
  if (!/^[A-Z]{2}[0-9]{2}[0-9A-Z]{11,30}$/.test(iban)) return false
  const rearranged = `${iban.slice(4)}${iban.slice(0, 4)}`
  return mod97(rearranged.replace(/[A-Z]/g, (char) => String(char.charCodeAt(0) - 55))) === 1
}

function isValidQrIban(value: string) {
  const iban = normalizeIban(value)
  if (!/^(CH|LI)/.test(iban) || !isValidIban(iban)) return false
  const iid = Number(iban.slice(4, 9))
  return iid >= 30000 && iid <= 31999
}

function isValidQrReference(value: string) {
  const digits = String(value || '').replace(/\s+/g, '')
  return /^[0-9]{27}$/.test(digits) && Number(digits[26]) === mod10Recursive(digits.slice(0, 26))
}

function isValidCreditorReference(value: string) {
  const reference = String(value || '').replace(/\s+/g, '').toUpperCase()
  if (!/^RF[0-9]{2}[A-Z0-9]{1,21}$/.test(reference)) return false
  return mod97(`${reference.slice(4)}${reference.slice(0, 4)}`.replace(/[A-Z]/g, (char) => String(char.charCodeAt(0) - 55))) === 1
}

function buildCreditorReference(seed: number) {
  const base = `MK${String(Math.max(1, seed)).padStart(10, '0')}`
  const numeric = `${base}RF00`.toUpperCase().replace(/[A-Z]/g, (char) => String(char.charCodeAt(0) - 55))
  return `RF${String(98 - mod97(numeric)).padStart(2, '0')}${base}`
}

function mod97(value: string) {
  let remainder = 0
  for (const digit of value) remainder = (remainder * 10 + Number(digit)) % 97
  return remainder
}

function mod10Recursive(value: string) {
  const table = [0, 9, 4, 6, 8, 2, 7, 1, 3, 5]
  let carry = 0
  for (const char of value) carry = table[(carry + Number(char)) % 10]
  return (10 - carry) % 10
}

function drawSwissQrCode(content: string[], payload: string, xMm: number, topMm: number, sizeMm: number) {
  const matrix = createQrMatrix(payload)
  const quietZone = 4
  const cells = matrix.size + quietZone * 2
  const cell = (sizeMm * MM) / cells
  const x = xMm * MM
  const y = A4_HEIGHT - (topMm + sizeMm) * MM

  content.push('0 g')
  matrix.data.forEach((filled, index) => {
    if (!filled) return
    const row = Math.floor(index / matrix.size)
    const col = index % matrix.size
    const drawX = x + (col + quietZone) * cell
    const drawY = y + sizeMm * MM - (row + quietZone + 1) * cell
    content.push(`${drawX.toFixed(2)} ${drawY.toFixed(2)} ${cell.toFixed(2)} ${cell.toFixed(2)} re f`)
  })

  const crossSize = sizeMm * MM * 0.17
  const crossX = x + (sizeMm * MM) / 2 - crossSize / 2
  const crossY = y + (sizeMm * MM) / 2 - crossSize / 2
  content.push(`1 g ${crossX.toFixed(2)} ${crossY.toFixed(2)} ${crossSize.toFixed(2)} ${crossSize.toFixed(2)} re f 0 g`)
  content.push(`${(crossX + crossSize * 0.42).toFixed(2)} ${(crossY + crossSize * 0.18).toFixed(2)} ${(crossSize * 0.16).toFixed(2)} ${(crossSize * 0.64).toFixed(2)} re f`)
  content.push(`${(crossX + crossSize * 0.18).toFixed(2)} ${(crossY + crossSize * 0.42).toFixed(2)} ${(crossSize * 0.64).toFixed(2)} ${(crossSize * 0.16).toFixed(2)} re f`)
}

function buildPdf(objects: PdfObject[]) {
  const chunks: Buffer[] = [Buffer.from('%PDF-1.4\n', 'ascii')]
  const offsets = [0]
  objects.forEach((object, index) => {
    offsets[index + 1] = Buffer.concat(chunks).length
    chunks.push(Buffer.from(`${index + 1} 0 obj\n`, 'ascii'))
    chunks.push(Buffer.isBuffer(object) ? object : Buffer.from(object, 'utf8'))
    chunks.push(Buffer.from('\nendobj\n', 'ascii'))
  })
  const xrefOffset = Buffer.concat(chunks).length
  chunks.push(Buffer.from(`xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`, 'ascii'))
  for (let index = 1; index <= objects.length; index += 1) {
    chunks.push(Buffer.from(`${String(offsets[index]).padStart(10, '0')} 00000 n \n`, 'ascii'))
  }
  chunks.push(Buffer.from(`trailer << /Root 1 0 R /Size ${objects.length + 1} >>\nstartxref\n${xrefOffset}\n%%EOF\n`, 'ascii'))
  return Buffer.concat(chunks)
}

function makeStream(content: string) {
  const stream = Buffer.from(content, 'utf8')
  return Buffer.concat([
    Buffer.from(`<< /Length ${stream.length} >>\nstream\n`, 'ascii'),
    stream,
    Buffer.from('\nendstream', 'ascii'),
  ])
}

function amountOnly(value: number) {
  return new Intl.NumberFormat('de-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(roundChf(value))
}

function formatDate(value?: string | null) {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('de-CH')
}

function formatReference(value: string | null) {
  const reference = String(value || '').replace(/\s+/g, '')
  if (!reference) return ''
  return reference.replace(/(.{5})/g, '$1 ').trim()
}

function clipText(value: string, max: number) {
  const clean = sanitizeQrText(value)
  return clean.length > max ? `${clean.slice(0, max - 3)}...` : clean
}

function sanitizeQrText(value: string) {
  return String(value || '')
    .replace(/[ä]/g, 'ae')
    .replace(/[ö]/g, 'oe')
    .replace(/[ü]/g, 'ue')
    .replace(/[Ä]/g, 'Ae')
    .replace(/[Ö]/g, 'Oe')
    .replace(/[Ü]/g, 'Ue')
    .replace(/[ß]/g, 'ss')
    .replace(/[^\x20-\x7E]/g, '')
    .trim()
}

function escapePdf(value: string) {
  return sanitizeQrText(value).replace(/[()\\]/g, '\\$&')
}
