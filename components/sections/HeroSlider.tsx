'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react'
import Link from 'next/link'

interface Slide {
  id: number
  title: string
  subtitle?: string
  description?: string
  desktopImage?: string
  mobileImage?: string
  ctaText?: string
  ctaLink?: string
  imageUrl?: string
  backgroundColor?: string
  textColor?: string
  animationType?: string
  textPosition?: string
  order?: number
  active?: boolean
}

interface HeroSliderProps {
  slides: Slide[]
}

export function HeroSlider({ slides }: HeroSliderProps) {
  const [current, setCurrent] = useState(0)
  const [isAutoPlay, setIsAutoPlay] = useState(true)
  const [isPaused, setIsPaused] = useState(false)
  const [progress, setProgress] = useState(0)
  const autoPlayRef = useRef<NodeJS.Timeout>()
  const progressRef = useRef<NodeJS.Timeout>()

  if (!slides || slides.length === 0) {
    return null
  }

  const slide = slides[current]

  useEffect(() => {
    if (!isAutoPlay || isPaused) return

    autoPlayRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length)
      setProgress(0)
    }, 6000)

    return () => clearInterval(autoPlayRef.current)
  }, [isAutoPlay, isPaused, slides.length])

  useEffect(() => {
    if (!isAutoPlay || isPaused) return

    progressRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100
        return prev + (100 / 60)
      })
    }, 100)

    return () => clearInterval(progressRef.current)
  }, [isAutoPlay, isPaused])

  const next = () => {
    setCurrent((prev) => (prev + 1) % slides.length)
    setProgress(0)
  }

  const prev = () => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length)
    setProgress(0)
  }

  const goToSlide = (index: number) => {
    setCurrent(index)
    setProgress(0)
  }

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden group">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
        >
          {/* Background Image */}
          {(slide.imageUrl || slide.desktopImage) && (
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${slide.imageUrl || slide.desktopImage})`,
              }}
            />
          )}

          {/* Background Color */}
          {slide.backgroundColor && !slide.imageUrl && !slide.desktopImage && (
            <div
              className="absolute inset-0"
              style={{ backgroundColor: slide.backgroundColor }}
            />
          )}

          {/* Overlay */}
          <div className="absolute inset-0 bg-black/30" />

          {/* Content */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="max-w-3xl mx-auto px-4 md:px-8 text-center">
              {slide.subtitle && (
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="text-sm font-medium tracking-widest uppercase text-blue-400 mb-4"
                >
                  {slide.subtitle}
                </motion.p>
              )}

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-5xl md:text-7xl font-black tracking-tighter leading-tight text-white mb-6"
                style={{ color: slide.textColor }}
              >
                {slide.title}
              </motion.h1>

              {slide.description && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="text-lg text-gray-200 mb-8 max-w-2xl mx-auto"
                  dangerouslySetInnerHTML={{ __html: slide.description }}
                />
              )}

              {slide.ctaText && slide.ctaLink && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <Link
                    href={slide.ctaLink}
                    className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-10 rounded-lg transition-all duration-300 transform hover:scale-105"
                  >
                    {slide.ctaText}
                  </Link>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      <button
        onClick={prev}
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-40 bg-black/50 hover:bg-black/75 p-3 rounded-full text-white transition-all opacity-0 group-hover:opacity-100"
      >
        <ChevronLeft size={28} />
      </button>
      <button
        onClick={next}
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-40 bg-black/50 hover:bg-black/75 p-3 rounded-full text-white transition-all opacity-0 group-hover:opacity-100"
      >
        <ChevronRight size={28} />
      </button>

      {/* Pagination Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40 flex gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all duration-300 rounded-full ${
              index === current
                ? 'bg-blue-600 w-8 h-3'
                : 'bg-white/50 hover:bg-white/75 w-3 h-3'
            }`}
          />
        ))}
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700 z-30">
        <motion.div
          className="h-full bg-blue-600"
          style={{ width: `${progress}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>

      {/* Play/Pause Button */}
      <button
        onClick={() => setIsPaused(!isPaused)}
        className="absolute top-8 right-8 z-40 bg-black/50 hover:bg-black/75 p-3 rounded-full text-white transition-all"
      >
        {isPaused ? <Play size={24} /> : <Pause size={24} />}
      </button>
    </div>
  )
}
