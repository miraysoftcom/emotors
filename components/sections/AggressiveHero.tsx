'use client'

import { Button } from '@/components/common/Button'
import { ChevronRight } from 'lucide-react'
import { useEffect, useState } from 'react'

export function AggressiveHero() {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-background via-secondary to-background overflow-hidden pt-20">
      {/* Section Indicator */}
      <div className="section-indicator">01</div>

      {/* Diagonal Overlay */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-l from-accent/10 to-transparent skew-x-12 transform translate-x-1/3" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-20 relative z-10">
        {/* Left Content */}
        <div className={`space-y-8 ${isLoaded ? 'animate-slide-in-left' : 'opacity-0'}`}>
          <div className="space-y-4">
            <p className="text-accent font-black uppercase tracking-widest text-sm">
              ➤ Best Sports Bike
            </p>
            <h1 className="hero-text text-5xl md:text-7xl font-black leading-tight">
              YAMAHA
              <br />
              YZF-R6
            </h1>
            <div className="w-20 h-1 bg-accent" />
          </div>

          <p className="text-lg text-muted-foreground max-w-md leading-relaxed">
            Experience extreme performance and aggressive styling. Built for racers, loved by riders. Pure speed. Pure power. Pure adrenaline.
          </p>

          {/* Features Grid */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="text-accent font-black text-2xl">599</div>
              <p className="text-xs uppercase font-bold tracking-widest text-muted-foreground">KM/H</p>
            </div>
            <div className="space-y-2">
              <div className="text-accent font-black text-2xl">118</div>
              <p className="text-xs uppercase font-bold tracking-widest text-muted-foreground">HP</p>
            </div>
            <div className="space-y-2">
              <div className="text-accent font-black text-2xl">2.0</div>
              <p className="text-xs uppercase font-bold tracking-widest text-muted-foreground">SEC</p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex gap-4 pt-4">
            <Button variant="primary" size="lg" className="gap-2 font-black uppercase tracking-widest aggressive-button-hover">
              EXPLORE BIKES
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Right Content - Bike Image Area */}
        <div className={`relative h-96 md:h-full flex items-center justify-center ${isLoaded ? 'animate-slide-in-right' : 'opacity-0'}`}>
          {/* Bike Image Placeholder with aggressive styling */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-8xl opacity-30 animate-pulse">🏍️</div>
          </div>

          {/* Orange Accent Shape */}
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-accent/20 rounded-full blur-3xl" />
        </div>
      </div>

      {/* Bottom Section Navigation */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex gap-4 items-center z-20">
        {[1, 2, 3, 4].map((num) => (
          <button
            key={num}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              num === 1 ? 'w-8 bg-accent' : 'bg-muted'
            }`}
            aria-label={`Go to slide ${num}`}
          />
        ))}
      </div>
    </section>
  )
}
