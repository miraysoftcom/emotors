'use client'

import Image from 'next/image'
import { Button } from '@/components/common/Button'
import Link from 'next/link'

export function HeroSection() {
  return (
    <section className="relative w-full h-screen min-h-[600px] flex items-center justify-center overflow-hidden pt-20">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background/60" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="flex flex-col gap-6 animate-slide-in-left">
            <div className="inline-block">
              <span className="px-4 py-2 rounded-full bg-accent/10 text-accent border border-accent/20 text-sm font-medium">
                ✨ Swiss Engineering Excellence
              </span>
            </div>

            <h1 className="prose-heading text-5xl md:text-6xl lg:text-7xl leading-tight text-balance">
              Premium Electric Mobility
            </h1>

            <p className="prose-body text-lg text-muted-foreground max-w-lg">
              Experience the future of urban transportation with MK-eMotors Dornach. Precision-engineered Swiss scooters and e-mopeds designed for modern riders.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/produkte">
                <Button size="lg" variant="primary">
                  Explore Products
                </Button>
              </Link>
              <Link href="/about">
                <Button size="lg" variant="outline">
                  Learn More
                </Button>
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap gap-6 pt-8 border-t border-border">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                  ✓
                </div>
                <span className="text-sm font-medium">Swiss Made</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                  ✓
                </div>
                <span className="text-sm font-medium">Premium Quality</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                  ✓
                </div>
                <span className="text-sm font-medium">Eco-Friendly</span>
              </div>
            </div>
          </div>

          {/* Right Visual */}
          <div className="relative h-96 lg:h-full min-h-[400px] flex items-center justify-center animate-slide-in-right">
            <div className="absolute inset-0 bg-gradient-to-t from-accent/5 to-transparent rounded-2xl" />
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Placeholder for hero image - will be generated */}
              <div className="w-full h-full rounded-2xl bg-gradient-to-br from-primary/5 via-accent/5 to-primary/10 flex items-center justify-center border border-border/50">
                <div className="text-center">
                  <div className="text-6xl mb-4">🛴</div>
                  <p className="text-muted-foreground">Premium E-Scooter</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-border rounded-full flex items-start justify-center pt-2">
          <div className="w-1 h-2 bg-accent rounded-full" />
        </div>
      </div>
    </section>
  )
}
