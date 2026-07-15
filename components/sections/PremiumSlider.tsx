'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/common/Button'
import Link from 'next/link'

interface Slide {
  id: number
  title: string
  subtitle: string
  description: string
  desktopImage: string
  mobileImage: string
  ctaText: string
  ctaLink: string
  animationType: string
  textPosition: string
  order: number
  active: boolean
}

interface PremiumSliderProps {
  slides: Slide[]
}

export function PremiumSlider({ slides }: PremiumSliderProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [autoPlay, setAutoPlay] = useState(true)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const activeSlides = slides.filter(s => s.active).sort((a, b) => a.order - b.order)

  useEffect(() => {
    if (!autoPlay || activeSlides.length === 0) return

    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % activeSlides.length)
    }, 5000)

    return () => clearInterval(timer)
  }, [autoPlay, activeSlides.length])

  const handlePrev = () => {
    setIsTransitioning(true)
    setCurrentSlide(prev => (prev - 1 + activeSlides.length) % activeSlides.length)
    setTimeout(() => setIsTransitioning(false), 600)
  }

  const handleNext = () => {
    setIsTransitioning(true)
    setCurrentSlide(prev => (prev + 1) % activeSlides.length)
    setTimeout(() => setIsTransitioning(false), 600)
  }

  const getAnimationClass = (animationType: string, isActive: boolean) => {
    if (!isActive) return 'opacity-0 scale-95'

    switch (animationType) {
      case 'zoom':
        return 'opacity-100 scale-100 animate-[zoom_0.8s_cubic-bezier(0.34,1.56,0.64,1)]'
      case 'slideLeft':
        return 'opacity-100 animate-slide-in-left'
      case 'slideRight':
        return 'opacity-100 animate-slide-in-right'
      case 'fadeIn':
        return 'opacity-100 animate-fade-in'
      default:
        return 'opacity-100 animate-fade-in'
    }
  }

  if (activeSlides.length === 0) {
    return (
      <div className="w-full h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">No slides available</p>
      </div>
    )
  }

  const slide = activeSlides[currentSlide]

  return (
    <div className="relative w-full h-screen overflow-hidden bg-background" onMouseEnter={() => setAutoPlay(false)} onMouseLeave={() => setAutoPlay(true)}>
      {/* Background with Ken Burns zoom effect */}
      <div className="absolute inset-0">
        {activeSlides.map((s, idx) => (
          <div key={s.id} className={`absolute inset-0 transition-opacity duration-1000 ${idx === currentSlide ? 'opacity-100' : 'opacity-0'}`}>
            {/* Desktop Image */}
            <div className="hidden md:flex w-full h-full items-center justify-center bg-gradient-to-br from-secondary via-background to-secondary text-7xl font-black tracking-widest text-accent">
              {s.desktopImage}
            </div>

            {/* Mobile Image */}
            <div className="md:hidden w-full h-full flex items-center justify-center bg-gradient-to-br from-secondary via-background to-secondary text-6xl font-black text-accent">
              {s.mobileImage}
            </div>
          </div>
        ))}

        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/20" />
      </div>

      {/* Content */}
      <div className={`absolute inset-0 flex items-center transition-opacity duration-600 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
        <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full ${slide.textPosition === 'right' ? 'flex justify-end' : ''}`}>
          <div className={`max-w-2xl ${slide.textPosition === 'right' ? 'text-right' : ''}`}>
            {/* Section Number */}
            <div className="text-accent font-black text-sm uppercase tracking-widest mb-4">
              0{(currentSlide + 1).toString().padStart(2, '0')}
            </div>

            {/* Animated Content */}
            <div className={`space-y-6 ${getAnimationClass(slide.animationType, true)}`}>
              {/* Subtitle */}
              {slide.subtitle && (
                <div className="text-accent font-black text-xs md:text-sm uppercase tracking-widest">
                  {slide.subtitle}
                </div>
              )}

              {/* Title */}
              <h1 className="text-4xl md:text-7xl lg:text-8xl font-black text-white uppercase tracking-wider text-shadow-lg leading-none">
                {slide.title}
              </h1>

              {/* Divider */}
              <div className="h-1 w-24 bg-accent" />

              {/* Description */}
              {slide.description && (
                <div
                  className="managed-page-content max-w-xl text-base leading-relaxed text-white/80 md:text-lg"
                  dangerouslySetInnerHTML={{ __html: slide.description }}
                />
              )}

              {/* CTA Button */}
              <div className="pt-4">
                <Link href={slide.ctaLink}>
                  <Button variant="primary" size="lg" className="font-black uppercase tracking-widest">
                    {slide.ctaText}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <div className="absolute bottom-8 left-4 sm:left-8 z-20 flex gap-4">
        <button
          onClick={handlePrev}
          className="w-12 h-12 bg-accent hover:bg-accent/90 text-primary rounded flex items-center justify-center transition-all duration-300 hover-glow"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={handleNext}
          className="w-12 h-12 bg-accent hover:bg-accent/90 text-primary rounded flex items-center justify-center transition-all duration-300 hover-glow"
          aria-label="Next slide"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 right-4 sm:right-8 z-20 flex gap-2">
        {activeSlides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => {
              setIsTransitioning(true)
              setCurrentSlide(idx)
              setTimeout(() => setIsTransitioning(false), 600)
            }}
            className={`h-2 transition-all duration-300 rounded-full ${
              idx === currentSlide ? 'w-12 bg-accent' : 'w-2 bg-white/40 hover:bg-white/60'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>

      {/* Slide Counter */}
      <div className="absolute top-8 right-8 z-20 text-white/60 text-sm font-bold uppercase tracking-widest">
        {(currentSlide + 1).toString().padStart(2, '0')} / {activeSlides.length.toString().padStart(2, '0')}
      </div>
    </div>
  )
}
