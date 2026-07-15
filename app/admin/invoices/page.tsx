'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import { CheckCircle2, Copy, Download, Eye, FilePlus2, RefreshCw, Search, Trash2, XCircle } from 'lucide-react'
import { formatMoney } from '@/lib/money'

interface InvoiceLineItem {
  id: string
  name: string
  quantity: number
  unit: string
  unitPrice: number
  discountPercent: number
  taxRate: number
  lineTotal: number
}

interface InvoicePayment {
  id: string
  amount: number
  method: string
  paidAt: string
  note?: string
}

interface Invoice {
  id: number
  invoiceNumber: string
  orderNumber: string
  status: string
  paymentMethod: string
  amount: number
  paidAmount?: number
  openAmount?: number
  currency: 'CHF' | 'EUR'
  dueDate: string
  createdAt: string
  customerName?: string
  customerEmail?: string
  source?: string
  finalizedAt?: string | null
  items?: InvoiceLineItem[]
  payments?: InvoicePayment[]
}

const emptyLine = (): InvoiceLineItem => ({
  id: `line-${Date.now()}`,
  name: '',
  quantity: 1,
  unit: 'Stk.',
  unitPrice: 0,
  discountPercent: 0,
  taxRate: 0,
  lineTotal: 0,
})

export default function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [showCreate, setShowCreate] = useState(false)
  const [paymentInvoice, setPaymentInvoice] = useState<Invoice | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    street: '',
    postalCode: '',
    city: '',
    country: 'CH',
    paymentMethod: 'auf_rechnung',
    dueDate: '',
    notes: '',
    internalNotes: '',
    status: 'Offen',
    lines: [emptyLine()],
  })
  const [paymentForm, setPaymentForm] = useState({ amount: '', method: 'bank_transfer', paidAt: new Date().toISOString().slice(0, 10), note: '' })

  const loadInvoices = async () => {
    setLoading(true)
    const res = await fetch('/api/admin/invoices', { credentials: 'include', cache: 'no-store' })
    const data = await res.json()
    setInvoices(Array.isArray(data.invoices) ? data.invoices : [])
    setLoading(false)
  }

  useEffect(() => {
    loadInvoices()
  }, [])

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return invoices.filter((invoice) => {
      const haystack = [
        invoice.invoiceNumber,
        invoice.orderNumber,
        invoice.customerName,
        invoice.customerEmail,
        invoice.paymentMethod,
        invoice.status,
      ].join(' ').toLowerCase()
      return (statusFilter === 'ALL' || invoice.status === statusFilter) && (!query || haystack.includes(query))
    })
  }, [invoices, search, statusFilter])

  const stats = useMemo(() => ({
    total: invoices.reduce((sum, invoice) => sum + invoice.amount, 0),
    open: invoices.reduce((sum, invoice) => sum + (invoice.openAmount ?? invoice.amount), 0),
    paid: invoices.reduce((sum, invoice) => sum + (invoice.paidAmount || 0), 0),
    overdue: invoices.filter((invoice) => invoice.status === 'Überfällig').length,
  }), [invoices])

  function updateLine(index: number, patch: Partial<InvoiceLineItem>) {
    setForm((current) => {
      const lines = current.lines.map((line, lineIndex) => {
        if (lineIndex !== index) return line
        const next = { ...line, ...patch }
        const gross = Number(next.quantity || 0) * Number(next.unitPrice || 0)
        next.lineTotal = roundMoney(gross - (gross * Number(next.discountPercent || 0) / 100))
        return next
      })
      return { ...current, lines }
    })
  }

  async function createInvoice(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    const response = await fetch('/api/admin/invoices', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: form.customerName,
        customerEmail: form.customerEmail,
        customerPhone: form.customerPhone,
        paymentMethod: form.paymentMethod,
        dueDate: form.dueDate,
        status: form.status,
        notes: form.notes,
        internalNotes: form.internalNotes,
        billingAddress: {
          street: form.street,
          postalCode: form.postalCode,
          city: form.city,
          country: form.country,
        },
        items: form.lines,
      }),
    })
    const data = await response.json()
    setSaving(false)
    if (!response.ok) {
      window.alert(data.error || 'Rechnung konnte nicht erstellt werden.')
      return
    }
    setShowCreate(false)
    setForm((current) => ({ ...current, lines: [emptyLine()] }))
    await loadInvoices()
  }

  async function runAction(invoice: Invoice, action: 'finalize' | 'cancel' | 'delete') {
    const confirmed = action === 'delete'
      ? window.confirm('Diese Rechnung löschen? Finalisierte Rechnungen werden sicherheitshalber storniert.')
      : true
    if (!confirmed) return
    const response = await fetch(`/api/admin/invoices/${invoice.id}`, {
      method: action === 'delete' ? 'DELETE' : 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: action === 'delete' ? undefined : JSON.stringify({ action }),
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) window.alert(data.error || 'Aktion fehlgeschlagen.')
    await loadInvoices()
  }

  async function addPayment(event: FormEvent) {
    event.preventDefault()
    if (!paymentInvoice) return
    const response = await fetch(`/api/admin/invoices/${paymentInvoice.id}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'payment',
        payment: {
          amount: Number(paymentForm.amount),
          method: paymentForm.method,
          paidAt: paymentForm.paidAt,
          note: paymentForm.note,
        },
      }),
    })
    const data = await response.json()
    if (!response.ok) {
      window.alert(data.error || 'Zahlung konnte nicht gespeichert werden.')
      return
    }
    setPaymentInvoice(null)
    setPaymentForm({ amount: '', method: 'bank_transfer', paidAt: new Date().toISOString().slice(0, 10), note: '' })
    await loadInvoices()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Rechnungen</h1>
          <p className="text-muted-foreground">Swiss QR-Rechnungen, manuelle Faktura und Zahlungseingänge</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setShowCreate(true)} className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 font-black text-accent-foreground">
            <FilePlus2 className="h-4 w-4" />
            Neue Rechnung
          </button>
          <button onClick={loadInvoices} className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 font-bold">
            <RefreshCw className="h-4 w-4" />
            Aktualisieren
          </button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <Stat label="Total fakturiert" value={formatMoney(stats.total, 'CHF')} />
        <Stat label="Offen" value={formatMoney(stats.open, 'CHF')} />
        <Stat label="Bezahlt" value={formatMoney(stats.paid, 'CHF')} />
        <Stat label="Überfällig" value={String(stats.overdue)} />
      </div>

      <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechnungsnummer, Kunde, Bestellung..." className="w-full rounded-lg border border-border bg-background py-2 pl-10 pr-3" />
        </div>
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-lg border border-border bg-background px-3 py-2">
          {['ALL', 'Entwurf', 'Offen', 'Zahlung ausstehend', 'Teilweise bezahlt', 'Bezahlt', 'Überfällig', 'Storniert', 'settings_required'].map((status) => (
            <option key={status} value={status}>{status === 'ALL' ? 'Alle Status' : statusLabel(status)}</option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="px-4 py-3 text-left">Rechnung</th>
              <th className="px-4 py-3 text-left">Kunde</th>
              <th className="px-4 py-3 text-left">Betrag</th>
              <th className="px-4 py-3 text-left">Bezahlt / Offen</th>
              <th className="px-4 py-3 text-left">Fällig</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-right">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((invoice) => (
              <tr key={invoice.id} className="border-b border-border align-top">
                <td className="px-4 py-3">
                  <div className="font-black">{invoice.invoiceNumber}</div>
                  <div className="text-xs text-muted-foreground">{invoice.orderNumber || invoice.source || 'Manuell'} · {invoice.paymentMethod}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="font-semibold">{invoice.customerName || '-'}</div>
                  <div className="text-xs text-muted-foreground">{invoice.customerEmail || '-'}</div>
                </td>
                <td className="px-4 py-3 font-black">{formatMoney(invoice.amount, invoice.currency)}</td>
                <td className="px-4 py-3">
                  <div>{formatMoney(invoice.paidAmount || 0, invoice.currency)}</div>
                  <div className="text-xs text-muted-foreground">offen {formatMoney(invoice.openAmount ?? invoice.amount, invoice.currency)}</div>
                </td>
                <td className="px-4 py-3">{formatDate(invoice.dueDate)}</td>
                <td className="px-4 py-3"><span className={`rounded-full border px-3 py-1 text-xs font-black ${statusClass(invoice.status)}`}>{statusLabel(invoice.status)}</span></td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <a target="_blank" href={`/api/admin/invoices/${invoice.id}/download?format=html`} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border hover:border-accent" title="Anzeigen"><Eye className="h-4 w-4" /></a>
                    <a href={`/api/admin/invoices/${invoice.id}/download`} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border hover:border-accent" title="PDF"><Download className="h-4 w-4" /></a>
                    <button onClick={() => { setPaymentInvoice(invoice); setPaymentForm((current) => ({ ...current, amount: String(invoice.openAmount ?? invoice.amount) })) }} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border hover:border-accent" title="Zahlung erfassen"><CheckCircle2 className="h-4 w-4" /></button>
                    <button onClick={() => runAction(invoice, 'finalize')} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border hover:border-accent" title="Finalisieren"><Copy className="h-4 w-4" /></button>
                    <button onClick={() => runAction(invoice, 'cancel')} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border hover:border-accent" title="Stornieren"><XCircle className="h-4 w-4" /></button>
                    <button onClick={() => runAction(invoice, 'delete')} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border hover:border-accent" title="Löschen"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && filtered.length === 0 && <div className="p-10 text-center text-muted-foreground">Keine Rechnungen gefunden.</div>}
        {loading && <div className="p-10 text-center text-muted-foreground">Wird geladen...</div>}
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 p-4">
          <form onSubmit={createInvoice} className="mx-auto max-w-5xl rounded-lg border border-border bg-background p-5 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-2xl font-black">Neue manuelle Rechnung</h2>
              <button type="button" onClick={() => setShowCreate(false)} className="rounded-lg border border-border px-3 py-2 font-bold">Schließen</button>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <Field label="Kunde" value={form.customerName} onChange={(value) => setForm({ ...form, customerName: value })} required />
              <Field label="E-Mail" value={form.customerEmail} onChange={(value) => setForm({ ...form, customerEmail: value })} />
              <Field label="Telefon" value={form.customerPhone} onChange={(value) => setForm({ ...form, customerPhone: value })} />
              <Field label="Straße" value={form.street} onChange={(value) => setForm({ ...form, street: value })} required />
              <Field label="PLZ" value={form.postalCode} onChange={(value) => setForm({ ...form, postalCode: value })} required />
              <Field label="Ort" value={form.city} onChange={(value) => setForm({ ...form, city: value })} required />
              <Field label="Land" value={form.country} onChange={(value) => setForm({ ...form, country: value })} />
              <Field label="Fälligkeitsdatum" type="date" value={form.dueDate} onChange={(value) => setForm({ ...form, dueDate: value })} />
              <label className="space-y-1 text-sm font-bold">
                <span>Status</span>
                <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })} className="w-full rounded-lg border border-border bg-card px-3 py-2">
                  <option>Offen</option>
                  <option>Entwurf</option>
                  <option>Zahlung ausstehend</option>
                </select>
              </label>
            </div>

            <div className="mt-6 overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-border"><th className="px-3 py-2 text-left">Position</th><th>Menge</th><th>Preis</th><th>Rabatt %</th><th>Total</th><th></th></tr></thead>
                <tbody>
                  {form.lines.map((line, index) => (
                    <tr key={line.id} className="border-b border-border">
                      <td className="px-3 py-2"><input value={line.name} onChange={(event) => updateLine(index, { name: event.target.value })} className="w-full rounded-lg border border-border bg-card px-3 py-2" placeholder="Produkt oder Service" required /></td>
                      <td className="px-3 py-2"><input type="number" min="0" step="0.01" value={line.quantity} onChange={(event) => updateLine(index, { quantity: Number(event.target.value) })} className="w-24 rounded-lg border border-border bg-card px-3 py-2" /></td>
                      <td className="px-3 py-2"><input type="number" min="0" step="0.01" value={line.unitPrice} onChange={(event) => updateLine(index, { unitPrice: Number(event.target.value) })} className="w-28 rounded-lg border border-border bg-card px-3 py-2" /></td>
                      <td className="px-3 py-2"><input type="number" min="0" max="100" step="0.01" value={line.discountPercent} onChange={(event) => updateLine(index, { discountPercent: Number(event.target.value) })} className="w-24 rounded-lg border border-border bg-card px-3 py-2" /></td>
                      <td className="px-3 py-2 font-black">{formatMoney(line.lineTotal, 'CHF')}</td>
                      <td className="px-3 py-2 text-right"><button type="button" onClick={() => setForm((current) => ({ ...current, lines: current.lines.filter((_, lineIndex) => lineIndex !== index) }))} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border hover:border-accent"><Trash2 className="h-4 w-4" /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button type="button" onClick={() => setForm((current) => ({ ...current, lines: [...current.lines, emptyLine()] }))} className="mt-3 rounded-lg border border-border px-4 py-2 font-bold">Position hinzufügen</button>
            <textarea value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} placeholder="Kundennotiz" className="mt-4 min-h-24 w-full rounded-lg border border-border bg-card px-3 py-2" />
            <div className="mt-5 flex justify-end gap-3">
              <button type="button" onClick={() => setShowCreate(false)} className="rounded-lg border border-border px-4 py-2 font-bold">Abbrechen</button>
              <button disabled={saving} className="rounded-lg bg-accent px-5 py-2 font-black text-accent-foreground">{saving ? 'Speichert...' : 'Rechnung erstellen'}</button>
            </div>
          </form>
        </div>
      )}

      {paymentInvoice && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
          <form onSubmit={addPayment} className="w-full max-w-lg rounded-lg border border-border bg-background p-5 shadow-2xl">
            <h2 className="text-xl font-black">Zahlung erfassen</h2>
            <p className="mt-1 text-sm text-muted-foreground">{paymentInvoice.invoiceNumber} · offen {formatMoney(paymentInvoice.openAmount ?? paymentInvoice.amount, paymentInvoice.currency)}</p>
            <Field label="Betrag" type="number" value={paymentForm.amount} onChange={(value) => setPaymentForm({ ...paymentForm, amount: value })} required />
            <Field label="Zahlungsdatum" type="date" value={paymentForm.paidAt} onChange={(value) => setPaymentForm({ ...paymentForm, paidAt: value })} required />
            <Field label="Zahlungsart" value={paymentForm.method} onChange={(value) => setPaymentForm({ ...paymentForm, method: value })} />
            <textarea value={paymentForm.note} onChange={(event) => setPaymentForm({ ...paymentForm, note: event.target.value })} placeholder="Notiz" className="mt-3 min-h-20 w-full rounded-lg border border-border bg-card px-3 py-2" />
            <div className="mt-5 flex justify-end gap-3">
              <button type="button" onClick={() => setPaymentInvoice(null)} className="rounded-lg border border-border px-4 py-2 font-bold">Abbrechen</button>
              <button className="rounded-lg bg-accent px-5 py-2 font-black text-accent-foreground">Speichern</button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

function Field({ label, value, onChange, type = 'text', required = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean }) {
  return (
    <label className="mt-3 block space-y-1 text-sm font-bold">
      <span>{label}</span>
      <input required={required} type={type} value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-lg border border-border bg-card px-3 py-2" />
    </label>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg border border-border bg-card p-4"><div className="text-xs font-black uppercase text-muted-foreground">{label}</div><div className="mt-2 text-2xl font-black">{value}</div></div>
}

function roundMoney(value: number) {
  return Math.round((Number(value) || 0) * 100) / 100
}

function formatDate(value?: string) {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('de-CH')
}

function statusClass(status: string) {
  if (status === 'Bezahlt') return 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700'
  if (status === 'Überfällig' || status === 'Storniert' || status === 'settings_required') return 'border-red-500/40 bg-red-500/10 text-red-700'
  if (status === 'Teilweise bezahlt' || status === 'Zahlung ausstehend') return 'border-amber-500/40 bg-amber-500/10 text-amber-700'
  if (status === 'Entwurf') return 'border-slate-500/40 bg-slate-500/10 text-slate-700'
  return 'border-sky-500/40 bg-sky-500/10 text-sky-700'
}

function statusLabel(status: string) {
  if (status === 'settings_required') return 'QR-Einstellungen prüfen'
  return status
}
