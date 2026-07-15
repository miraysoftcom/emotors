'use client'

import { Card, CardContent } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import Link from 'next/link'

interface BikeProduct {
  id: string
  name: string
  model: string
  emoji: string
  topSpeed: string
  power: string
  price: string
}

const bikes: BikeProduct[] = [
  {
    id: '1',
    name: 'YAMAHA',
    model: 'YZF-R6',
    emoji: '🏍️',
    topSpeed: '299 KM/H',
    power: '118 HP',
    price: '$12,999',
  },
  {
    id: '2',
    name: 'KAWASAKI',
    model: 'Ninja ZX-10R',
    emoji: '🏍️',
    topSpeed: '300 KM/H',
    power: '203 HP',
    price: '$15,299',
  },
  {
    id: '3',
    name: 'SUZUKI',
    model: 'GSX-R1000',
    emoji: '🏍️',
    topSpeed: '298 KM/H',
    power: '202 HP',
    price: '$14,899',
  },
  {
    id: '4',
    name: 'DUCATI',
    model: 'Panigale V4',
    emoji: '🏍️',
    topSpeed: '299 KM/H',
    power: '214 HP',
    price: '$16,499',
  },
]

export function AggressiveFeaturedProducts() {
  return (
    <section className="relative py-32 bg-background overflow-hidden">
      {/* Section Indicator */}
      <div className="section-indicator">02</div>

      {/* Background Accent */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl -translate-x-1/2" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="space-y-4 mb-16">
          <p className="text-accent font-black uppercase tracking-widest text-sm">
            ➤ Our Collection
          </p>
          <h2 className="hero-text text-5xl md:text-6xl font-black leading-tight">
            All Types
            <br />
            Sport Bikes
          </h2>
          <div className="w-20 h-1 bg-accent" />
          <p className="text-muted-foreground max-w-2xl leading-relaxed">
            We provide a wide range of bike of different types. Premium engineering meets aggressive design.
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {bikes.map((bike) => (
            <Card
              key={bike.id}
              className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-accent/50 border-border hover:border-accent"
            >
              <CardContent className="p-0">
                {/* Image Area */}
                <div className="h-48 bg-gradient-to-br from-secondary via-secondary to-secondary/50 overflow-hidden flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <span className="text-6xl">{bike.emoji}</span>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-accent mb-1">
                      {bike.name}
                    </p>
                    <h3 className="font-black text-xl uppercase tracking-tight group-hover:text-accent transition-colors">
                      {bike.model}
                    </h3>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2 py-3 border-y border-border">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase font-bold">Top Speed</p>
                      <p className="font-black text-accent text-sm">{bike.topSpeed}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase font-bold">Power</p>
                      <p className="font-black text-accent text-sm">{bike.power}</p>
                    </div>
                  </div>

                  {/* Price & Button */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-black text-xl text-accent">{bike.price}</span>
                    </div>
                    <Link href={`/produkte/${bike.id}`} className="block">
                      <Button
                        variant="primary"
                        size="sm"
                        className="w-full font-black uppercase tracking-widest aggressive-button-hover"
                      >
                        View Bike
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Horizontal Divider */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <div className="w-20 h-1 bg-accent/30" />
          <Link href="/produkte">
            <Button size="lg" className="gap-2 font-black uppercase tracking-widest aggressive-button-hover">
              View All Bikes →
            </Button>
          </Link>
          <div className="w-20 h-1 bg-accent/30" />
        </div>
      </div>
    </section>
  )
}
