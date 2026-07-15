import { normalizeMoneyAmount } from '@/lib/money'

export const LOYALTY_POINTS_PER_CHF = 100

export function loyaltyPointsToChf(points?: number | null) {
  return Math.floor(Number(points || 0)) / LOYALTY_POINTS_PER_CHF
}

export function chfToLoyaltyPoints(amount?: number | null) {
  return Math.floor(normalizeMoneyAmount(amount) * LOYALTY_POINTS_PER_CHF)
}

export function calculateCustomerLoyaltyPoints(totalSpend?: number | null, orderCount = 0) {
  const spendPoints = Math.floor(normalizeMoneyAmount(totalSpend) / 50)
  return spendPoints + orderCount * 25
}
