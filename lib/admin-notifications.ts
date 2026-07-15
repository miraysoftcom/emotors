import { getCustomerRequests } from '@/lib/customer-request-store'
import { getStoredOrders } from '@/lib/orders-store'
import { getStoredReviews } from '@/lib/reviews-store'

export type AdminNotification = {
  id: string
  type: 'order' | 'request' | 'review'
  title: string
  message: string
  href: string
  priority: 'normal' | 'high'
  createdAt: string
}

const requestTypeLabels: Record<string, string> = {
  warranty: 'Garantieanfrage',
  service: 'Serviceanfrage',
  return: 'Retourenanfrage',
  trade_in: 'Secondhand / Tausch',
  estimate: 'Kostenvoranschlag',
  coupon: 'Coupon-Anfrage',
  newsletter: 'Newsletter',
  review: 'Bewertung',
}

export function getAdminNotifications() {
  const orderNotifications: AdminNotification[] = getStoredOrders().slice(0, 12).map((order) => ({
    id: `order:${order.id}:${order.updatedAt || order.createdAt}`,
    type: 'order',
    title: `Neue Bestellung ${order.orderNumber}`,
    message: `${[order.firstName, order.lastName].filter(Boolean).join(' ') || order.email} - ${order.currency} ${Number(order.totalAmount || 0).toLocaleString('de-CH')}`,
    href: '/admin/orders',
    priority: 'high',
    createdAt: order.createdAt,
  }))

  const requestNotifications: AdminNotification[] = getCustomerRequests().slice(0, 16).map((request) => ({
    id: `request:${request.id}:${request.updatedAt || request.createdAt}`,
    type: 'request',
    title: requestTypeLabels[request.type] || 'Neue Anfrage',
    message: `${request.subject}${request.name ? ` - ${request.name}` : ''}`,
    href: request.type === 'coupon' ? '/admin/coupons' : request.type === 'estimate' ? '/admin/customer-requests' : '/admin/messages',
    priority: request.status === 'new' ? 'high' : 'normal',
    createdAt: request.createdAt,
  }))

  const reviewNotifications: AdminNotification[] = getStoredReviews()
    .filter((review) => !review.approved && review.status === 'pending')
    .slice(0, 8)
    .map((review) => ({
      id: `review:${review.id}:${review.updatedAt || review.createdAt}`,
      type: 'review',
      title: 'Neue Produktbewertung',
      message: `${review.customerName}: ${review.title}`,
      href: '/admin/reviews',
      priority: 'normal',
      createdAt: review.createdAt,
    }))

  const notifications = [...orderNotifications, ...requestNotifications, ...reviewNotifications]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 24)

  return {
    notifications,
    counts: {
      total: notifications.length,
      high: notifications.filter((item) => item.priority === 'high').length,
      orders: orderNotifications.length,
      requests: requestNotifications.filter((item) => item.priority === 'high').length,
      reviews: reviewNotifications.length,
    },
    generatedAt: new Date().toISOString(),
  }
}
