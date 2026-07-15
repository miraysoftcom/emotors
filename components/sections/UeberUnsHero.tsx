'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

interface UeberUnsHeroProps {
  headline?: string
  subtitle?: string
  description?: string
  backgroundImage?: string
  backgroundVideo?: string
  ctaText?: string
  ctaLink?: string
  overlayOpacity?: number
}

export function UeberUnsHero({
  headline = 'Über MK-eMotors Dornach',
  subtitle = 'Premium Elektromobilität aus der Schweiz',
  description = 'Entdecken Sie unsere Leidenschaft für nachhaltige, innovative Mobilität',
  backgroundImage = 'https://images.unsplash.com/photo-1602073644580-a2f1e80c9f17?w=1920&h=1080&fit=crop',
  backgroundVideo,
  ctaText = 'Jetzt entdecken',
  ctaLink = '/produkte',
  overlayOpacity = 40,
}: UeberUnsHeroProps) {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Image */}
      {backgroundImage && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${backgroundImage})`,
          }}
        />
      )}

      {/* Video Background */}
      {backgroundVideo && typeof backgroundVideo === 'string' && (
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          src={backgroundVideo}
        />
      )}

      {/* Dark Overlay */}
      <div
        className="absolute inset-0 bg-black"
        style={{ opacity: overlayOpacity / 100 }}
      />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 max-w-4xl mx-auto px-6 text-center"
      >
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-accent text-sm md:text-base font-semibold mb-4 uppercase tracking-widest"
        >
          {subtitle}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-6 leading-tight"
        >
          {headline}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-lg md:text-xl text-gray-200 mb-8 max-w-2xl mx-auto"
        >
          {description}
        </motion.p>

        {ctaText && ctaLink && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <Link
              href={ctaLink}
              className="inline-block px-8 py-4 bg-accent hover:bg-accent/90 text-accent-foreground font-bold rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              {ctaText}
            </Link>
          </motion.div>
        )}
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <div className="w-8 h-12 border-2 border-white/50 rounded-full flex items-start justify-center p-2">
          <motion.div className="w-1 h-2 bg-white rounded-full" />
        </div>
      </motion.div>
    </section>
  )
}
