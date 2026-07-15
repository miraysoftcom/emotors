'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { resolveProductPrice } from '@/lib/product-price'

interface Product {
  id: number
  slug: string
  title: string
  price: number
  discount_price?: number | null
  discount_percentage?: number | null
  monthly_price?: number | null
  sales_start?: string | Date | null
  sales_end?: string | Date | null
  category_id?: number
}

interface FinancingCalculatorProps {
  products: Product[]
}

export function FinancingCalculator({ products }: FinancingCalculatorProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [downPayment, setDownPayment] = useState(0)
  const [duration, setDuration] = useState(24)
  const [monthlyPayment, setMonthlyPayment] = useState(0)
  const [showResults, setShowResults] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const interestRate = 0.039 // 3.9% APR
  const durations = [12, 24, 36, 48, 60]
  const selectedPricing = selectedProduct ? resolveProductPrice(selectedProduct) : null
  const selectedPrice = selectedPricing?.effectivePrice || 0

  // Calculate monthly payment
  useEffect(() => {
    if (selectedProduct) {
      const productPrice = resolveProductPrice(selectedProduct).effectivePrice
      const principal = productPrice - downPayment
      const monthlyRate = interestRate / 12
      const numerator = monthlyRate * Math.pow(1 + monthlyRate, duration)
      const denominator = Math.pow(1 + monthlyRate, duration) - 1
      const payment = principal * (numerator / denominator)
      setMonthlyPayment(payment)
    }
  }, [selectedProduct, downPayment, duration])

  const filteredProducts = products.filter(
    (p) =>
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: 'CHF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  return (
    <section className="relative py-20 px-4 md:px-8 bg-gradient-to-b from-background via-card/50 to-background">
      {/* Decorative Background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
          className="absolute -top-40 -right-40 w-80 h-80 bg-accent/5 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/5 rounded-full blur-3xl"
        />
      </div>

      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-black tracking-tighter mb-4">
            Finanzierungsrechner
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Berechnen Sie Ihre monatliche Rate für Ihr Wunschfahrzeug. Flexible Finanzierungslösungen ab 0% Zinsen.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Input Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-1"
          >
            <div className="space-y-6 bg-card rounded-2xl p-6 border border-border shadow-lg">
              {/* Product Selection */}
              <div>
                <label className="block text-sm font-semibold mb-3 text-foreground">
                  Fahrzeug auswählen
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Suchen..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2.5 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent transition-all text-sm"
                  />
                </div>

                {searchTerm && filteredProducts.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-xl z-10 max-h-80 overflow-y-auto"
                  >
                    {filteredProducts.map((product) => {
                      const pricing = resolveProductPrice(product)

                      return (
                        <button
                          key={product.id}
                          onClick={() => {
                            setSelectedProduct(product)
                            setSearchTerm('')
                            setDownPayment(0)
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-secondary transition-colors border-b border-border/50 last:border-b-0"
                        >
                        <div className="font-medium text-foreground">{product.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {pricing.hasDiscount && (
                            <span className="mr-2 line-through">{pricing.formattedRegularPrice}</span>
                          )}
                          <span>{pricing.formattedEffectivePrice}</span>
                        </div>
                      </button>
                      )
                    })}
                  </motion.div>
                )}

                {selectedProduct && (
                  <div className="mt-3 p-3 bg-accent/10 border border-accent/20 rounded-xl">
                    <div className="font-semibold text-foreground">{selectedProduct.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {selectedPricing?.hasDiscount && (
                        <span className="mr-2 line-through">{selectedPricing.formattedRegularPrice}</span>
                      )}
                      <span>{selectedPricing?.formattedEffectivePrice}</span>
                    </div>
                  </div>
                )}
              </div>

              {selectedProduct && (
                <>
                  {/* Down Payment */}
                  <div>
                    <label className="block text-sm font-semibold mb-3 text-foreground">
                      Anzahlung
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max={selectedPrice}
                        value={downPayment}
                        onChange={(e) =>
                          setDownPayment(Math.min(parseInt(e.target.value) || 0, selectedPrice))
                        }
                        className="flex-1 px-4 py-2.5 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent transition-all text-sm"
                      />
                      <span className="text-sm font-medium text-muted-foreground">CHF</span>
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">
                      Finanzierungsbetrag: {formatPrice(selectedPrice - downPayment)}
                    </div>
                  </div>

                  {/* Duration */}
                  <div>
                    <label className="block text-sm font-semibold mb-3 text-foreground">
                      Laufzeit
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {durations.map((dur) => (
                        <button
                          key={dur}
                          onClick={() => setDuration(dur)}
                          className={`py-2 px-3 rounded-lg font-medium transition-all text-sm ${
                            duration === dur
                              ? 'bg-accent text-accent-foreground'
                              : 'bg-secondary hover:bg-secondary/80 text-foreground'
                          }`}
                        >
                          {dur} Monate
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Calculate Button */}
                  <button
                    onClick={() => setShowResults(true)}
                    className="w-full py-3 bg-accent text-accent-foreground font-semibold rounded-xl hover:shadow-lg transition-all hover:scale-105"
                  >
                    Berechnen
                  </button>
                </>
              )}

              {!selectedProduct && (
                <div className="text-center text-muted-foreground py-8">
                  Wählen Sie ein Fahrzeug aus, um zu beginnen
                </div>
              )}
            </div>
          </motion.div>

          {/* Right: Results */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2"
          >
            {showResults && selectedProduct ? (
              <div className="space-y-6">
                {/* Result Card */}
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-gradient-to-br from-card to-card/50 border border-accent/20 rounded-2xl p-8 shadow-xl"
                >
                  <h3 className="text-2xl font-black mb-6">Ihre Finanzierung</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 pb-8 border-b border-border">
                    {/* Selected Vehicle */}
                    <div>
                      <div className="text-sm text-muted-foreground mb-2">Ausgewähltes Fahrzeug</div>
                      <div className="text-lg font-semibold text-foreground">
                        {selectedProduct.title}
                      </div>
                    </div>

                    {/* Purchase Price */}
                    <div>
                      <div className="text-sm text-muted-foreground mb-2">Kaufpreis</div>
                      <div className="text-lg font-semibold text-foreground">
                        {selectedPricing?.formattedEffectivePrice}
                      </div>
                    </div>

                    {/* Down Payment */}
                    <div>
                      <div className="text-sm text-muted-foreground mb-2">Anzahlung</div>
                      <div className="text-lg font-semibold text-foreground">
                        {formatPrice(downPayment)}
                      </div>
                    </div>

                    {/* Financing Amount */}
                    <div>
                      <div className="text-sm text-muted-foreground mb-2">Finanzierungsbetrag</div>
                      <div className="text-lg font-semibold text-foreground">
                        {formatPrice(selectedPrice - downPayment)}
                      </div>
                    </div>

                    {/* Duration */}
                    <div>
                      <div className="text-sm text-muted-foreground mb-2">Laufzeit</div>
                      <div className="text-lg font-semibold text-foreground">{duration} Monate</div>
                    </div>

                    {/* Interest Rate */}
                    <div>
                      <div className="text-sm text-muted-foreground mb-2">Zinssatz</div>
                      <div className="text-lg font-semibold text-foreground">
                        {(interestRate * 100).toFixed(1)}% p.a.
                      </div>
                    </div>
                  </div>

                  {/* Monthly Payment */}
                  <div className="bg-accent/10 border border-accent/30 rounded-xl p-6 mb-6">
                    <div className="text-sm text-muted-foreground mb-2">Ihre voraussichtliche Rate</div>
                    <div className="text-5xl font-black text-accent mb-2">
                      {formatPrice(monthlyPayment)}
                    </div>
                    <div className="text-sm text-muted-foreground">pro Monat</div>
                  </div>

                  {/* CTA Buttons */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Link
                      href={`/financing-application?product=${selectedProduct.slug}&price=${selectedPrice}&downPayment=${downPayment}&duration=${duration}&monthly=${Math.round(monthlyPayment)}`}
                      className="py-3 px-4 bg-accent text-accent-foreground font-semibold rounded-xl hover:shadow-lg transition-all text-center hover:scale-105"
                    >
                      Finanzierung anfragen
                    </Link>
                    <Link
                      href="/contact"
                      className="py-3 px-4 border-2 border-accent text-accent font-semibold rounded-xl hover:bg-accent/10 transition-all text-center"
                    >
                      Beratung erhalten
                    </Link>
                  </div>
                </motion.div>

                {/* Disclaimer */}
                <div className="bg-card border border-border rounded-xl p-6 text-sm text-muted-foreground">
                  <p className="leading-relaxed">
                    Die unten angezeigte Ratenzahlung dient nur als Beispielrechnung. Die tatsächliche
                    monatliche Rate kann je nach Fahrzeug, Laufzeit, Anzahlung und individuellen
                    Finanzierungskonditionen niedriger oder höher ausfallen. Die endgültige Finanzierung
                    wird nach Prüfung Ihrer Anfrage individuell berechnet.
                  </p>
                </div>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-card rounded-2xl p-12 border border-border text-center"
              >
                <div className="text-6xl mb-4">📊</div>
                <p className="text-muted-foreground">
                  Wählen Sie ein Fahrzeug aus und konfigurieren Sie Ihre Finanzierung
                </p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
