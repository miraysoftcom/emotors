'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { CheckCircle, Download, Mail, Home, Landmark, Smartphone, Receipt } from 'lucide-react'
import Link from 'next/link'
import { formatMoney } from '@/lib/money'
import type { StoredOrder } from '@/lib/orders-store'
import type { ShopSettings } from '@/lib/shop-settings-store'

export const dynamic = 'force-dynamic'

function SuccessContent() {
  const searchParams = useSearchParams()
  const orderNumber = searchParams.get('orderNumber') || 'ORD-UNKNOWN'
  const [order, setOrder] = useState<StoredOrder | null>(null)
  const [settings, setSettings] = useState<ShopSettings | null>(null)
  const [lookupEmail, setLookupEmail] = useState('')
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error' | ''; text: string }>({ type: '', text: '' })
  const [actionLoading, setActionLoading] = useState('')

  useEffect(() => {
    const storedLookup = window.sessionStorage.getItem('lastOrderLookup')
    const parsedLookup = storedLookup ? JSON.parse(storedLookup) as { orderNumber?: string; email?: string } : null
    const email = parsedLookup?.orderNumber === orderNumber ? parsedLookup.email || '' : ''
    setLookupEmail(email)

    if (email) {
      fetch(`/api/orders?orderNumber=${encodeURIComponent(orderNumber)}&email=${encodeURIComponent(email)}`)
        .then((res) => res.ok ? res.json() : null)
        .then((data) => setOrder(data?.order || null))
        .catch(() => setOrder(null))
    }

    fetch('/api/shop/settings')
      .then((res) => res.json())
      .then((data) => setSettings(data))
      .catch(() => setSettings(null))
  }, [orderNumber])

  const paymentMethod = order?.paymentMethod
  const isManualPayment = paymentMethod === 'twint' || paymentMethod === 'bank_transfer' || paymentMethod === 'vorauszahlung' || paymentMethod === 'auf_rechnung'

  const downloadInvoice = async () => {
    if (!lookupEmail) {
      setActionMessage({ type: 'error', text: 'Bitte öffnen Sie Ihre Bestellung über die Bestellprüfung, um die Rechnung sicher herunterzuladen.' })
      return
    }
    setActionLoading('invoice')
    setActionMessage({ type: '', text: '' })
    try {
      const response = await fetch(`/api/orders/invoice?orderNumber=${encodeURIComponent(orderNumber)}&email=${encodeURIComponent(lookupEmail)}`)
      const contentType = response.headers.get('content-type') || ''
      if (!response.ok || !contentType.toLowerCase().includes('application/pdf')) {
        const text = await response.text().catch(() => '')
        setActionMessage({ type: 'error', text: extractInvoiceDownloadError(text) })
        return
      }
      const blob = await response.blob()
      if (blob.size < 100) {
        setActionMessage({ type: 'error', text: 'Die PDF-Datei konnte nicht korrekt erstellt werden. Bitte versuchen Sie es erneut.' })
        return
      }
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `Rechnung-${orderNumber}.pdf`
      link.click()
      window.URL.revokeObjectURL(url)
    } catch {
      setActionMessage({ type: 'error', text: 'Die Rechnung konnte nicht heruntergeladen werden. Bitte versuchen Sie es erneut.' })
    } finally {
      setActionLoading('')
    }
  }

  const resendConfirmation = async () => {
    if (!lookupEmail) {
      setActionMessage({ type: 'error', text: 'Bitte öffnen Sie Ihre Bestellung über die Bestellprüfung, um die Bestätigung erneut zu senden.' })
      return
    }
    setActionLoading('email')
    setActionMessage({ type: '', text: '' })
    const response = await fetch('/api/orders/resend-confirmation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderNumber, email: lookupEmail }),
    })
    const data = await response.json()
    setActionMessage({
      type: response.ok ? 'success' : 'error',
      text: data.message || data.error || 'Die Bestellbestätigung konnte nicht gesendet werden.',
    })
    setActionLoading('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background-secondary to-background flex items-center justify-center px-4 py-10 text-foreground">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="max-w-md w-full"
      >
        <div className="theme-card p-8 text-center">
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
            className="flex justify-center mb-6"
          >
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-success/15 animate-pulse" />
              <CheckCircle size={80} className="text-success relative" />
            </div>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-black text-foreground mb-2"
          >
            Bestellung erfolgreich!
          </motion.h1>

          {/* Message */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-muted-foreground mb-6"
          >
            Vielen Dank für Ihren Einkauf bei MK-eMotors Dornach
          </motion.p>

          {/* Order Number */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="theme-surface rounded-lg p-4 mb-6"
          >
            <p className="text-sm text-muted-foreground mb-1">Bestellnummer</p>
            <p className="text-2xl font-bold text-foreground font-mono">{orderNumber}</p>
          </motion.div>

          {isManualPayment && order && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55 }}
              className="mb-6 rounded-lg border border-warning/30 bg-warning/10 p-4 text-left"
            >
              <h3 className="mb-2 flex items-center gap-2 font-semibold text-foreground">
                {paymentMethod === 'twint' ? <Smartphone size={18} /> : paymentMethod === 'auf_rechnung' ? <Receipt size={18} /> : <Landmark size={18} />}
                Zahlungsinformationen
              </h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p><strong>Status:</strong> {order.paymentStatus}</p>
                <p><strong>Betrag:</strong> {formatMoney(order.totalAmount)}</p>
                <p><strong>Referenz:</strong> {order.orderNumber}</p>
                {paymentMethod === 'twint' && (
                  <>
                    <p><strong>Empfänger:</strong> {settings?.payments.twint.companyName}</p>
                    <p><strong>TWINT Telefon:</strong> {settings?.payments.twint.phone}</p>
                    <p>{settings?.payments.twint.instructions}</p>
                  </>
                )}
                {(paymentMethod === 'bank_transfer' || paymentMethod === 'vorauszahlung') && (
                  <>
                    <p><strong>Bank:</strong> {settings?.payments.bank.bankName}</p>
                    <p><strong>Kontoinhaber:</strong> {settings?.payments.bank.accountHolder}</p>
                    <p><strong>IBAN:</strong> {settings?.payments.bank.iban}</p>
                    {settings?.payments.bank.bic && <p><strong>BIC/SWIFT:</strong> {settings.payments.bank.bic}</p>}
                    <p>{paymentMethod === 'vorauszahlung' ? settings?.payments.methods.find((method) => method.id === 'vorauszahlung')?.instructions : settings?.payments.bank.instructions}</p>
                  </>
                )}
                {paymentMethod === 'auf_rechnung' && (
                  <>
                    <p><strong>Fälligkeit:</strong> {order.invoiceDueDate ? new Date(order.invoiceDueDate).toLocaleDateString('de-CH') : `${settings?.payments.invoice.dueDays || 14} Tage`}</p>
                    <p>{settings?.payments.invoice.instructions}</p>
                  </>
                )}
              </div>
            </motion.div>
          )}

          {/* Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="rounded-lg border border-info/30 bg-info/10 p-4 mb-8 text-left"
          >
            <h3 className="font-semibold text-foreground mb-2">Nächste Schritte:</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>✓ Sie erhalten eine Bestätigungsemail mit Ihren Bestelldetails</li>
              <li>✓ Wir werden Ihre Bestellung verarbeiten und versenden</li>
              <li>✓ Sie erhalten eine Versandbenachrichtigung mit Tracking</li>
            </ul>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="space-y-3"
          >
            {actionMessage.text && (
              <div className={`rounded-lg border p-3 text-left text-sm ${actionMessage.type === 'success' ? 'status-success' : 'status-error'}`}>
                {actionMessage.text}
              </div>
            )}

            {!lookupEmail && (
              <div className="rounded-lg border border-warning/30 bg-warning/10 p-3 text-left text-sm text-muted-foreground">
                Aus Sicherheitsgründen benötigen Rechnung und E-Mail-Versand die Bestellprüfung mit E-Mail-Adresse.
              </div>
            )}

            <button onClick={downloadInvoice} disabled={actionLoading === 'invoice'} className="w-full flex items-center justify-center gap-2 py-3 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold rounded-lg transition-colors disabled:opacity-60">
              <Download size={20} />
              {actionLoading === 'invoice' ? 'Wird vorbereitet...' : 'Rechnung herunterladen'}
            </button>

            <button onClick={resendConfirmation} disabled={actionLoading === 'email'} className="w-full flex items-center justify-center gap-2 py-3 border border-border bg-secondary hover:bg-surface-hover text-foreground font-semibold rounded-lg transition-colors disabled:opacity-60">
              <Mail size={20} />
              {actionLoading === 'email' ? 'Wird gesendet...' : 'Bestätigung erneut senden'}
            </button>

            <Link href="/" className="w-full flex items-center justify-center gap-2 py-3 bg-success hover:bg-success/85 text-background font-semibold rounded-lg transition-colors">
              <Home size={20} />
              Zur Startseite
            </Link>
          </motion.div>

          {/* Contact Info */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-xs text-muted-foreground mt-6"
          >
            Fragen? Kontaktieren Sie uns unter{' '}
            <a href="mailto:info@mk-emotorsdornach.ch" className="text-accent hover:underline">
              info@mk-emotorsdornach.ch
            </a>
          </motion.p>
        </div>

        {/* Support Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="mt-8 text-center text-muted-foreground"
        >
          <p className="text-sm">24/7 Kundensupport verfügbar</p>
          <p className="text-sm font-semibold">+41 61 701 50 50</p>
        </motion.div>
      </motion.div>
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

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <SuccessContent />
    </Suspense>
  )
}
