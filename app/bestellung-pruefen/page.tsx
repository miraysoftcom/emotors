'use client'

import { useState } from 'react'
import { SearchCheck } from 'lucide-react'
import { LuxuryHeader } from '@/components/navigation/LuxuryHeader'
import { Footer } from '@/components/navigation/Footer'
import { OrderSummaryView } from '@/components/orders/OrderSummaryView'
import type { StoredOrder } from '@/lib/orders-store'

export default function BestellungPruefenPage() {
  const [orderNumber, setOrderNumber] = useState('')
  const [email, setEmail] = useState('')
  const [order, setOrder] = useState<StoredOrder | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const verifyOrder = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    setOrder(null)

    const response = await fetch('/api/orders/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderNumber, email }),
    })
    const data = await response.json()
    setLoading(false)

    if (!response.ok) {
      setError(data.error || 'Es konnte keine passende Bestellung gefunden werden. Bitte überprüfen Sie Ihre Angaben.')
      return
    }
    setOrder(data.order)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background-secondary to-background">
      <LuxuryHeader />
      <section className="mx-auto max-w-5xl px-4 pb-20 pt-32">
        <div className="mb-8 text-center">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-accent">
            <SearchCheck className="h-4 w-4" />
            Bestellung überprüfen
          </p>
          <h1 className="text-4xl font-black">Bestellung prüfen</h1>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
            Geben Sie Ihre Bestellnummer und die beim Kauf verwendete E-Mail-Adresse ein.
          </p>
        </div>

        <form onSubmit={verifyOrder} className="theme-card mx-auto mb-8 grid max-w-3xl gap-4 p-5 md:grid-cols-[1fr_1fr_auto]">
          <input
            value={orderNumber}
            onChange={(event) => setOrderNumber(event.target.value)}
            placeholder="Bestellnummer"
            className="rounded-lg border border-border bg-input px-4 py-3"
            required
          />
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="E-Mail-Adresse"
            className="rounded-lg border border-border bg-input px-4 py-3"
            required
          />
          <button disabled={loading} className="rounded-lg bg-accent px-5 py-3 font-bold text-accent-foreground disabled:opacity-60">
            {loading ? 'Prüfen...' : 'Bestellung prüfen'}
          </button>
        </form>

        {error && <div className="mx-auto mb-8 max-w-3xl rounded-lg border p-4 text-sm status-error">{error}</div>}
        {order && <OrderSummaryView order={order} email={email} />}
      </section>
      <Footer />
    </main>
  )
}
