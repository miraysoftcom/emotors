import fs from 'fs'
import path from 'path'
import { fallbackTaxSettings, type TaxRateConfig, type TaxRateKind, type TaxSettings } from '@/lib/tax-calculation'

const STORE_FILE = path.join(process.cwd(), '.data', 'tax-settings.json')

export type { PriceDisplayMode, TaxCalculationLine, TaxCalculationResult, TaxRateConfig, TaxRateKind, TaxSettings } from '@/lib/tax-calculation'
export { calculateOrderTax, getDefaultTaxRate, roundMoney } from '@/lib/tax-calculation'

export const defaultTaxSettings: TaxSettings = fallbackTaxSettings

function ensureStore() {
  const dir = path.dirname(STORE_FILE)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  if (!fs.existsSync(STORE_FILE)) fs.writeFileSync(STORE_FILE, JSON.stringify(defaultTaxSettings, null, 2))
}

export function getTaxSettings() {
  ensureStore()
  try {
    const stored = JSON.parse(fs.readFileSync(STORE_FILE, 'utf-8'))
    return {
      ...defaultTaxSettings,
      ...stored,
      rates: mergeRates(stored.rates || defaultTaxSettings.rates),
    } as TaxSettings
  } catch {
    return defaultTaxSettings
  }
}

export function saveTaxSettings(settings: TaxSettings) {
  const next = validateTaxSettings({
    ...settings,
    updatedAt: new Date().toISOString(),
    rates: mergeRates(settings.rates),
  })
  ensureStore()
  fs.writeFileSync(STORE_FILE, JSON.stringify(next, null, 2))
  return next
}

function mergeRates(rates: TaxRateConfig[]) {
  return defaultTaxSettings.rates.map((fallback) => ({
    ...fallback,
    ...(rates.find((rate) => rate.id === fallback.id) || {}),
  }))
}

export function validateTaxSettings(settings: TaxSettings) {
  if (!['inclusive', 'exclusive'].includes(settings.priceDisplay)) {
    throw new Error('Die Preisdarstellung ist ungültig.')
  }
  const activeDefault = settings.rates.find((rate) => rate.active && rate.isDefault)
  if (settings.enabled && !activeDefault) {
    throw new Error('Bitte aktivieren Sie einen Standard-MWST-Satz.')
  }
  for (const rate of settings.rates) {
    if (rate.percentage < 0 || rate.percentage > 100) {
      throw new Error(`Der MWST-Satz "${rate.label}" ist ungültig.`)
    }
  }
  if (!settings.rates.find((rate) => rate.id === settings.shippingRateId)) {
    settings.shippingRateId = 'standard' as TaxRateKind
  }
  return settings
}
