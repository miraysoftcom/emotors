'use client'

import { Card, CardContent } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import Link from 'next/link'

const featuredProducts = [
  {
    id: '1',
    title: 'MK Pro Elite',
    price: 2499,
    image: '🛴',
    specs: ['60km Range', '45 km/h', 'Premium Build'],
    featured: true,
  },
  {
    id: '2',
    title: 'MK City Compact',
    price: 1299,
    image: '🛴',
    specs: ['40km Range', '35 km/h', 'Lightweight'],
  },
  {
    id: '3',
    title: 'MK Moped X1',
    price: 3999,
    image: '🛵',
    specs: ['120km Range', '60 km/h', 'Full Featured'],
  },
  {
    id: '4',
    title: 'MK Flex Plus',
    price: 1899,
    image: '🛴',
    specs: ['55km Range', '40 km/h', 'All-Terrain'],
  },
]

export function FeaturedProducts() {
  return (
    <section className="py-20 bg-gradient-to-b from-background to-secondary/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-2xl mb-16">
          <span className="text-accent font-medium text-sm">Our Collection</span>
          <h2 className="prose-heading text-4xl md:text-5xl mb-4 text-balance">
            Featured Vehicles
          </h2>
          <p className="prose-body text-muted-foreground text-lg">
            Discover our premium lineup of electric scooters and e-mopeds, engineered for performance and style.
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <Link key={product.id} href={`/produkte/${product.id}`}>
              <Card
                className={`group overflow-hidden h-full flex flex-col cursor-pointer transition-all hover:shadow-luxury-lg ${
                  product.featured ? 'lg:col-span-2 lg:row-span-2 md:col-span-2' : ''
                }`}
              >
                {/* Image Area */}
                <div className="relative h-48 md:h-64 lg:h-80 bg-gradient-to-br from-primary/5 via-accent/5 to-primary/10 overflow-hidden flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                  <span className={`${product.featured ? 'text-8xl' : 'text-6xl'}`}>
                    {product.image}
                  </span>
                  {product.featured && (
                    <div className="absolute top-4 right-4 px-3 py-1 bg-accent text-accent-foreground rounded-full text-xs font-bold">
                      Featured
                    </div>
                  )}
                </div>

                {/* Content */}
                <CardContent className="flex-1 flex flex-col">
                  <h3 className="font-bold text-lg mb-2 group-hover:text-accent transition-colors">
                    {product.title}
                  </h3>
                  <p className="text-2xl font-bold text-accent mb-4">
                    ${product.price.toLocaleString()}
                  </p>

                  {/* Specs */}
                  <div className="space-y-2 mb-4 flex-1">
                    {product.specs.map((spec, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                        {spec}
                      </div>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={(e) => {
                      e.preventDefault()
                    }}
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <Link href="/produkte">
            <Button variant="primary" size="lg">
              View All Products
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
