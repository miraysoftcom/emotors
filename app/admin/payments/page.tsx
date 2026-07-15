'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { AlertCircle, Banknote, CheckCircle2, Clock3, CreditCard, Loader, RefreshCw, Search, type LucideIcon } from 'lucide-react'
import { formatMoney } from '@/lib/money'

type AdminPayment = {
  id: string
  orderId?: number
  orderNumber: string
  customerName: string
  email: string
  amount: number
  currency: string
  status: string
  paymentMethod: string
  providerReference: string
  invoiceNumber?: string | null
  createdAt: string
  updatedAt: string
  source: 'payment' | 'order'
}

const statusFilters = ['ALL', 'Bezahlt', 'Zahlung ausstehend', 'Rechnung offen', 'Zahlungsprüfung erforderlich', 'Warten auf Banküberweisung', 'Fehlgeschlagen', 'Zurückerstattet']

function statusClass(status: string) {
  if (status === 'Bezahlt') return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200'
  if (status === 'Fehlgeschlagen') return 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-200'
  if (status === 'Zurückerstattet') return 'border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-200'
  if (status.includes('Prüfung') || status.includes('Warten')) return 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-200'
  return 'border-slate-500/30 bg-slate-500/10 text-slate-700 dark:text-slate-200'
}

function formatDate(value: string) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('de-CH')
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<AdminPayment[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  async function loadPayments() {
    setLoading(true)
    setMessage('')
    try {
      const response = await fetch('/api/admin/payments', { credentials: 'include', cache: 'no-store' })
      const data = await response.json().catch(() => ({}))
      if (response.status === 401) {
        window.location.href = '/admin/login'
        return
      }
      if (!response.ok) {
        setMessage(data.error || 'Zahlungen konnten nicht geladen werden.')
        setPayments([])
        return
      }
      setPayments(Array.isArray(data.payments) ? data.payments : [])
    } catch {
      setMessage('Zahlungen konnten nicht geladen werden.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadPayments()
  }, [])

  const filteredPayments = useMemo(() => {
    const search = searchTerm.trim().toLowerCase()
    return payments.filter((payment) => {
      const matchesStatus = statusFilter === 'ALL' || payment.status === statusFilter
      const matchesSearch = !search || [
        payment.orderNumber,
        payment.customerName,
        payment.email,
        payment.paymentMethod,
        payment.providerReference,
        payment.invoiceNumber || '',
      ].join(' ').toLowerCase().includes(search)
      return matchesStatus && matchesSearch
    })
  }, [payments, searchTerm, statusFilter])

  const stats = useMemo(() => {
    const paid = payments.filter((payment) => payment.status === 'Bezahlt')
    const open = payments.filter((payment) => payment.status !== 'Bezahlt' && payment.status !== 'Zurückerstattet')
    return {
      total: payments.reduce((sum, payment) => sum + payment.amount, 0),
      paid: paid.reduce((sum, payment) => sum + payment.amount, 0),
      open: open.reduce((sum, payment) => sum + payment.amount, 0),
      review: payments.filter((payment) => payment.status.includes('Prüfung') || payment.status.includes('Warten')).length,
    }
  }, [payments])

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Zahlungen</h1>
          <p className="mt-2 text-muted-foreground">Überblick über Zahlungseingänge, offene Rechnungen und manuelle Zahlungsprüfungen.</p>
        </div>
        <button onClick={() => void loadPayments()} className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-3 font-bold hover:border-accent">
          <RefreshCw className="h-4 w-4" />
          Aktualisieren
        </button>
      </motion.div>

      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <StatCard icon={CreditCard} label="Zahlungsvolumen" value={formatMoney(stats.total)} />
        <StatCard icon={CheckCircle2} label="Bezahlt" value={formatMoney(stats.paid)} />
        <StatCard icon={Clock3} label="Offen / ausstehend" value={formatMoney(stats.open)} />
        <StatCard icon={AlertCircle} label="Manuell prüfen" value={String(stats.review)} />
      </div>

      {message && (
        <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm font-semibold text-red-700 dark:text-red-200">
          {message}
        </div>
      )}

      <div className="rounded-lg border border-border bg-card p-6">
        <div className="mb-5 grid gap-3 lg:grid-cols-[1fr_auto]">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-muted-foreground" size={20} />
            <input
              type="text"
              placeholder="Suche nach Bestellung, Kunde, E-Mail, Referenz..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="w-full rounded-lg border border-border bg-secondary py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-lg border border-border bg-secondary px-4 py-2 font-semibold">
            {statusFilters.map((status) => (
              <option key={status} value={status}>{status === 'ALL' ? 'Alle Status' : status}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader className="h-7 w-7 animate-spin text-accent" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left font-semibold">Bestellung</th>
                  <th className="px-4 py-3 text-left font-semibold">Kunde</th>
                  <th className="px-4 py-3 text-left font-semibold">Zahlungsart</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 py-3 text-right font-semibold">Betrag</th>
                  <th className="px-4 py-3 text-left font-semibold">Datum</th>
                  <th className="px-4 py-3 text-right font-semibold">Aktion</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="border-b border-border hover:bg-secondary/50">
                    <td className="px-4 py-3 font-bold">
                      {payment.orderNumber}
                      <div className="text-xs font-normal text-muted-foreground">
                        {payment.invoiceNumber
                          ? `Rechnung ${payment.invoiceNumber}`
                          : payment.providerReference || (payment.source === 'order' ? 'Aus Bestellung erzeugt' : '-')}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold">{payment.customerName}</div>
                      <div className="text-xs text-muted-foreground">{payment.email || '-'}</div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{payment.paymentMethod}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-black ${statusClass(payment.status)}`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-black">{formatMoney(payment.amount, payment.currency as 'CHF' | 'EUR')}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(payment.createdAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/admin/orders?search=${encodeURIComponent(payment.orderNumber)}`} className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 font-bold hover:border-accent">
                        <Banknote className="h-4 w-4" />
                        Bestellung
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && filteredPayments.length === 0 && (
          <div className="py-10 text-center text-muted-foreground">
            Keine Zahlungen gefunden.
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
          <p className="mt-2 text-2xl font-black">{value}</p>
        </div>
        <span className="grid h-11 w-11 place-items-center rounded-lg bg-accent/10 text-accent">
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </div>
  )
}
