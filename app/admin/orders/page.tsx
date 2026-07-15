'use client'

import { Fragment, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Eye, Loader, Save, FileText } from 'lucide-react'
import { formatMoney } from '@/lib/money'
import { HtmlEditor } from '@/components/admin/HtmlEditor'

interface Order {
  id: number
  orderNumber: string
  customerId?: number
  firstName?: string
  lastName?: string
  email?: string
  totalPrice?: number
  totalAmount?: number
  status: string
  paymentStatus: string
  invoiceNumber?: string | null
  billingStreet?: string
  billingPostalCode?: string
  billingCity?: string
  billingCountry?: string
  paymentMethod?: string
  shippingCost?: number
  tax?: number
  trackingNumber?: string
  trackingUrl?: string
  shippingCarrier?: string
  estimatedDeliveryDate?: string
  shippingStatus?: string
  adminNote?: string
  customerNote?: string
  items?: Array<{ productId: number; name: string; price: number; quantity: number }>
  createdAt: string
}

const paymentStatusOptions = ['Zahlung ausstehend', 'Warten auf Banküberweisung', 'Zahlungsprüfung erforderlich', 'Rechnung offen', 'Bezahlt', 'Fehlgeschlagen', 'Zurückerstattet']
const orderStatusOptions = ['Bestellung eingegangen', 'In Bearbeitung', 'Versandbereit', 'Versendet', 'Zugestellt', 'Storniert', 'Rückerstattet']

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [paymentFilter, setPaymentFilter] = useState('ALL')
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [savingId, setSavingId] = useState<number | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error' | ''; text: string }>({ type: '', text: '' })

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/orders')
      if (res.ok) {
        const data = await res.json()
        setOrders(data.orders || [])
      }
    } catch (error) {
      console.error('[Load Orders Error]', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${order.firstName || ''} ${order.lastName || ''} ${order.email || ''} ${order.customerId || ''}`.toLowerCase().includes(searchTerm.toLowerCase())
    const filterStatus: Record<string, string> = {
      PAID: 'Bezahlt',
      UNPAID: 'Rechnung offen',
      PENDING: 'Zahlung ausstehend',
      REVIEW: 'Zahlungsprüfung erforderlich',
    }
    const matchesPayment = paymentFilter === 'ALL' || order.paymentStatus === filterStatus[paymentFilter]
    return matchesSearch && matchesPayment
  })

  const paymentCounts = {
    ALL: orders.length,
    PAID: orders.filter(o => o.paymentStatus === 'Bezahlt').length,
    UNPAID: orders.filter(o => o.paymentStatus === 'Rechnung offen').length,
    PENDING: orders.filter(o => o.paymentStatus === 'Zahlung ausstehend').length,
    REVIEW: orders.filter(o => o.paymentStatus === 'Zahlungsprüfung erforderlich').length,
  }

  const updateOrder = (id: number, data: Partial<Order>) => {
    setOrders((current) => current.map((order) => order.id === id ? { ...order, ...data } : order))
  }

  const saveOrder = async (order: Order) => {
    setSavingId(order.id)
    setMessage({ type: '', text: '' })
    try {
      const response = await fetch(`/api/admin/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          status: order.status,
          paymentStatus: order.paymentStatus,
          trackingNumber: order.trackingNumber || '',
          trackingUrl: order.trackingUrl || '',
          shippingCarrier: order.shippingCarrier || '',
          estimatedDeliveryDate: order.estimatedDeliveryDate || '',
          shippingStatus: order.shippingStatus || '',
          adminNote: order.adminNote || '',
          customerNote: order.customerNote || '',
          paymentDate: order.paymentStatus === 'Bezahlt' ? new Date().toISOString() : undefined,
        }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        setMessage({ type: 'error', text: data.error || 'Bestellung konnte nicht gespeichert werden.' })
        return
      }
      setMessage({ type: 'success', text: `Bestellung ${order.orderNumber} wurde gespeichert.` })
      await loadOrders()
    } catch (error) {
      setMessage({ type: 'error', text: 'Bestellung konnte nicht gespeichert werden.' })
    } finally {
      setSavingId(null)
    }
  }

  const openInvoice = async (order: Order) => {
    const response = await fetch(`/api/admin/orders/${order.id}/invoice`, {
      method: 'POST',
      credentials: 'include',
    })
    const data = await response.json()
    if (response.ok && data.invoice?.id) {
      window.open(`/api/admin/invoices/${data.invoice.id}/download`, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Bestellungen</h1>
        <p className="text-muted-foreground">Verwalte alle Bestellungen und Zahlungsstatus</p>
      </motion.div>

      <div className="mb-6 flex flex-wrap gap-2">
        {[
          { key: 'ALL', label: `Alle Bestellungen (${paymentCounts.ALL})` },
          { key: 'PAID', label: `Bezahlt (${paymentCounts.PAID})` },
          { key: 'UNPAID', label: `Nicht bezahlt (${paymentCounts.UNPAID})` },
          { key: 'PENDING', label: `Zahlung ausstehend (${paymentCounts.PENDING})` },
          { key: 'REVIEW', label: `Prüfung (${paymentCounts.REVIEW})` },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setPaymentFilter(tab.key)}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              paymentFilter === tab.key
                ? 'bg-accent text-white'
                : 'bg-secondary text-foreground hover:bg-secondary/80'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {message.text && (
        <div className={`mb-6 rounded-lg border p-4 text-sm font-semibold ${message.type === 'success' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200' : 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-200'}`}>
          {message.text}
        </div>
      )}

      <div className="bg-card border border-border rounded-lg p-6">
        <div className="mb-6 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 text-muted-foreground" size={20} />
            <input
              type="text"
              placeholder="Nach Bestellnummer suchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader className="w-6 h-6 animate-spin text-accent" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold">Bestellnummer</th>
                  <th className="text-left py-3 px-4 font-semibold">Kunde</th>
                  <th className="text-left py-3 px-4 font-semibold">Betrag</th>
                  <th className="text-left py-3 px-4 font-semibold">Zahlungsstatus</th>
                  <th className="text-left py-3 px-4 font-semibold">Bestellstatus</th>
                    <th className="text-left py-3 px-4 font-semibold">Zahlungsart</th>
                    <th className="text-left py-3 px-4 font-semibold">Datum</th>
                  <th className="text-right py-3 px-4 font-semibold">Aktion</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <Fragment key={order.id}>
                  <tr className="border-b border-border hover:bg-secondary/50">
                    <td className="py-3 px-4 font-semibold">
                      {order.orderNumber}
                      {order.invoiceNumber && <div className="text-xs text-muted-foreground">Rechnung {order.invoiceNumber}</div>}
                    </td>
                    <td className="py-3 px-4">
                      {order.firstName || order.lastName ? `${order.firstName || ''} ${order.lastName || ''}`.trim() : `Kunde #${order.customerId || '-'}`}
                      <div className="text-xs text-muted-foreground">{order.email}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold">{formatMoney(order.totalAmount ?? order.totalPrice ?? 0)}</div>
                      <div className="text-xs text-muted-foreground">
                        {order.tax > 0 ? `MwSt. ${formatMoney(order.tax)} / ` : ''}Versand {formatMoney(order.shippingCost || 0)}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={order.paymentStatus}
                        onChange={(event) => updateOrder(order.id, { paymentStatus: event.target.value })}
                        className={`rounded-lg px-2 py-1 text-xs font-semibold ${
                          order.paymentStatus === 'Bezahlt' ? 'status-success' :
                          order.paymentStatus === 'Fehlgeschlagen' ? 'status-error' :
                          order.paymentStatus === 'Zahlung ausstehend' || order.paymentStatus === 'Zahlungsprüfung erforderlich' ? 'status-warning' :
                          'status-info'
                        }`}>
                        {paymentStatusOptions.map((status) => <option key={status}>{status}</option>)}
                      </select>
                    </td>
                    <td className="py-3 px-4">
                      <select value={order.status} onChange={(event) => updateOrder(order.id, { status: event.target.value })} className="status-info rounded-lg px-2 py-1 text-xs font-semibold">
                        {orderStatusOptions.map((status) => <option key={status}>{status}</option>)}
                      </select>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{order.paymentMethod || '-'}</td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString('de-DE')}
                    </td>
                    <td className="py-3 px-4 flex justify-end gap-2">
                      <button onClick={() => setExpandedId(expandedId === order.id ? null : order.id)} className="p-2 hover:bg-secondary rounded-lg transition-colors" title="Details">
                        <Eye size={16} />
                      </button>
                      <button onClick={() => saveOrder(order)} disabled={savingId === order.id} className="p-2 hover:bg-secondary rounded-lg transition-colors" title="Speichern">
                        {savingId === order.id ? <Loader size={16} className="animate-spin" /> : <Save size={16} />}
                      </button>
                    </td>
                  </tr>
                  {expandedId === order.id && (
                    <tr className="border-b border-border bg-secondary/30">
                      <td colSpan={8} className="px-4 py-5">
                        <div className="grid gap-5 lg:grid-cols-3">
                          <div>
                            <h3 className="mb-2 font-semibold">Produkte</h3>
                            {(order.items || []).length > 0 ? order.items?.map((item) => (
                              <div key={`${order.id}-${item.productId}-${item.name}`} className="flex justify-between border-b border-border/50 py-2 text-sm">
                                <span>{item.quantity}x {item.name}</span>
                                <span>{formatMoney(item.price * item.quantity)}</span>
                              </div>
                            )) : <p className="text-sm text-muted-foreground">Keine Produktdetails gespeichert.</p>}
                          </div>
                          <div>
                            <h3 className="mb-2 font-semibold">Adresse</h3>
                            <p className="text-sm text-muted-foreground">
                              {order.billingStreet}<br />
                              {order.billingPostalCode} {order.billingCity}<br />
                              {order.billingCountry}
                            </p>
                            <input
                              value={order.shippingCarrier || ''}
                              onChange={(event) => updateOrder(order.id, { shippingCarrier: event.target.value })}
                              placeholder="Versanddienstleister"
                              className="mt-3 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                            />
                            <input
                              value={order.trackingNumber || ''}
                              onChange={(event) => updateOrder(order.id, { trackingNumber: event.target.value })}
                              placeholder="Sendungsnummer"
                              className="mt-3 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                            />
                            <input
                              value={order.trackingUrl || ''}
                              onChange={(event) => updateOrder(order.id, { trackingUrl: event.target.value })}
                              placeholder="Tracking-URL"
                              className="mt-3 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                            />
                            <input
                              type="date"
                              value={order.estimatedDeliveryDate || ''}
                              onChange={(event) => updateOrder(order.id, { estimatedDeliveryDate: event.target.value })}
                              className="mt-3 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                            />
                          </div>
                          <div>
                            <h3 className="mb-2 font-semibold">Admin Notiz</h3>
                            <HtmlEditor
                              value={order.adminNote || ''}
                              onChange={(adminNote) => updateOrder(order.id, { adminNote })}
                              minHeightClassName="min-h-36"
                            />
                            <div className="mt-3">
                            <HtmlEditor
                              label="Kundennotiz"
                              value={order.customerNote || ''}
                              onChange={(customerNote) => updateOrder(order.id, { customerNote })}
                              minHeightClassName="min-h-32"
                            />
                            </div>
                            <button
                              onClick={() => openInvoice(order)}
                              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-bold hover:border-accent"
                            >
                              <FileText size={16} />
                              Rechnung anzeigen
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && filteredOrders.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            Keine Bestellungen gefunden
          </div>
        )}
      </div>
    </div>
  )
}
