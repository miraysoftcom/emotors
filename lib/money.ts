export type CurrencyCode = 'CHF' | 'EUR'

export function normalizeMoneyAmount(value?: number | null) {
  const amount = Number(value || 0)
  // Most storefront prices are stored in major units (CHF 3'190 => 3190).
  // Only very large integer values are treated as minor units to avoid
  // turning cart totals like 19'140 into CHF 191.40.
  return Number.isInteger(amount) && amount >= 100000 ? amount / 100 : amount
}

export function formatMoney(value?: number | null, currency: CurrencyCode = 'CHF', compact = true) {
  const amount = normalizeMoneyAmount(value)
  const hasRappen = Math.round(amount * 100) % 100 !== 0

  const formatted = new Intl.NumberFormat('de-CH', {
    minimumFractionDigits: compact && !hasRappen ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount)

  return compact && !hasRappen
    ? `${currency} ${formatted}.–`
    : `${currency} ${formatted}`
}

export function toMinorUnits(value?: number | null) {
  return Math.round(normalizeMoneyAmount(value) * 100)
}

export function fromMinorUnits(value?: number | null) {
  return Number(value || 0) / 100
}

export function calculateInstallment(total: number, months = 24) {
  if (months <= 0) return 0
  return Math.ceil((normalizeMoneyAmount(total) / months) * 100) / 100
}
