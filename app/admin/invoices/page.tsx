'use client'

import { useEffect, useState } from 'react'
import { Download, Eye, RefreshCw } from 'lucide-react'
import { formatMoney } from '@/lib/money'

interface Invoice {
  id: number
  invoiceNumber: string
  orderNumber: string
  status: string
  paymentMethod: string
  amount: number
  currency: 'CHF' | 'EUR'
  dueDate: string
  createdAt: string
}

export default function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)

  const loadInvoices = async () => {
    setLoading(true)
    const res = await fetch('/api/admin/invoices', { cache: 'no-store' })
    const data = await res.json()
    setInvoices(data.invoices || [])
    setLoading(false)
  }

  useEffect(() => {
    loadInvoices()
  }, [])

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Rechnungen</h1>
          <p className="text-muted-foreground">Swiss QR-Rechnungen und Zahlungsstatus verwalten</p>
        </div>
        <button onClick={loadInvoices} className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 font-bold">
          <RefreshCw className="h-4 w-4" />
          Aktualisieren
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="px-4 py-3 text-left">Rechnungsnummer</th>
              <th className="px-4 py-3 text-left">Bestellnummer</th>
              <th className="px-4 py-3 text-left">Betrag</th>
              <th className="px-4 py-3 text-left">Zahlungsart</th>
              <th className="px-4 py-3 text-left">Fällig</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-right">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => (
              <tr key={invoice.id} className="border-b border-border">
                <td className="px-4 py-3 font-bold">{invoice.invoiceNumber}</td>
                <td className="px-4 py-3">{invoice.orderNumber}</td>
                <td className="px-4 py-3">{formatMoney(invoice.amount, invoice.currency)}</td>
                <td className="px-4 py-3">{invoice.paymentMethod}</td>
                <td className="px-4 py-3">{new Date(invoice.dueDate).toLocaleDateString('de-CH')}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-secondary px-3 py-1 text-xs font-bold">{invoice.status}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <a target="_blank" href={`/api/admin/invoices/${invoice.id}/download?format=html`} className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 font-bold hover:border-accent">
                      <Eye className="h-4 w-4" />
                      Anzeigen
                    </a>
                    <a href={`/api/admin/invoices/${invoice.id}/download`} className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 font-bold hover:border-accent">
                      <Download className="h-4 w-4" />
                      PDF
                    </a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && invoices.length === 0 && (
          <div className="p-10 text-center text-muted-foreground">Noch keine Rechnungen vorhanden.</div>
        )}
        {loading && <div className="p-10 text-center text-muted-foreground">Wird geladen...</div>}
      </div>
    </div>
  )
}
