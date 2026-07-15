'use client'

import { FormEvent, useEffect, useState } from 'react'
import { Plus, Save, ShieldCheck, Trash2 } from 'lucide-react'
import { HtmlEditor } from '@/components/admin/HtmlEditor'

type WarrantyStatus = 'active' | 'expired' | 'void' | 'service'

type WarrantyRecord = {
  id?: string
  serialNumber: string
  vehicleNumber: string
  productName: string
  orderNumber: string
  customerEmail: string
  customerName: string
  purchaseDate: string
  warrantyUntil: string
  status: WarrantyStatus
  notes: string
}

const emptyForm: WarrantyRecord = {
  serialNumber: '',
  vehicleNumber: '',
  productName: '',
  orderNumber: '',
  customerEmail: '',
  customerName: '',
  purchaseDate: '',
  warrantyUntil: '',
  status: 'active',
  notes: '',
}

export default function AdminWarrantyPage() {
  const [records, setRecords] = useState<WarrantyRecord[]>([])
  const [form, setForm] = useState<WarrantyRecord>(emptyForm)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadRecords()
  }, [])

  async function loadRecords() {
    const response = await fetch('/api/admin/warranty-records', { credentials: 'include' })
    if (response.status === 401) {
      window.location.href = '/admin/login'
      return
    }
    const data = await response.json()
    setRecords(data.records || [])
  }

  async function save(event: FormEvent) {
    event.preventDefault()
    setLoading(true)
    setMessage('')
    const response = await fetch('/api/admin/warranty-records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(form),
    })
    const data = await response.json()
    setLoading(false)
    if (!response.ok) {
      setMessage(data.error || 'Garantie konnte nicht gespeichert werden.')
      return
    }
    setMessage('Garantieeintrag gespeichert.')
    setForm(emptyForm)
    await loadRecords()
  }

  async function remove(id?: string) {
    if (!id) return
    await fetch(`/api/admin/warranty-records?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
      credentials: 'include',
    })
    await loadRecords()
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/20">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.25em] text-accent">After Sales</p>
              <h1 className="mt-2 text-3xl font-black md:text-5xl">Garantie & Serviceantrag</h1>
              <p className="mt-3 max-w-2xl text-sm text-slate-300">
                Seriennummern, Fahrzeugnummern und Garantiefristen nach dem Verkauf verwalten.
              </p>
            </div>
            <div className="rounded-2xl border border-accent/30 bg-accent/10 px-5 py-4 text-accent">
              <p className="text-xs font-black uppercase tracking-widest">Einträge</p>
              <p className="mt-1 text-3xl font-black">{records.length}</p>
            </div>
          </div>
        </section>

        {message && (
          <div className="rounded-2xl border border-accent/30 bg-accent/10 px-4 py-3 text-sm font-bold text-accent">
            {message}
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <form onSubmit={save} className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.04] p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="flex items-center gap-2 text-xl font-black">
                <Plus className="h-5 w-5 text-accent" />
                {form.id ? 'Garantie bearbeiten' : 'Garantie erfassen'}
              </h2>
              <button type="button" onClick={() => setForm(emptyForm)} className="text-sm font-bold text-slate-400 hover:text-white">
                Neu
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <AdminField label="Seriennummer">
                <input value={form.serialNumber} onChange={(event) => setForm({ ...form, serialNumber: event.target.value })} className="admin-input" placeholder="SN-MK-..." />
              </AdminField>
              <AdminField label="Fahrzeugnummer">
                <input value={form.vehicleNumber} onChange={(event) => setForm({ ...form, vehicleNumber: event.target.value })} className="admin-input" placeholder="VIN / Fahrzeug-ID" />
              </AdminField>
            </div>

            <AdminField label="Produkt / Modell">
              <input value={form.productName} onChange={(event) => setForm({ ...form, productName: event.target.value })} className="admin-input" required />
            </AdminField>

            <div className="grid gap-3 sm:grid-cols-2">
              <AdminField label="Bestellnummer">
                <input value={form.orderNumber} onChange={(event) => setForm({ ...form, orderNumber: event.target.value })} className="admin-input" />
              </AdminField>
              <AdminField label="Status">
                <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as WarrantyStatus })} className="admin-input">
                  <option value="active">Aktiv</option>
                  <option value="expired">Abgelaufen</option>
                  <option value="service">Im Service</option>
                  <option value="void">Ungültig</option>
                </select>
              </AdminField>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <AdminField label="Kaufdatum">
                <input type="date" value={form.purchaseDate} onChange={(event) => setForm({ ...form, purchaseDate: event.target.value })} className="admin-input" required />
              </AdminField>
              <AdminField label="Garantie bis">
                <input type="date" value={form.warrantyUntil} onChange={(event) => setForm({ ...form, warrantyUntil: event.target.value })} className="admin-input" required />
              </AdminField>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <AdminField label="Kundenname">
                <input value={form.customerName} onChange={(event) => setForm({ ...form, customerName: event.target.value })} className="admin-input" />
              </AdminField>
              <AdminField label="Kunden E-Mail">
                <input type="email" value={form.customerEmail} onChange={(event) => setForm({ ...form, customerEmail: event.target.value })} className="admin-input" />
              </AdminField>
            </div>

            <AdminField label="Interne Notiz">
              <HtmlEditor value={form.notes} onChange={(notes) => setForm({ ...form, notes })} minHeightClassName="min-h-36" />
            </AdminField>

            <button disabled={loading} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-accent px-5 py-4 text-sm font-black uppercase tracking-widest text-slate-950 transition hover:brightness-110 disabled:opacity-60">
              <Save className="h-4 w-4" />
              {loading ? 'Speichern...' : 'Garantie speichern'}
            </button>
          </form>

          <section className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.04] p-5">
            <h2 className="flex items-center gap-2 text-xl font-black">
              <ShieldCheck className="h-5 w-5 text-accent" />
              Verkaufte Fahrzeuge / Teile
            </h2>
            {records.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-sm text-slate-400">
                Noch keine Garantieeinträge vorhanden.
              </div>
            ) : (
              <div className="grid gap-3">
                {records.map((record) => (
                  <article key={record.id} className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-accent/15 px-3 py-1 text-xs font-black text-accent">{record.status}</span>
                          {record.orderNumber && <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-black text-slate-300">{record.orderNumber}</span>}
                        </div>
                        <h3 className="mt-3 text-lg font-black">{record.productName}</h3>
                        <p className="mt-1 text-sm text-slate-400">SN: {record.serialNumber || '-'} · Fahrzeug: {record.vehicleNumber || '-'}</p>
                        <p className="mt-1 text-sm text-slate-400">Garantie bis {formatDate(record.warrantyUntil)} · Kaufdatum {formatDate(record.purchaseDate)}</p>
                        {(record.customerName || record.customerEmail) && (
                          <p className="mt-1 text-sm text-slate-500">{record.customerName} {record.customerEmail && `· ${record.customerEmail}`}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => setForm(record)} className="rounded-xl border border-white/10 px-3 py-2 text-sm font-bold text-slate-300 hover:bg-white/10">
                          Bearbeiten
                        </button>
                        <button type="button" onClick={() => remove(record.id)} className="rounded-xl border border-red-400/30 px-3 py-2 text-sm font-bold text-red-200 hover:bg-red-500/10" aria-label="Garantie löschen">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}

function AdminField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="text-xs font-black uppercase tracking-widest text-slate-400">{label}</span>
      {children}
    </label>
  )
}

function formatDate(value: string) {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('de-CH')
}
