'use client'

import { LuxuryHeader } from '@/components/navigation/LuxuryHeader'
import { Footer } from '@/components/navigation/Footer'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useState, useMemo } from 'react'

const products = [
  {
    id: 1,
    slug: 'city-go-x-carplay',
    title: 'City Go X CarPlay',
    price: 3890,
    monthly: 98,
    image: '🛴',
    badge: 'Ohne Führerschein',
    category: 'E-Roller',
    specs: { speed: '25 km/h', range: '50 km', power: '500W' },
    colors: ['Schwarz', 'Weiss'],
  },
  {
    id: 2,
    slug: 'miku-max',
    title: 'Miku Max',
    price: 3850,
    monthly: 88,
    image: '🛴',
    badge: 'Ohne Führerschein',
    category: 'E-Roller',
    specs: { speed: '25 km/h', range: '55 km', power: '600W' },
    colors: ['Schwarz'],
  },
  {
    id: 3,
    slug: 'mk-city-go',
    title: 'MK City Go',
    price: 3690,
    monthly: 88,
    discount: 6,
    image: '🛴',
    badge: 'Ohne Führerschein',
    category: 'E-Roller',
    specs: { speed: '25 km/h', range: '50 km', power: '600W' },
    colors: ['Schwarz', 'Grau'],
    rating: 5,
  },
  {
    id: 4,
    slug: 'mk-city-s',
    title: 'MK City S',
    price: 3490,
    monthly: 91,
    image: '🛴',
    badge: 'Ohne Führerschein',
    category: 'E-Roller',
    specs: { speed: '25 km/h', range: '45 km', power: '500W' },
    colors: ['Schwarz'],
  },
  {
    id: 5,
    slug: 'mk-drive',
    title: 'MK Drive',
    price: 1990,
    monthly: 52,
    image: '🛴',
    badge: 'Ohne Führerschein',
    category: 'E-Roller',
    specs: { speed: '20 km/h', range: '30 km', power: '350W' },
    colors: ['Schwarz', 'Weiss'],
  },
  {
    id: 6,
    slug: 'mk-eco-mini',
    title: 'MK Eco Mini',
    price: 9900,
    monthly: 206,
    discount: 23,
    image: '🛵',
    badge: 'Ohne Führerschein',
    category: 'Kabinenroller',
    specs: { speed: '25 km/h', range: '60 km', power: '1000W' },
    colors: ['Rot', 'Grau'],
  },
  {
    id: 7,
    slug: 'mk-i-tango-swiss',
    title: 'MK I-Tango Swiss',
    price: 7500,
    monthly: 241,
    discount: 7,
    image: '🛵',
    badge: 'Ohne Führerschein',
    category: 'Kabinenroller',
    specs: { speed: '25 km/h', range: '80 km', power: '1200W' },
    colors: ['Schwarz'],
  },
  {
    id: 8,
    slug: 'mk-kabinenroller',
    title: 'MK Kabinenroller',
    price: 6990,
    monthly: 158,
    discount: 6,
    image: '🛵',
    badge: 'Ohne Führerschein',
    category: 'Kabinenroller',
    specs: { speed: '25 km/h', range: '70 km', power: '800W' },
    colors: ['Grau', 'Weiss'],
  },
  {
    id: 9,
    slug: 'mk-nova-x-carplay',
    title: 'MK Nova X CarPlay',
    price: 3890,
    monthly: 89,
    image: '🛴',
    badge: 'Ohne Führerschein',
    category: 'E-Roller',
    specs: { speed: '25 km/h', range: '52 km', power: '600W' },
    colors: ['Schwarz', 'Silber'],
  },
  {
    id: 10,
    slug: 'mk-premium-6-0',
    title: 'MK Premium 6.0',
    price: 4890,
    monthly: 138,
    discount: 5,
    image: '🛴',
    badge: 'Ohne Führerschein',
    category: 'E-Roller',
    specs: { speed: '25 km/h', range: '60 km', power: '700W' },
    colors: ['Schwarz', 'Gold'],
  },
  {
    id: 11,
    slug: 'mk-racing',
    title: 'MK Racing',
    price: 4390,
    monthly: 122,
    image: '🛴',
    badge: 'Ohne Führerschein',
    category: 'E-Roller',
    specs: { speed: '45 km/h', range: '60 km', power: '1000W' },
    colors: ['Rot', 'Schwarz'],
  },
  {
    id: 12,
    slug: 'mk-stratos',
    title: 'MK Stratos',
    price: 3690,
    monthly: 98,
    image: '🛴',
    badge: 'Ohne Führerschein',
    category: 'E-Roller',
    specs: { speed: '25 km/h', range: '50 km', power: '600W' },
    colors: ['Schwarz'],
  },
  {
    id: 13,
    slug: 'mk-super-chopper',
    title: 'MK Super Chopper',
    price: 3599,
    monthly: 96,
    image: '🛴',
    badge: 'Ohne Führerschein',
    category: 'E-Roller',
    specs: { speed: '25 km/h', range: '48 km', power: '550W' },
    colors: ['Schwarz', 'Chrom'],
  },
  {
    id: 14,
    slug: 'mk-superblade-1-0',
    title: 'MK Superblade 1.0',
    price: 5290,
    monthly: 152,
    discount: 4,
    image: '🛴',
    badge: 'Ohne Führerschein',
    category: 'E-Roller',
    specs: { speed: '45 km/h', range: '70 km', power: '1200W' },
    colors: ['Blau', 'Schwarz'],
  },
  {
    id: 15,
    slug: 'mk-supercharger',
    title: 'MK Supercharger',
    price: 8000,
    monthly: 233,
    discount: 3,
    image: '🛵',
    badge: 'Ohne Führerschein',
    category: 'Kabinenroller',
    specs: { speed: '45 km/h', range: '100 km', power: '1500W' },
    colors: ['Rot'],
  },
  {
    id: 16,
    slug: 'mk-suv-3-0-s',
    title: 'MK SUV 3.0 S',
    price: 3890,
    monthly: 102,
    image: '🛵',
    badge: 'Ohne Führerschein',
    category: 'SUV-Roller',
    specs: { speed: '25 km/h', range: '65 km', power: '800W' },
    colors: ['Grau', 'Schwarz'],
  },
  {
    id: 17,
    slug: 'mk-urban-wave',
    title: 'MK Urban Wave',
    price: 999,
    image: '🛹',
    badge: 'Ohne Führerschein',
    category: 'Escooter',
    specs: { speed: '25 km/h', range: '40 km', power: '350W' },
    colors: ['Schwarz', 'Weiss'],
  },
  {
    id: 18,
    slug: 'next-1',
    title: 'NEXT 1',
    price: 3790,
    monthly: 105,
    discount: 9,
    image: '🛴',
    badge: 'Ohne Führerschein',
    category: 'E-Roller',
    specs: { speed: '25 km/h', range: '55 km', power: '600W' },
    colors: ['Schwarz'],
  },
  {
    id: 19,
    slug: 'sky-2-rs',
    title: 'Sky 2 RS',
    price: 3890,
    monthly: 110,
    discount: 8,
    image: '🛴',
    badge: 'Ohne Führerschein',
    category: 'E-Roller',
    specs: { speed: '45 km/h', range: '58 km', power: '1000W' },
    colors: ['Blau', 'Schwarz'],
  },
  {
    id: 20,
    slug: 'sky-iii',
    title: 'Sky III',
    price: 3890,
    monthly: 96,
    image: '🛴',
    badge: 'Ohne Führerschein',
    category: 'E-Roller',
    specs: { speed: '25 km/h', range: '55 km', power: '600W' },
    colors: ['Grau', 'Schwarz'],
  },
]

