import { getCustomerOrders } from '@/lib/customer-account-store'

const excludedOrderStatuses = new Set(['storniert', 'rueckerstattet', 'rückerstattet', 'cancelled', 'canceled', 'refunded'])

export function formatReviewCustomerName(input: {
  firstName?: string | null
  lastName?: string | null
  name?: string | null
  email?: string | null
}) {
  let firstName = String(input.firstName || '').trim()
  let lastName = String(input.lastName || '').trim()

  if (!firstName && input.name) {
    const [first = '', ...rest] = String(input.name).trim().split(/\s+/).filter(Boolean)
    firstName = first
    lastName = rest.join(' ')
  }

  if (!firstName && input.email) {
    firstName = String(input.email).split('@')[0] || 'Kunde'
  }

  const lastInitial = lastName ? `${lastName.slice(0, 1).toUpperCase()}.` : ''
  return [firstName || 'Kunde', lastInitial].filter(Boolean).join(' ')
}

export function customerPurchasedProduct(input: {
  email?: string | null
  userId?: string | null
  productId: number
}) {
  const email = String(input.email || '').trim().toLowerCase()
  if (!email && !input.userId) return false

  return getCustomerOrders(email, input.userId).some((order) => {
    const status = String(order.status || '').trim().toLowerCase()
    if (excludedOrderStatuses.has(status)) return false
    return (order.items || []).some((item) => Number(item.productId) === input.productId)
  })
}

