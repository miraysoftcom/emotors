'use client'

import { useState } from 'react'
import { Download, Mail, PackageCheck, Truck } from 'lucide-react'
import { formatMoney } from '@/lib/money'
import type { StoredOrder } from '@/lib/orders-store'

export function OrderSummaryView({ order, email }: { order: StoredOrder; email: string }) {
  const [message, setMessage] = useState<{ type: 'success' | 'error' | ''; text: string }>({ type: '', text: '' })
  const [loading, setLoading] = useState('')

  const downloadInvoice = async () => {
    setLoading('invoice')
    setMessage({ type: '', text: '' })
    try {
      const response = await fetch(`/api/orders/invoice?orderNumber=${encodeURIComponent(order.orderNumber)}&email=${encodeURIComponent(email)}`)
      const contentType = response.headers.get('content-type') || ''
      if (!response.ok || !contentType.toLowerCase().includes('application/pdf')) {
        const text = await response.text().catch(() => '')
        setMessage({ type: 'error', text: extractInvoiceDownloadError(text) })
        return
      }
      const blob = await response.blob()
      if (blob.size < 100) {
        setMessage({ type: 'error', text: 'Die PDF-Datei konnte nicht korrekt erstellt werden. Bitte versuchen Sie es erneut.' })
        return
      }
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `Rechnung-${order.invoiceNumber || order.orderNumber}.pdf`
      link.click()
      window.URL.revokeObjectURL(url)
    } catch {
      setMessage({ type: 'error', text: 'Die Rechnung konnte nicht heruntergeladen werden. Bitte versuchen Sie es erneut.' })
    } finally {
      setLoading('')
    }
  }

  const resendConfirmation = async () => {
    setLoading('email')
    setMessage({ type: '', text: '' })
    const response = await fetch('/api/orders/resend-confirmation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderNumber: order.orderNumber, email }),
    })
    const data = await response.json()
    setMessage({
      type: response.ok ? 'success' : 'error',
      text: data.message || data.error || 'Die Bestellbestätigung konnte nicht gesendet werden.',
    })
    setLoading('')
  }

  return (
    <div className="space-y-6">
      {message.text && (
        <div className={`rounded-lg border p-4 text-sm ${message.type === 'success' ? 'status-success' : 'status-error'}`}>
          {message.text}
        </div>
      )}

      <section className="theme-card p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Bestellnummer</p>
            <h2 className="text-2xl font-black">{order.orderNumber}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Bestellt am {new Date(order.createdAt).toLocaleString('de-CH')}
            </p>
          </div>
          <div className="grid gap-2 text-sm sm:grid-cols-2 md:text-right">
            <Badge label="Status" value={order.status} tone="info" />
            <Badge label="Zahlung" value={order.paymentStatus} tone={order.paymentStatus === 'Bezahlt' ? 'success' : 'warning'} />
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="theme-card p-5">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-bold">
            <PackageCheck className="h-5 w-5 text-accent" />
            Produkte
          </h3>
          <div className="space-y-3">
            {(order.items || []).length > 0 ? order.items?.map((item) => (
              <div key={`${item.productId}-${item.name}`} className="grid grid-cols-[1fr_auto] gap-4 rounded-lg border border-border bg-secondary/40 p-4">
                <div>
                  <p className="font-bold">{item.name}</p>
                  <p className="text-sm text-muted-foreground">Menge: {item.quantity} · Einzelpreis {formatMoney(item.price)}</p>
                </div>
                <p className="font-bold">{formatMoney(item.price * item.quantity)}</p>
              </div>
            )) : (
              <p className="text-muted-foreground">Keine Produktdetails gespeichert.</p>
            )}
          </div>
        </div>

        <aside className="theme-card p-5">
          <h3 className="mb-4 text-lg font-bold">Zusammenfassung</h3>
          <div className="space-y-3 text-sm">
            <Row label="Zwischensumme" value={formatMoney(order.subtotal)} />
            <Row label="Versand" value={formatMoney(order.shippingCost)} />
            {order.tax > 0 && <Row label="MwSt." value={formatMoney(order.tax)} />}
            <div className="border-t border-border pt-3">
              <Row label="Gesamt" value={formatMoney(order.totalAmount, order.currency)} strong />
            </div>
            <Row label="Zahlungsart" value={order.paymentMethod} />
          </div>
        </aside>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="theme-card p-5">
          <h3 className="mb-3 text-lg font-bold">Adresse</h3>
          <p className="text-sm text-muted-foreground">
            {order.firstName} {order.lastName}<br />
            {order.billingStreet}<br />
            {order.billingPostalCode} {order.billingCity}<br />
            {order.billingCountry}
          </p>
        </div>
        <div className="theme-card p-5">
          <h3 className="mb-3 flex items-center gap-2 text-lg font-bold">
            <Truck className="h-5 w-5 text-accent" />
            Versand & Tracking
          </h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <Row label="Versandstatus" value={order.shippingStatus || order.status} />
            <Row label="Dienstleister" value={order.shippingCarrier || '-'} />
            <Row label="Sendungsnummer" value={order.trackingNumber || '-'} />
            {order.estimatedDeliveryDate && <Row label="Voraussichtlich" value={new Date(order.estimatedDeliveryDate).toLocaleDateString('de-CH')} />}
            {order.trackingUrl && (
              <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer" className="inline-flex font-semibold text-accent hover:underline">
                Sendung verfolgen
              </a>
            )}
          </div>
        </div>
      </section>

      <section className="theme-card p-5">
        <h3 className="mb-5 text-lg font-bold">Bestellverlauf</h3>
        <div className="space-y-4">
          {(order.statusHistory || []).map((entry, index) => (
            <div key={`${entry.status}-${entry.date}-${index}`} className="relative border-l border-border pl-5">
              <span className="absolute -left-[7px] top-1 h-3 w-3 rounded-full bg-accent" />
              <p className="font-bold">{entry.status}</p>
              <p className="text-sm text-muted-foreground">{new Date(entry.date).toLocaleString('de-CH')}</p>
              <p className="mt-1 text-sm text-muted-foreground">{entry.description}</p>
              {entry.trackingNumber && <p className="mt-1 text-sm text-muted-foreground">Tracking: {entry.trackingNumber}</p>}
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3 sm:flex-row">
        <button onClick={downloadInvoice} disabled={loading === 'invoice'} className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-accent px-5 py-3 font-bold text-accent-foreground disabled:opacity-60">
          <Download className="h-5 w-5" />
          {loading === 'invoice' ? 'Wird vorbereitet...' : 'Rechnung herunterladen'}
        </button>
        <button onClick={resendConfirmation} disabled={loading === 'email'} className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-border bg-secondary px-5 py-3 font-bold hover:bg-surface-hover disabled:opacity-60">
          <Mail className="h-5 w-5" />
          {loading === 'email' ? 'Wird gesendet...' : 'Bestätigung erneut senden'}
        </button>
      </section>
    </div>
  )
}

function extractInvoiceDownloadError(text: string) {
  if (!text) return 'Die Rechnung ist derzeit noch nicht verfügbar. Bitte versuchen Sie es später erneut.'
  try {
    const data = JSON.parse(text) as { error?: string; message?: string }
    return data.error || data.message || 'Die Rechnung ist derzeit noch nicht verfügbar. Bitte versuchen Sie es später erneut.'
  } catch {
    return text.includes('<!DOCTYPE') || text.includes('<html')
      ? 'Die Rechnung ist derzeit noch nicht verfügbar. Bitte versuchen Sie es später erneut.'
      : text
  }
}

function Badge({ label, value, tone }: { label: string; value: string; tone: 'success' | 'warning' | 'info' }) {
  const toneClass = tone === 'success' ? 'status-success' : tone === 'warning' ? 'status-warning' : 'status-info'
  return (
    <div>
      <p className="mb-1 text-xs text-muted-foreground">{label}</p>
      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${toneClass}`}>{value}</span>
    </div>
  )
}

function Row({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex justify-between gap-4 ${strong ? 'text-lg font-black' : ''}`}>
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-semibold text-foreground">{value}</span>
    </div>
  )
}
