'use client'

import { LuxuryHeader } from '@/components/navigation/LuxuryHeader'
import { Footer } from '@/components/navigation/Footer'
import { TestDriveModal } from '@/components/modals/TestDriveModal'
import { QuestionModal } from '@/components/modals/QuestionModal'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useState } from 'react'

const productData: Record<string, any> = {
  'city-go-x-carplay': {
    title: 'City Go X CarPlay',
    price: 3890,
    monthly: 98,
    discount: 0,
    image: '🛴',
    category: 'E-Roller',
    badge: 'Ohne Führerschein',
    description:
      'Der City Go X CarPlay verbindet moderne Technologie mit alltäglicher Praktikabilität. Mit dem integrierten CarPlay-System haben Sie Zugriff auf Navigation, Musik und Kommunikation.',
    specs: {
      'Motorleistung': '500W',
      'Reichweite': '50 km',
      'Höchstgeschwindigkeit': '25 km/h',
      'Akkukapazität': '36V/10Ah',
      'Gewicht': '120 kg',
      'Ladedauer': '4-6 Stunden',
      'Max. Belastung': '150 kg',
      'Farben': 'Schwarz, Weiss',
    },
    features: [
      'CarPlay Integration',
      'LED Display',
      'Federung vorne und hinten',
      'Scheibenbremsen',
      'Wasserfest (IPX4)',
      'Lichtsystem integriert',
    ],
    financing: [
      { months: 12, monthly: 98, total: 1176, apr: '0%' },
      { months: 24, monthly: 52, total: 1248, apr: '3%' },
      { months: 36, monthly: 38, total: 1368, apr: '5%' },
    ],
  },
  'mk-city-go': {
    title: 'MK City Go',
    price: 3690,
    monthly: 88,
    discount: 6,
    image: '🛴',
    category: 'E-Roller',
    badge: 'Ohne Führerschein',
    description: 'Der MK City Go ist der perfekte Begleiter für urbane Mobilität mit einer optimalen Balance zwischen Leistung und Preis.',
    specs: {
      'Motorleistung': '600W',
      'Reichweite': '50 km',
      'Höchstgeschwindigkeit': '25 km/h',
      'Akkukapazität': '36V/10Ah',
      'Gewicht': '125 kg',
      'Ladedauer': '3-5 Stunden',
      'Max. Belastung': '140 kg',
      'Farben': 'Schwarz, Grau',
    },
    features: [
      'LED Display mit Echtzeit-Daten',
      'Federung vorne',
      'Scheibenbremsen vorne und hinten',
      'Regenschutz (IPX3)',
      'Lichtsystem',
      'Fussbremse + Motorbremsе',
    ],
    financing: [
      { months: 12, monthly: 88, total: 1056, apr: '0%' },
      { months: 24, monthly: 48, total: 1152, apr: '3%' },
      { months: 36, monthly: 35, total: 1260, apr: '5%' },
    ],
  },
}

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  const product = productData[params.slug] || productData['mk-city-go']
  const [selectedMonth, setSelectedMonth] = useState(12)
  const [testDriveOpen, setTestDriveOpen] = useState(false)
  const [questionOpen, setQuestionOpen] = useState(false)
  const selected = product.financing.find((f: any) => f.months === selectedMonth)

  return (
    <main className="w-full bg-background">
      <LuxuryHeader />

      {/* Hero Image Section */}
      <section className="relative w-full h-96 md:h-screen bg-secondary flex items-center justify-center overflow-hidden pt-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="text-[300px] md:text-[500px]"
        >
          {product.image}
        </motion.div>
      </section>

      {/* Product Information */}
      <section className="py-20 px-4 md:px-8 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="mb-6">
                <span className="inline-block px-3 py-1 bg-secondary text-foreground text-sm font-semibold rounded-full mb-4">
                  {product.badge}
                </span>
              </div>

              <h1 className="text-5xl md:text-6xl font-black tracking-tighter mb-6">
                {product.title}
              </h1>

              <div
                className="managed-page-content mb-8 text-xl leading-relaxed text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />

              {/* Price */}
              <div className="mb-8 p-6 bg-card border border-border rounded-2xl">
                <div className="flex items-baseline gap-4 mb-2">
                  <span className="text-5xl font-black text-accent">
                    CHF {product.price.toLocaleString()}
                  </span>
                  {product.discount > 0 && (
                    <span className="text-lg line-through text-muted-foreground">
                      CHF {Math.round(product.price / (1 - product.discount / 100)).toLocaleString()}
                    </span>
                  )}
                </div>
                <p className="text-muted-foreground">
                  Ab CHF {product.monthly} / Monat bei Finanzierung
                </p>
              </div>

              {/* Features */}
              <div className="mb-8">
                <h3 className="text-2xl font-black mb-4">Highlights</h3>
                <div className="grid grid-cols-2 gap-3">
                  {product.features.map((feature: string, idx: number) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex items-start gap-3"
                    >
                      <span className="text-accent font-bold">✓</span>
                      <span className="text-foreground">{feature}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Right Sidebar - Financing & CTA */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="sticky top-32 h-fit"
            >
              {/* Financing Calculator */}
              <div className="mb-8 p-8 bg-card border border-border rounded-2xl space-y-6">
                <h3 className="text-2xl font-black">Finanzierung</h3>

                <div className="space-y-3">
                  {product.financing.map((option: any) => (
                    <button
                      key={option.months}
                      onClick={() => setSelectedMonth(option.months)}
                      className={`w-full p-4 rounded-lg border-2 transition-all ${
                        selectedMonth === option.months
                          ? 'border-accent bg-accent/10'
                          : 'border-border hover:border-accent'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div className="text-left">
                          <div className="font-bold">{option.months} Monate</div>
                          <div className="text-sm text-muted-foreground">{option.apr} APR</div>
                        </div>
                        <div className="text-right font-bold">CHF {option.monthly} / Mt.</div>
                      </div>
                    </button>
                  ))}
                </div>

                {selected && (
                  <div className="pt-4 border-t border-border space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Monatliche Rate:</span>
                      <span className="font-bold">CHF {selected.monthly}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Gesamtbetrag:</span>
                      <span className="font-bold">CHF {selected.total.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-accent font-bold">
                      <span>Ersparnisse:</span>
                      <span>CHF {(selected.total - product.price).toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* CTA Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => {
                    // Pass product data to checkout via URL params
                    const params = new URLSearchParams({
                      productId: product.id?.toString() || params.slug,
                      slug: params.slug,
                      title: product.title,
                      price: product.price?.toString() || '0',
                      quantity: '1',
                    })
                    window.location.href = `/checkout?${params.toString()}`
                  }}
                  className="w-full py-4 px-6 bg-accent text-accent-foreground font-bold rounded-xl hover:shadow-lg transition-all"
                >
                  Jetzt Kaufen
                </button>
                <button
                  onClick={() => setTestDriveOpen(true)}
                  className="w-full py-4 px-6 border-2 border-accent text-accent font-bold rounded-xl hover:bg-accent/5 transition-all"
                >
                  Probefahrt Anfragen
                </button>
                <button
                  onClick={() => setQuestionOpen(true)}
                  className="w-full py-4 px-6 border-2 border-border text-foreground font-bold rounded-xl hover:bg-secondary transition-all"
                >
                  Frage Stellen
                </button>
              </div>
            </motion.div>
          </div>

          {/* Specifications */}
          <div className="mt-20 pt-20 border-t border-border">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl font-black mb-12">Technische Daten</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {Object.entries(product.specs).map(([key, value]: [string, any]) => (
                  <div key={key} className="p-6 bg-card border border-border rounded-2xl">
                    <div className="text-sm text-muted-foreground mb-2">{key}</div>
                    <div className="text-xl font-black text-accent">{value}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />

      {/* Modals */}
      <TestDriveModal
        isOpen={testDriveOpen}
        onClose={() => setTestDriveOpen(false)}
        productName={product.title}
        productId={params.slug}
      />
      <QuestionModal
        isOpen={questionOpen}
        onClose={() => setQuestionOpen(false)}
        productName={product.title}
        productId={params.slug}
      />
    </main>
  )
}
