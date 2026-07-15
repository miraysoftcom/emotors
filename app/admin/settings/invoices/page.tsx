'use client'

import { useEffect, useState } from 'react'
import type { InvoiceSettings, SwissQrConfigStatus } from '@/lib/invoice-store'
import type { TaxSettings } from '@/lib/tax-calculation'
import { HtmlEditor } from '@/components/admin/HtmlEditor'

type StatusPayload = { status: SwissQrConfigStatus; label: string; missing: string[]; errors: string[] }

export default function InvoiceSettingsPage() {
  const [form, setForm] = useState<InvoiceSettings | null>(null)
  const [tax, setTax] = useState<TaxSettings | null>(null)
  const [status, setStatus] = useState<StatusPayload | null>(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetch('/api/admin/invoice-settings', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          window.location.href = '/admin/login'
          return
        }
        setForm(data.settings)
        setStatus(data.status)
      })
    fetch('/api/admin/tax-settings', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => setTax(data.settings))
  }, [])

  const saveInvoice = async () => {
    if (!form) return
    setMessage('')
    const res = await fetch('/api/admin/invoice-settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (!res.ok) {
      setMessage(data.error || 'Einstellungen konnten nicht gespeichert werden.')
      return
    }
    setForm(data.settings)
    setStatus(data.status)
    setMessage('Swiss QR Einstellungen gespeichert.')
  }

  const saveTax = async () => {
    if (!tax) return
    setMessage('')
    const res = await fetch('/api/admin/tax-settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(tax),
    })
    const data = await res.json()
    if (!res.ok) {
      setMessage(data.error || 'MWST-Einstellungen konnten nicht gespeichert werden.')
      return
    }
    setTax(data.settings)
    setMessage('MWST Einstellungen gespeichert.')
  }

  if (!form || !tax) return <div className="text-muted-foreground">Wird geladen...</div>

  const field = (key: keyof InvoiceSettings, label: string, type = 'text') => (
    <label className="block">
      <span className="mb-2 block text-sm font-bold">{label}</span>
      <input
        type={type}
        value={String(form[key] ?? '')}
        onChange={(event) => setForm({ ...form, [key]: type === 'number' ? Number(event.target.value) : event.target.value })}
        className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-accent"
      />
    </label>
  )

  return (
    <div className="max-w-6xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Swiss QR & MWST</h1>
        <p className="text-muted-foreground">QR-Bill, Zahlungsempfänger, Bankverbindung und steuerliche Einstellungen verwalten.</p>
      </div>

      {message && (
        <div className={`rounded-lg border p-4 ${message.includes('gespeichert') ? 'border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-200' : 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-200'}`}>
          {message}
        </div>
      )}

      <section className="rounded-lg border border-border bg-card p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-black">Swiss QR-Bill Status</h2>
            <p className="text-sm text-muted-foreground">Status: <strong>{status?.label || 'Nicht konfiguriert'}</strong></p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a href="/api/admin/invoice-settings?preview=test-pdf&format=html" target="_blank" className="rounded-lg border border-border px-4 py-2 text-sm font-bold">
              QR-Bill Vorschau / Drucken
            </a>
            <a href="/api/admin/invoice-settings?preview=test-pdf" target="_blank" className="rounded-lg border border-border px-4 py-2 text-sm font-bold">
              Test PDF
            </a>
            <button onClick={saveInvoice} className="rounded-lg bg-accent px-4 py-2 text-sm font-bold text-accent-foreground">
              Swiss QR speichern
            </button>
          </div>
        </div>
        {(status?.missing?.length || 0) > 0 && (
          <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm">
            Folgende Angaben fehlen: {status?.missing.join(', ')}.
          </div>
        )}
        {(status?.errors?.length || 0) > 0 && (
          <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm">
            {status?.errors.join(' ')}
          </div>
        )}
      </section>

      <section className="rounded-lg border border-border bg-card p-5">
        <h2 className="mb-4 text-xl font-black">Swiss QR Einstellungen</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Toggle label="Swiss QR-Bill aktivieren" checked={form.qrBillEnabled} onChange={(value) => setForm({ ...form, qrBillEnabled: value, enabled: value })} />
          <Toggle label="QR-Bill auch bei bereits bezahlten Rechnungen anzeigen" checked={form.showQrForPaidInvoices} onChange={(value) => setForm({ ...form, showQrForPaidInvoices: value })} />
          {field('logoUrl', 'Logo URL')}
          {field('logoWidthMm', 'Logo Breite mm', 'number')}
          {field('logoHeightMm', 'Logo Höhe mm', 'number')}
          {field('website', 'Website')}
          {field('companyName', 'Firmenname')}
          {field('companyAddition', 'Zusatzbezeichnung')}
          {field('email', 'Firma E-Mail-Adresse')}
          {field('phone', 'Firma Telefonnummer')}
          {field('street', 'Straße')}
          {field('houseNumber', 'Hausnummer')}
          {field('postalCode', 'Postleitzahl')}
          {field('city', 'Ort')}
          {field('canton', 'Kanton')}
          {field('country', 'Land')}
          {field('vatNumber', 'MWST-Nummer / UID')}
          {field('commercialRegisterNumber', 'Handelsregisternummer')}
        </div>
      </section>

      <section className="rounded-lg border border-border bg-card p-5">
        <h2 className="mb-4 text-xl font-black">Bank & Referenz</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {field('qrIban', 'QR-IBAN (nur für QRR, IID 30000-31999)')}
          {field('iban', 'Normale IBAN (für NON oder SCOR)')}
          {field('bankName', 'Bankname')}
          {field('accountHolder', 'Kontoinhaber')}
          {field('bic', 'BIC / SWIFT')}
          <label className="block">
            <span className="mb-2 block text-sm font-bold">Währung</span>
            <select value={form.currency} onChange={(event) => setForm({ ...form, currency: event.target.value as 'CHF' | 'EUR' })} className="w-full rounded-lg border border-border bg-background px-3 py-2">
              <option value="CHF">CHF</option>
              <option value="EUR">EUR</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-bold">Referenztyp</span>
            <select value={form.referenceType} onChange={(event) => setForm({ ...form, referenceType: event.target.value as InvoiceSettings['referenceType'] })} className="w-full rounded-lg border border-border bg-background px-3 py-2">
              <option value="QRR">QRR - QR-Referenz</option>
              <option value="SCOR">SCOR - Creditor Reference</option>
              <option value="NON">NON - Ohne Referenz</option>
            </select>
          </label>
          <div className="md:col-span-2 rounded-lg border border-accent/30 bg-accent/10 p-4 text-sm text-muted-foreground">
            QRR funktioniert nur mit einer echten QR-IBAN Ihrer Bank. Normale IBANs dürfen nicht als QR-IBAN verwendet werden; wählen Sie dafür NON oder SCOR. Zahlungsreferenzen werden beim Speichern automatisch erzeugt, wenn sie leer oder ungültig sind.
          </div>
          {field('standardReference', 'Standard-Zahlungsreferenz automatisch')}
          {field('creditorReference', 'Creditor Reference automatisch')}
          {field('invoiceDueDays', 'Zahlungsfrist', 'number')}
          {field('prepaymentDueDays', 'Zahlungsfrist Vorauszahlung', 'number')}
          <TextArea label="Zusätzliche Informationen" value={form.additionalInformation} onChange={(value) => setForm({ ...form, additionalInformation: value })} />
          <TextArea label="QR Bill Notizen" value={form.qrBillNotes} onChange={(value) => setForm({ ...form, qrBillNotes: value })} />
          <TextArea label="Rechnungstext" value={form.invoiceText} onChange={(value) => setForm({ ...form, invoiceText: value })} />
          <TextArea label="Zahlungsbedingungen" value={form.paymentTerms} onChange={(value) => setForm({ ...form, paymentTerms: value })} />
          <TextArea label="Zahlungsanweisung" value={form.paymentInstructions} onChange={(value) => setForm({ ...form, paymentInstructions: value })} />
          <TextArea label="Footer Notiz" value={form.footerNote} onChange={(value) => setForm({ ...form, footerNote: value })} />
          <TextArea label="Garantie Text" value={form.warrantyText} onChange={(value) => setForm({ ...form, warrantyText: value })} />
          <TextArea label="Impressum / Signatur" value={form.signatureText} onChange={(value) => setForm({ ...form, signatureText: value })} />
        </div>
      </section>

      <section className="rounded-lg border border-border bg-card p-5">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-black">MWST Einstellungen</h2>
            <p className="text-sm text-muted-foreground">Zentrale Steuerlogik für Warenkorb, Checkout, Bestellung und Rechnung.</p>
          </div>
          <button onClick={saveTax} className="rounded-lg bg-accent px-4 py-2 text-sm font-bold text-accent-foreground">
            MWST speichern
          </button>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Toggle label="MWST aktivieren" checked={tax.enabled} onChange={(value) => setTax({ ...tax, enabled: value })} />
          <Toggle label="Versandkosten versteuern" checked={tax.shippingTaxable} onChange={(value) => setTax({ ...tax, shippingTaxable: value })} />
          <label className="block">
            <span className="mb-2 block text-sm font-bold">Preisdarstellung</span>
            <select value={tax.priceDisplay} onChange={(event) => setTax({ ...tax, priceDisplay: event.target.value as TaxSettings['priceDisplay'] })} className="w-full rounded-lg border border-border bg-background px-3 py-2">
              <option value="inclusive">Preise inklusive MWST</option>
              <option value="exclusive">Preise exklusive MWST</option>
            </select>
          </label>
          <input value={tax.uidNumber} onChange={(event) => setTax({ ...tax, uidNumber: event.target.value })} placeholder="MWST-Nummer / UID" className="rounded-lg border border-border bg-background px-3 py-2" />
          <input value={tax.exemptionText} onChange={(event) => setTax({ ...tax, exemptionText: event.target.value })} placeholder="Text bei deaktivierter MWST" className="rounded-lg border border-border bg-background px-3 py-2 md:col-span-2" />
        </div>
        <div className="mt-6 grid gap-4">
          {tax.rates.map((rate, index) => (
            <div key={rate.id} className="grid gap-3 rounded-lg border border-border bg-background p-4 md:grid-cols-[1.2fr_.7fr_.7fr_.7fr_1fr]">
              <input value={rate.label} onChange={(event) => updateRate(index, { label: event.target.value })} className="rounded border border-border bg-card px-3 py-2" />
              <input type="number" value={rate.percentage} onChange={(event) => updateRate(index, { percentage: Number(event.target.value) })} className="rounded border border-border bg-card px-3 py-2" />
              <Toggle label="Aktiv" checked={rate.active} onChange={(value) => updateRate(index, { active: value })} />
              <Toggle label="Standard" checked={rate.isDefault} onChange={(value) => {
                setTax({ ...tax, rates: tax.rates.map((item, itemIndex) => ({ ...item, isDefault: itemIndex === index ? value : false })) })
              }} />
              <input value={rate.description} onChange={(event) => updateRate(index, { description: event.target.value })} className="rounded border border-border bg-card px-3 py-2" />
            </div>
          ))}
        </div>
      </section>
    </div>
  )

  function updateRate(index: number, patch: Partial<TaxSettings['rates'][number]>) {
    setTax({ ...tax, rates: tax.rates.map((rate, rateIndex) => rateIndex === index ? { ...rate, ...patch } : rate) })
  }
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="flex items-center gap-3 rounded-lg border border-border bg-background px-3 py-3 text-sm font-bold">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      {label}
    </label>
  )
}

function TextArea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <div className="block md:col-span-2">
      <HtmlEditor label={label} value={value} onChange={onChange} minHeightClassName="min-h-32" />
    </div>
  )
}
