'use client'

import { LuxuryHeader } from '@/components/navigation/LuxuryHeader'
import { Footer } from '@/components/navigation/Footer'
import { useState, useEffect, Suspense } from 'react'
import { motion } from 'framer-motion'
import { useSearchParams } from 'next/navigation'

function FinancingApplicationContent() {
  const searchParams = useSearchParams()
  const [mounted, setMounted] = useState(false)
  const [product, setProduct] = useState('')
  const [price, setPrice] = useState('0')
  const [downPayment, setDownPayment] = useState('0')
  const [duration, setDuration] = useState('24')
  const [monthly, setMonthly] = useState('0')

  useEffect(() => {
    if (searchParams) {
      setProduct(searchParams.get('product') || '')
      setPrice(searchParams.get('price') || '0')
      setDownPayment(searchParams.get('downPayment') || '0')
      setDuration(searchParams.get('duration') || '24')
      setMonthly(searchParams.get('monthly') || '0')
    }
    setMounted(true)
  }, [searchParams])

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    zipCode: '',
    city: '',
    message: '',
    agreeTerms: false,
  })

  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/financing-application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          product,
          price: parseInt(price),
          downPayment: parseInt(downPayment),
          duration: parseInt(duration),
          monthlyPayment: parseInt(monthly),
        }),
      })

      if (response.ok) {
        setSubmitted(true)
        setTimeout(() => {
          window.location.href = '/'
        }, 3000)
      }
    } catch (error) {
      console.error('Error submitting application:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (value: string) => {
    const num = parseInt(value)
    return new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: 'CHF',
      minimumFractionDigits: 0,
    }).format(num)
  }

  if (!mounted) {
    return (
      <main className="w-full bg-background">
        <LuxuryHeader />
        <section className="pt-40 pb-20 px-4 md:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="h-96 bg-card rounded-2xl animate-pulse" />
          </div>
        </section>
        <Footer />
      </main>
    )
  }

  return (
    <main className="w-full bg-background">
      <LuxuryHeader />

      <section className="pt-40 pb-20 px-4 md:px-8">
        <div className="max-w-3xl mx-auto">
          {submitted ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-card border-2 border-accent rounded-2xl p-12 text-center"
            >
              <div className="text-6xl mb-4">✓</div>
              <h2 className="text-3xl font-black mb-4">Anfrage eingegangen!</h2>
              <p className="text-muted-foreground mb-6">
                Vielen Dank für Ihre Finanzierungsanfrage. Wir werden Sie in Kürze kontaktieren.
              </p>
              <p className="text-sm text-muted-foreground">Sie werden automatisch weitergeleitet...</p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="text-center mb-12">
                <h1 className="text-5xl font-black mb-4">Finanzierungsanfrage</h1>
                <p className="text-muted-foreground">
                  Bitte ergänzen Sie Ihre Daten für die Finanzierungsanfrage
                </p>
              </div>

              {/* Summary Card */}
              <div className="bg-card border border-border rounded-2xl p-6 mb-8">
                <h3 className="font-semibold mb-4">Ihre Auswahl:</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Fahrzeug</div>
                    <div className="font-semibold">{product}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Kaufpreis</div>
                    <div className="font-semibold">{formatPrice(price)}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Laufzeit</div>
                    <div className="font-semibold">{duration} Monate</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Monatliche Rate</div>
                    <div className="font-semibold text-accent">{formatPrice(monthly)}</div>
                  </div>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6 bg-card rounded-2xl p-8 border border-border">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Vorname *</label>
                    <input
                      type="text"
                      name="firstName"
                      required
                      value={formData.firstName}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Nachname *</label>
                    <input
                      type="text"
                      name="lastName"
                      required
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2">E-Mail *</label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Telefon *</label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Adresse *</label>
                  <input
                    type="text"
                    name="address"
                    required
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Postleitzahl *</label>
                    <input
                      type="text"
                      name="zipCode"
                      required
                      value={formData.zipCode}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Stadt *</label>
                    <input
                      type="text"
                      name="city"
                      required
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Nachricht</label>
                  <textarea
                    name="message"
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent transition-all resize-none"
                    placeholder="Weitere Informationen oder Fragen..."
                  />
                </div>

                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    name="agreeTerms"
                    id="agreeTerms"
                    required
                    checked={formData.agreeTerms}
                    onChange={handleChange}
                    className="mt-1 w-4 h-4 rounded border-border focus:ring-accent"
                  />
                  <label htmlFor="agreeTerms" className="text-sm text-muted-foreground">
                    Ich bin mit den Datenschutzbestimmungen einverstanden und möchte von MK-eMotors Dornach
                    Informationen zu Finanzierungsmöglichkeiten erhalten.
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-accent text-accent-foreground font-semibold rounded-lg hover:shadow-lg transition-all hover:scale-105 disabled:opacity-50"
                >
                  {loading ? 'Wird übermittelt...' : 'Anfrage senden'}
                </button>
              </form>
            </motion.div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}

export default function FinancingApplicationPage() {
  return (
    <Suspense fallback={
      <main className="w-full bg-background">
        <div className="h-screen flex items-center justify-center">
          <div className="animate-pulse">Wird geladen...</div>
        </div>
      </main>
    }>
      <FinancingApplicationContent />
    </Suspense>
  )
}
