'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import { Gift, Loader, Plus, Save, Trash2 } from 'lucide-react'
import { formatMoney } from '@/lib/money'
import { LOYALTY_POINTS_PER_CHF, loyaltyPointsToChf } from '@/lib/loyalty-points'
import type { CouponRecord } from '@/lib/coupon-store'
import type { CustomerRequestRecord } from '@/lib/customer-request-store'
import type { RewardPaymentRecord } from '@/lib/reward-payment-store'
import { HtmlEditor } from '@/components/admin/HtmlEditor'

const emptyForm: Partial<CouponRecord> = {
  code: '',
  title: '',
  kind: 'coupon',
  discountType: 'fixed',
  value: 0,
  balance: 0,
  minPurchase: 0,
  maxDiscount: 0,
  maxUses: 0,
  customerEmail: '',
  validFrom: '',
  validUntil: '',
  active: true,
  notes: '',
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<CouponRecord[]>([])
  const [requests, setRequests] = useState<CustomerRequestRecord[]>([])
  const [payments, setPayments] = useState<RewardPaymentRecord[]>([])
  const [form, setForm] = useState<Partial<CouponRecord>>(emptyForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [approvingRequestId, setApprovingRequestId] = useState('')
  const [activatingPaymentId, setActivatingPaymentId] = useState('')
  const [message, setMessage] = useState<{ type: 'success' | 'error' | ''; text: string }>({ type: '', text: '' })

  useEffect(() => {
    loadCoupons()
  }, [])

  const stats = useMemo(() => ({
    active: coupons.filter((item) => item.active).length,
    vouchers: coupons.filter((item) => item.kind === 'voucher').length,
    requests: requests.length,
    pendingPayments: payments.filter((item) => item.status !== 'paid' && item.status !== 'cancelled').length,
  }), [coupons, requests, payments])
  const isLoyalty = form.kind === 'loyalty'
  const loyaltyValue = loyaltyPointsToChf(form.value || 0)
  const loyaltyBalance = loyaltyPointsToChf(form.balance || 0)

  async function loadCoupons() {
    setLoading(true)
    const response = await fetch('/api/admin/coupons', { credentials: 'include', cache: 'no-store' })
    if (response.status === 401) {
      window.location.href = '/admin/login'
      return
    }
    const data = await response.json()
    setCoupons(data.coupons || [])
    setRequests(data.requests || [])
    setPayments(data.payments || [])
    setLoading(false)
  }

  async function saveCoupon(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    setMessage({ type: '', text: '' })
    const response = await fetch('/api/admin/coupons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(form),
    })
    const data = await response.json()
    setSaving(false)
    if (!response.ok) {
      setMessage({ type: 'error', text: data.error || 'Coupon konnte nicht gespeichert werden.' })
      return
    }
    setMessage({ type: 'success', text: 'Coupon wurde gespeichert.' })
    setForm(emptyForm)
    await loadCoupons()
  }

  async function removeCoupon(id: string) {
    await fetch(`/api/admin/coupons?id=${encodeURIComponent(id)}`, { method: 'DELETE', credentials: 'include' })
    await loadCoupons()
  }

  function edit(coupon: CouponRecord) {
    setForm(coupon)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function fromRequest(request: CustomerRequestRecord) {
    const amount = Number(String(request.subject || '').match(/\d+/)?.[0] || 0)
    setForm({
      ...emptyForm,
      code: `MK-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      title: `Kundenwunsch ${request.email}`,
      kind: amount > 0 ? 'voucher' : 'coupon',
      discountType: amount > 0 ? 'fixed' : 'percentage',
      value: amount || 10,
      balance: amount || 10,
      customerEmail: request.email,
      notes: `${request.subject}\n${request.message || ''}`,
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function requestAmount(request: CustomerRequestRecord) {
    const normalized = String(request.subject || '').replace(/'/g, '').replace(',', '.')
    return Number(normalized.match(/\d+(?:\.\d{1,2})?/)?.[0] || 0)
  }

  async function approveRequest(request: CustomerRequestRecord) {
    const amount = requestAmount(request)
    if (!amount || amount <= 0) {
      setMessage({ type: 'error', text: 'Bitte zuerst einen gültigen Wunschbetrag in der Anfrage oder im Betreff erfassen.' })
      return
    }
    const confirmed = window.confirm(`${formatMoney(amount, 'CHF')} genehmigen und Zahlungslink an ${request.email} senden?`)
    if (!confirmed) return

    setApprovingRequestId(request.id)
    setMessage({ type: '', text: '' })
    const response = await fetch('/api/admin/coupons/approve-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ requestId: request.id, amount, subject: request.subject }),
    })
    const data = await response.json().catch(() => ({}))
    setApprovingRequestId('')
    if (!response.ok) {
      setMessage({ type: 'error', text: data.error || 'Anfrage konnte nicht genehmigt werden.' })
      return
    }
    setMessage({ type: 'success', text: data.message || 'Zahlungslink wurde gesendet.' })
    await loadCoupons()
  }

  async function activatePayment(payment: RewardPaymentRecord) {
    const confirmed = window.confirm(`Zahlung von ${formatMoney(payment.amount, payment.currency)} für ${payment.couponCode} wurde manuell geprüft? Coupon jetzt aktivieren?`)
    if (!confirmed) return

    setActivatingPaymentId(payment.id)
    setMessage({ type: '', text: '' })
    const response = await fetch('/api/admin/coupons/activate-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ paymentId: payment.id }),
    })
    const data = await response.json().catch(() => ({}))
    setActivatingPaymentId('')
    if (!response.ok) {
      setMessage({ type: 'error', text: data.error || 'Coupon konnte nicht aktiviert werden.' })
      return
    }
    setMessage({ type: 'success', text: data.message || 'Coupon wurde aktiviert.' })
    await loadCoupons()
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Coupons & Geschenkkarten</h1>
        <p className="text-muted-foreground">Coupon Codes, Wunschbeträge, Treuepunkte und Kundenanfragen verwalten.</p>
      </div>

      {message.text && (
        <div className={`rounded-lg border p-4 text-sm font-semibold ${message.type === 'success' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200' : 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-200'}`}>
          {message.text}
        </div>
      )}

      <section className="grid gap-4 md:grid-cols-3">
        <Stat label="Aktive Codes" value={stats.active} />
        <Stat label="Geschenkkarten" value={stats.vouchers} />
        <Stat label="Offene Zahlungen" value={stats.pendingPayments} />
      </section>

      <form onSubmit={saveCoupon} className="rounded-xl border border-border bg-card p-5">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="flex items-center gap-2 text-xl font-bold"><Gift className="text-accent" /> Coupon bearbeiten</h2>
          <button type="button" onClick={() => setForm(emptyForm)} className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-semibold">
            <Plus className="h-4 w-4" /> Neu
          </button>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Code" value={form.code || ''} onChange={(value) => setForm({ ...form, code: value.toUpperCase() })} required />
          <Field label="Titel" value={form.title || ''} onChange={(value) => setForm({ ...form, title: value })} required />
          <label className="space-y-2 text-sm font-semibold">
            <span>Art</span>
            <select
              value={form.kind}
              onChange={(event) => {
                const kind = event.target.value as CouponRecord['kind']
                setForm({
                  ...form,
                  kind,
                  discountType: kind === 'loyalty' ? 'fixed' : form.discountType,
                })
              }}
              className="admin-input"
            >
              <option value="coupon">Coupon</option>
              <option value="voucher">Geschenkkarte</option>
              <option value="loyalty">Treuepunkte</option>
            </select>
          </label>
          <label className="space-y-2 text-sm font-semibold">
            <span>Rabatt-Typ</span>
            <select value={form.discountType} onChange={(event) => setForm({ ...form, discountType: event.target.value as CouponRecord['discountType'] })} className="admin-input">
              <option value="fixed">Fixbetrag CHF</option>
              <option value="percentage">Prozent</option>
              <option value="free_shipping">Gratis Versand</option>
            </select>
          </label>
          <NumberField label={isLoyalty ? 'Punkte' : 'Wert'} value={form.value || 0} onChange={(value) => setForm({ ...form, value, balance: form.kind === 'voucher' || form.kind === 'loyalty' ? value : form.balance })} />
          <NumberField label={isLoyalty ? 'Punkte-Guthaben' : 'Guthaben'} value={form.balance || 0} onChange={(value) => setForm({ ...form, balance: value })} />
          <NumberField label="Mindestbestellwert" value={form.minPurchase || 0} onChange={(value) => setForm({ ...form, minPurchase: value })} />
          <NumberField label="Max. Rabatt" value={form.maxDiscount || 0} onChange={(value) => setForm({ ...form, maxDiscount: value })} />
          <NumberField label="Max. Nutzungen" value={form.maxUses || 0} onChange={(value) => setForm({ ...form, maxUses: value })} />
          <Field label="Kunden E-Mail optional" value={form.customerEmail || ''} onChange={(value) => setForm({ ...form, customerEmail: value })} />
          <Field label="Gültig von" type="date" value={form.validFrom || ''} onChange={(value) => setForm({ ...form, validFrom: value })} />
          <Field label="Gültig bis" type="date" value={form.validUntil || ''} onChange={(value) => setForm({ ...form, validUntil: value })} />
        </div>
        {isLoyalty && (
          <div className="mt-4 rounded-lg border border-accent/30 bg-accent/10 p-4 text-sm">
            <p className="font-black">Treuepunkte Regel: {LOYALTY_POINTS_PER_CHF} Punkte = CHF 1</p>
            <p className="mt-1 text-muted-foreground">
              Eingetragene Punkte: {form.value || 0} = {formatMoney(loyaltyValue, 'CHF')}. Aktuelles Punkte-Guthaben: {form.balance || 0} = {formatMoney(loyaltyBalance, 'CHF')}.
            </p>
          </div>
        )}
        <label className="mt-4 flex items-center gap-3 rounded-lg border border-border p-3 text-sm">
          <input type="checkbox" checked={Boolean(form.active)} onChange={(event) => setForm({ ...form, active: event.target.checked })} />
          Aktiv
        </label>
        <div className="mt-4">
          <HtmlEditor label="Notizen" value={form.notes || ''} onChange={(notes) => setForm({ ...form, notes })} minHeightClassName="min-h-36" />
        </div>
        <button disabled={saving} className="mt-5 inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-3 font-semibold text-accent-foreground disabled:opacity-60">
          {saving ? <Loader className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Speichern
        </button>
      </form>

      <section className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="mb-4 text-xl font-bold">Codes</h2>
          {loading ? <Loader className="animate-spin text-accent" /> : (
            <div className="space-y-3">
              {coupons.map((coupon) => (
                <div key={coupon.id} className="rounded-lg border border-border bg-secondary/40 p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-mono text-lg font-black">{coupon.code}</p>
                      <p className="text-sm text-muted-foreground">{coupon.title} · {coupon.kind} · {coupon.discountType}</p>
                      <p className="mt-1 text-sm">
                        {coupon.kind === 'loyalty'
                          ? `Punkte: ${coupon.value} (${formatMoney(loyaltyPointsToChf(coupon.value), 'CHF')}) · Guthaben: ${coupon.balance} (${formatMoney(loyaltyPointsToChf(coupon.balance), 'CHF')})`
                          : `Wert: ${coupon.value} · Guthaben: ${coupon.balance}`}
                        {' '}· Nutzung: {coupon.usedCount}/{coupon.maxUses || '∞'}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => edit(coupon)} className="rounded-lg border border-border px-3 py-2 text-sm font-semibold">Bearbeiten</button>
                      <button onClick={() => removeCoupon(coupon.id)} className="rounded-lg border border-red-500/30 px-3 py-2 text-sm font-semibold text-red-400"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                </div>
              ))}
              {coupons.length === 0 && <p className="text-muted-foreground">Noch keine Coupons angelegt.</p>}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="mb-4 text-xl font-bold">Zahlungskontrolle</h2>
          <div className="space-y-3">
            {payments.map((payment) => (
              <div key={payment.id} className={`rounded-lg border p-4 ${payment.status === 'paid' ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-amber-500/30 bg-amber-500/10'}`}>
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="font-mono text-lg font-black">{payment.couponCode}</p>
                    <p className="text-sm text-muted-foreground">{payment.customerEmail} · {payment.selectedMethod || 'Zahlungsart noch nicht gewählt'}</p>
                    <p className="mt-2 text-sm font-black">{formatMoney(payment.amount, payment.currency)} · Status: {payment.status}</p>
                    <p className="mt-1 text-xs text-muted-foreground">Erstellt: {new Date(payment.createdAt).toLocaleString('de-CH')}</p>
                  </div>
                  {payment.status !== 'paid' && payment.status !== 'cancelled' && (
                    <button
                      onClick={() => activatePayment(payment)}
                      disabled={activatingPaymentId === payment.id}
                      className="rounded-lg bg-emerald-500 px-3 py-2 text-sm font-black text-emerald-950 disabled:opacity-60"
                    >
                      {activatingPaymentId === payment.id ? 'Aktiviere...' : 'Bezahlt geprüft & Coupon aktivieren'}
                    </button>
                  )}
                </div>
              </div>
            ))}
            {payments.length === 0 && <p className="text-muted-foreground">Noch keine Zahlungsanforderungen vorhanden.</p>}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr]">
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="mb-4 text-xl font-bold">Kundenanfragen</h2>
          <div className="space-y-3">
            {requests.map((request) => (
              <div key={request.id} className="rounded-lg border border-border bg-secondary/40 p-4">
                <p className="font-black">{request.subject}</p>
                <p className="text-sm text-muted-foreground">{request.email} · {new Date(request.createdAt).toLocaleString('de-CH')}</p>
                {requestAmount(request) > 0 && <p className="mt-2 text-sm font-black text-accent">Wunschbetrag: {formatMoney(requestAmount(request), 'CHF')}</p>}
                {request.message && <p className="mt-2 text-sm">{request.message}</p>}
                <div className="mt-3 flex flex-wrap gap-2">
                  <button onClick={() => fromRequest(request)} className="rounded-lg border border-border px-3 py-2 text-sm font-semibold">Coupon daraus erstellen</button>
                  <button
                    onClick={() => approveRequest(request)}
                    disabled={approvingRequestId === request.id}
                    className="rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-accent-foreground disabled:opacity-60"
                  >
                    {approvingRequestId === request.id ? 'Sende...' : 'Genehmigen & Zahlungslink senden'}
                  </button>
                </div>
              </div>
            ))}
            {requests.length === 0 && <p className="text-muted-foreground">Keine Coupon-Anfragen vorhanden.</p>}
          </div>
        </div>
      </section>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-3xl font-black">{value}</p>
    </div>
  )
}

function Field({ label, value, onChange, required = false, type = 'text' }: { label: string; value: string; onChange: (value: string) => void; required?: boolean; type?: string }) {
  return (
    <label className="space-y-2 text-sm font-semibold">
      <span>{label}</span>
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} required={required} className="admin-input" />
    </label>
  )
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return <Field label={label} value={String(value)} onChange={(value) => onChange(Number(value) || 0)} />
}
