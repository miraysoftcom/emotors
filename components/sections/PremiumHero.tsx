'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useTheme } from '@/components/providers/ThemeProvider'
import { TestDriveModal } from '@/components/modals/TestDriveModal'

interface HeroProps {
  title: string
  subtitle: string
  description: string
}

export function PremiumHero({ title, subtitle, description }: HeroProps) {
  const { resolvedTheme } = useTheme()
  const [testDriveOpen, setTestDriveOpen] = useState(false)
  
  const backgroundImage = resolvedTheme === 'hell' 
    ? 'url(/hero-background-hell.png)'
    : 'url(/hero-background.png)'
  
  return (
    <section className="relative w-full h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage,
          backgroundAttachment: 'fixed',
        }}
      />
      
      {/* Overlay Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${
        resolvedTheme === 'hell'
          ? 'from-black/70 via-black/70 to-black/70'
          : 'from-black/70 via-black/70 to-black/70'
      }`} />

      {/* Decorative Elements */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        className="absolute top-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl"
      />
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        className="absolute bottom-20 left-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl"
      />

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        {/* Subtitle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="inline-block mb-8"
        >
          <span className="text-sm font-medium tracking-widest uppercase text-accent">
            {subtitle}
          </span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-tight mb-6 text-white"
        >
          {title}
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-lg md:text-xl max-w-2xl mx-auto mb-12 text-white/80"
        >
          {description}
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Link
            href="/produkte"
            className="px-8 py-4 bg-accent text-accent-foreground font-semibold rounded-full hover:shadow-lg transition-all duration-300 hover:scale-105"
          >
            Jetzt Kaufen
          </Link>
          <Link
            href="/financing"
            className="px-8 py-4 border-2 border-white text-white font-semibold rounded-full hover:bg-white/10 transition-all duration-300"
          >
            Ratenzahlung
          </Link>
          <button
            type="button"
            onClick={() => setTestDriveOpen(true)}
            className="px-8 py-4 border-2 border-white text-white font-semibold rounded-full hover:bg-white/10 transition-all duration-300"
          >
            Probefahrt
          </button>
        </motion.div>
      </div>

      <TestDriveModal isOpen={testDriveOpen} onClose={() => setTestDriveOpen(false)} />

      {/* Scroll Indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
      >
        <div className="w-6 h-10 border-2 border-white rounded-full flex items-start justify-center p-2">
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1 h-2 bg-white rounded-full"
          />
        </div>
      </motion.div>
    </section>
  )
}
