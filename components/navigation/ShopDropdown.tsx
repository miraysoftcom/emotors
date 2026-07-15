'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const shopCategories = [
  { label: 'Ohne Führerschein', href: '/produkte?license=ohne', icon: '🚲' },
  { label: 'Mit Führerschein', href: '/produkte?license=mit', icon: '🏍️' },
  { label: 'eScooter', href: '/produkte?category=escooter', icon: '🛴' },
  { label: 'Ersatzteile', href: '/produkte?category=ersatzteile', icon: '⚙️' },
  { label: 'Zubehör', href: '/produkte?category=zubehoer', icon: '🎁' },
]

export function ShopDropdown() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative group">
      <button
        className="flex items-center gap-2 px-4 py-2 text-white hover:text-accent transition-colors"
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      >
        Shop
        <ChevronDown
          size={20}
          className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 mt-2 w-56 bg-popover border border-border rounded-lg shadow-xl z-50 py-2"
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
          >
            {shopCategories.map((category) => (
              <Link
                key={category.href}
                href={category.href}
                className="flex items-center gap-3 px-4 py-3 text-popover-foreground hover:bg-surface-hover transition-colors border-l-4 border-transparent hover:border-accent"
              >
                <span className="text-xl">{category.icon}</span>
                <span className="font-medium">{category.label}</span>
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
