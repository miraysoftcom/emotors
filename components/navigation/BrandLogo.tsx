'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

interface BrandLogoProps {
  scrolled?: boolean
  slogan?: boolean
  compact?: boolean
  iconOnly?: boolean
  context?: 'header' | 'footer' | 'document'
}

export function BrandLogo({
  scrolled = true,
  slogan = true,
  compact = false,
  iconOnly = false,
  context = 'header',
}: BrandLogoProps) {
  const primaryText = scrolled ? 'text-primary dark:text-white' : 'text-white'
  const sloganText = scrolled ? 'text-muted-foreground' : 'text-white/80'
  const iconSize = compact ? 'h-9 w-9 text-base' : 'h-11 w-11 text-lg'
  const wrapperClass = context === 'footer' ? 'inline-flex items-start gap-3' : 'flex-shrink-0 flex items-start gap-2'

  return (
    <Link href="/" className={wrapperClass} aria-label="MK-eMotors Dornach Startseite">
      {iconOnly && (
        <span className={`${iconSize} flex items-center justify-center rounded-lg bg-accent font-black text-primary shadow-sm`}>
          MK
        </span>
      )}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className={`flex flex-col gap-1 ${iconOnly ? 'sr-only' : ''}`}
      >
        <div className="flex items-end gap-1">
          <span className={`${compact ? 'text-lg' : 'text-xl'} font-black tracking-tighter leading-tight ${primaryText}`}>
            MK-e
          </span>
          <span className={`${compact ? 'text-lg' : 'text-xl'} font-black tracking-tighter leading-tight ${primaryText}`}>
            Motors
          </span>
          <span className="pb-0.5 text-sm font-light leading-tight tracking-widest text-accent">
            Dornach
          </span>
        </div>
        {slogan && (
          <span className={`whitespace-nowrap text-xs font-light tracking-wider ${sloganText}`}>
            Zukunft der Mobilität
          </span>
        )}
      </motion.div>
    </Link>
  )
}