export default function OhneFuehrerscheinPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('Alle')
  const [priceRange, setPriceRange] = useState([0, 10000])
  const [sortBy, setSortBy] = useState('featured')

  const categories = ['Alle', ...new Set(products.map((p) => p.category))]

  const filtered = useMemo(() => {
    let result = products

    if (selectedCategory !== 'Alle') {
      result = result.filter((p) => p.category === selectedCategory)
    }

    result = result.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1])

    if (sortBy === 'price-asc') {
      result.sort((a, b) => a.price - b.price)
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.price - a.price)
    } else if (sortBy === 'newest') {
      result.reverse()
    }

    return result
  }, [selectedCategory, priceRange, sortBy])

  return (
    <main className="w-full bg-background">
      <LuxuryHeader />

      {/* Hero */}
      <section className="pt-32 pb-12 px-4 md:px-8 bg-secondary">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter mb-4">
              Ohne Fuehrerschein
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Premium Elektromobilitaet fuer alle – entdecken Sie unsere Kollektion an Fahrzeugen,
              die Sie ganz ohne Fuehrerschein fahren koennen.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-20 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <motion.aside
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-1"
            >
              <div className="space-y-8 sticky top-32">
                {/* Categories */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Kategorien</h3>
                  <div className="space-y-2">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`block w-full text-left px-3 py-2 rounded-lg transition-all ${
                          selectedCategory === cat
                            ? 'bg-accent text-accent-foreground font-semibold'
                            : 'text-foreground hover:bg-secondary'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Preis</h3>
                  <div className="space-y-3">
                    <input
                      type="range"
                      min="0"
                      max="10000"
                      step="100"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                      className="w-full"
                    />
                    <div className="text-sm text-muted-foreground">
                      CHF {priceRange[0].toLocaleString()} - CHF {priceRange[1].toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Sort */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Sortieren</h3>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground"
                  >
                    <option value="featured">Empfohlen</option>
                    <option value="newest">Neueste</option>
                    <option value="price-asc">Preis: Niedrig → Hoch</option>
                    <option value="price-desc">Preis: Hoch → Niedrig</option>
                  </select>
                </div>
              </div>
            </motion.aside>

            {/* Products Grid */}
            <div className="lg:col-span-3">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                    className="group"
                  >
                    <Link href={`/produkt/${product.slug}`}>
                      <div className="relative bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 h-full flex flex-col">
                        {/* Image */}
                        <div className="relative w-full h-64 bg-secondary flex items-center justify-center overflow-hidden">
                          {product.discount && (
                            <div className="absolute top-4 right-4 bg-accent text-accent-foreground px-3 py-1 rounded-full text-sm font-semibold z-10">
                              -{product.discount}%
                            </div>
                          )}
                          <motion.div
                            className="text-8xl group-hover:scale-110 transition-transform duration-300"
                            whileHover={{ scale: 1.15 }}
                          >
                            {product.image}
                          </motion.div>
                        </div>

                        {/* Content */}
                        <div className="p-6 flex-1 flex flex-col">
                          <div className="mb-3">
                            <span className="inline-block px-2 py-1 bg-secondary text-foreground text-xs font-semibold rounded-full">
                              {product.badge}
                            </span>
                          </div>

                          <h3 className="text-xl font-bold mb-2 group-hover:text-accent transition-colors">
                            {product.title}
                          </h3>

                          <div className="mb-4 space-y-1 text-sm text-muted-foreground">
                            <div>⚡ {product.specs.power}</div>
                            <div>🔋 {product.specs.range}</div>
                            <div>🏃 {product.specs.speed}</div>
                          </div>

                          <div className="mt-auto space-y-3">
                            <div className="flex items-baseline justify-between">
                              <span className="text-2xl font-black">CHF {product.price.toLocaleString()}</span>
                            </div>
                            {product.monthly && (
                              <div className="text-sm text-accent font-semibold">
                                CHF {product.monthly} / Monat
                              </div>
                            )}

                            <div className="flex gap-2 pt-2">
                              <button className="flex-1 px-4 py-2 bg-accent text-accent-foreground font-semibold rounded-lg hover:opacity-90 transition-all text-sm">
                                Details
                              </button>
                              <button className="flex-1 px-4 py-2 border border-accent text-accent font-semibold rounded-lg hover:bg-accent/5 transition-all text-sm">
                                Finanzierung
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>

              {filtered.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground text-lg">Keine Produkte gefunden</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
