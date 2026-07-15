import { normalizeMoneyAmount } from '@/lib/money'

export type PriceDisplayMode = 'inclusive' | 'exclusive'
export type TaxRateKind = 'standard' | 'reduced' | 'special' | 'exempt' | 'zero' | 'custom'

export interface TaxRateConfig {
  id: TaxRateKind
  label: string
  percentage: number
  active: boolean
  validFrom: string
  validUntil: string
  description: string
  isDefault: boolean
}

export interface TaxSettings {
  enabled: boolean
  priceDisplay: PriceDisplayMode
  uidNumber: string
  exemptionText: string
  shippingTaxable: boolean
  shippingRateId: TaxRateKind
  rates: TaxRateConfig[]
  updatedAt: string
}

export interface TaxCalculationLine {
  rateId: string
  label: string
  percentage: number
  net: number
  tax: number
  gross: number
}

export interface TaxCalculationResult {
  enabled: boolean
  priceDisplay: PriceDisplayMode
  net: number
  tax: number
  gross: number
  lines: TaxCalculationLine[]
  exemptionText?: string
  uidNumber?: string
}

const today = new Date().toISOString().slice(0, 10)

export const fallbackTaxSettings: TaxSettings = {
  enabled: true,
  priceDisplay: 'exclusive',
  uidNumber: '',
  exemptionText: 'Nicht mehrwertsteuerpflichtig.',
  shippingTaxable: true,
  shippingRateId: 'standard',
  updatedAt: new Date().toISOString(),
  rates: [
    { id: 'standard', label: 'Standardsteuersatz', percentage: 8.1, active: true, validFrom: today, validUntil: '', description: 'Schweizer Normalsatz', isDefault: true },
    { id: 'reduced', label: 'Reduzierter Steuersatz', percentage: 2.6, active: true, validFrom: today, validUntil: '', description: 'Reduzierter Satz', isDefault: false },
    { id: 'special', label: 'Sondersatz', percentage: 3.8, active: false, validFrom: today, validUntil: '', description: 'Sondersatz', isDefault: false },
    { id: 'exempt', label: 'Steuerbefreit', percentage: 0, active: true, validFrom: today, validUntil: '', description: 'Steuerbefreit', isDefault: false },
    { id: 'zero', label: 'Nullsteuersatz', percentage: 0, active: true, validFrom: today, validUntil: '', description: 'Nullsteuersatz', isDefault: false },
  ],
}

export function getDefaultTaxRate(settings: TaxSettings) {
  return settings.rates.find((rate) => rate.active && rate.isDefault) || settings.rates.find((rate) => rate.id === 'standard') || settings.rates[0]
}

export function calculateOrderTax(input: {
  items: Array<{ price: number; quantity: number; taxRateId?: TaxRateKind | string | null; taxPercentage?: number | null }>
  shippingCost?: number
  discountAmount?: number
  settings?: TaxSettings
}): TaxCalculationResult {
  const settings = input.settings || fallbackTaxSettings
  const discountAmount = normalizeMoneyAmount(input.discountAmount || 0)
  const rawSubtotal = input.items.reduce((sum, item) => sum + normalizeMoneyAmount(item.price) * item.quantity, 0)
  const discountRatio = rawSubtotal > 0 ? Math.min(discountAmount / rawSubtotal, 1) : 0

  if (!settings.enabled) {
    const gross = roundMoney(rawSubtotal - discountAmount + normalizeMoneyAmount(input.shippingCost || 0))
    return {
      enabled: false,
      priceDisplay: settings.priceDisplay,
      net: gross,
      tax: 0,
      gross,
      lines: [],
      exemptionText: settings.exemptionText,
      uidNumber: settings.uidNumber,
    }
  }

  const lineMap = new Map<string, TaxCalculationLine>()
  const defaultRate = getDefaultTaxRate(settings)

  function addAmount(amount: number, rate: TaxRateConfig) {
    const gross = normalizeMoneyAmount(amount)
    const tax = settings.priceDisplay === 'inclusive'
      ? gross - gross / (1 + rate.percentage / 100)
      : gross * (rate.percentage / 100)
    const net = settings.priceDisplay === 'inclusive' ? gross - tax : gross
    const totalGross = settings.priceDisplay === 'inclusive' ? gross : gross + tax
    const existing = lineMap.get(rate.id) || { rateId: rate.id, label: rate.label, percentage: rate.percentage, net: 0, tax: 0, gross: 0 }
    existing.net = roundMoney(existing.net + net)
    existing.tax = roundMoney(existing.tax + tax)
    existing.gross = roundMoney(existing.gross + totalGross)
    lineMap.set(rate.id, existing)
  }

  for (const item of input.items) {
    const rate = item.taxPercentage != null
      ? { ...defaultRate, id: 'custom' as TaxRateKind, label: 'Individueller MWST-Satz', percentage: Number(item.taxPercentage) }
      : settings.rates.find((candidate) => candidate.id === item.taxRateId && candidate.active) || defaultRate
    addAmount(normalizeMoneyAmount(item.price) * item.quantity * (1 - discountRatio), rate)
  }

  const shippingCost = normalizeMoneyAmount(input.shippingCost || 0)
  if (shippingCost > 0) {
    const shippingRate = settings.rates.find((rate) => rate.id === settings.shippingRateId && rate.active) || defaultRate
    addAmount(shippingCost, settings.shippingTaxable ? shippingRate : { ...shippingRate, id: 'zero', label: 'Versand steuerfrei', percentage: 0 })
  }

  const lines = Array.from(lineMap.values())
  return {
    enabled: true,
    priceDisplay: settings.priceDisplay,
    net: roundMoney(lines.reduce((sum, line) => sum + line.net, 0)),
    tax: roundMoney(lines.reduce((sum, line) => sum + line.tax, 0)),
    gross: roundMoney(lines.reduce((sum, line) => sum + line.gross, 0)),
    lines,
    uidNumber: settings.uidNumber,
  }
}

export function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100
}
