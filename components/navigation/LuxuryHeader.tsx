'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useTheme } from '@/components/providers/ThemeProvider'
import { LogOut, Sun, Moon, ShoppingBag, UserRound } from 'lucide-react'
import { useCartStore } from '@/lib/store/cartStore'
import { CartModal } from '@/components/cart/CartModal'
import { BrandLogo } from '@/components/navigation/BrandLogo'
import { useAuthStatus } from '@/lib/use-auth-status'

export function LuxuryHeader() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { resolvedTheme, setTheme } = useTheme()
  const { getTotalItems } = useCartStore()
  const { authenticatedUser, isAuthenticated, sessionLoading, logout } = useAuthStatus()
  const cartCount = mounted ? getTotalItems() : 0
  const authLoading = !mounted || sessionLoading
  const customerName = authenticatedUser?.name || authenticatedUser?.email || ''

  useEffect(() => {
    setMounted(true)
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navItems = [
    { label: 'Über uns', href: '/ueber-uns' },
    { label: 'Kontakt', href: '/contact' },
  ]

  const shopDropdownItems = [
    { label: 'Ohne Fuehrerschein', href: '/produkte?license=ohne' },
    { label: 'Mit Fuehrerschein', href: '/produkte?license=mit' },
    { label: 'eScooter', href: '/produkte?category=escooter' },
    { label: 'Ersatzteile', href: '/produkte?category=ersatzteile' },
    { label: 'Zubehoer', href: '/produkte?category=zubehoer' },
  ]

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'bg-white/80 dark:bg-black/80 backdrop-blur-xl shadow-luxury-md'
          : 'bg-black/20 backdrop-blur-md'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <BrandLogo scrolled={isScrolled} slogan />

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-12">
          {/* Home Link */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link
              href="/"
              className={`text-sm font-medium transition-colors ${
                isScrolled
                  ? 'text-primary/70 hover:text-accent'
                  : 'text-white/90 hover:text-white'
              }`}
            >
              Home
            </Link>
          </motion.div>

          {/* Shop Dropdown */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="group relative"
          >
            <Link
              href="/produkte"
              className={`text-sm font-medium transition-colors flex items-center gap-1 ${
                isScrolled
                  ? 'text-primary/70 group-hover:text-accent'
                  : 'text-white/90 group-hover:text-white'
              }`}
            >
              Shop <span className="text-xs">▼</span>
            </Link>
            {/* Shop Dropdown Menu */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              whileHover={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute left-0 mt-0 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 overflow-hidden z-50"
            >
              {shopDropdownItems.map((dropItem) => (
                <Link
                  key={dropItem.href}
                  href={dropItem.href}
                  className="block px-4 py-3 text-sm text-primary dark:text-white hover:bg-accent/10 transition-colors first:pt-4 last:pb-4"
                >
                  {dropItem.label}
                </Link>
              ))}
            </motion.div>
          </motion.div>

          {/* FAQ Link */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Link
              href="/faq"
              className={`text-sm font-medium transition-colors ${
                isScrolled
                  ? 'text-primary/70 hover:text-accent'
                  : 'text-white/90 hover:text-white'
              }`}
            >
              FAQ
            </Link>
          </motion.div>

          {/* Über uns Link */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Link
              href="/ueber-uns"
              className={`text-sm font-medium transition-colors ${
                isScrolled
                  ? 'text-primary/70 hover:text-accent'
                  : 'text-white/90 hover:text-white'
              }`}
            >
              Über uns
            </Link>
          </motion.div>

          {/* Kontakt Link */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Link
              href="/contact"
              className={`text-sm font-medium transition-colors ${
                isScrolled
                  ? 'text-primary/70 hover:text-accent'
                  : 'text-white/90 hover:text-white'
              }`}
            >
              Kontakt
            </Link>
          </motion.div>
        </nav>

        {/* CTA Button & Theme Toggle */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="hidden md:flex items-center gap-4"
        >
          <button
            onClick={() => setTheme(resolvedTheme === 'dunkel' ? 'hell' : 'dunkel')}
            className={`p-2 rounded-full transition-all ${
              isScrolled
                ? 'bg-primary/10 hover:bg-primary/20 text-primary'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
            aria-label="Toggle theme"
          >
            {resolvedTheme === 'dunkel' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <Link
            href="/produkte"
            className="px-6 py-2.5 bg-accent text-accent-foreground font-medium rounded-full hover:shadow-lg transition-all duration-300 hover:scale-105"
          >
            Jetzt Kaufen
          </Link>
          {authLoading && (
            <span
              className={`h-11 w-36 animate-pulse rounded-full ${
                isScrolled ? 'bg-primary/10' : 'bg-white/15'
              }`}
              aria-label="Anmeldestatus wird geladen"
            />
          )}
          {!authLoading && isAuthenticated && (
            <div className="group relative">
              <Link
                href="/account"
                className={`inline-flex items-center gap-3 rounded-full border px-4 py-2 text-sm font-bold transition-all duration-300 hover:scale-105 ${
                  isScrolled
                    ? 'border-accent/60 text-primary hover:bg-accent/10 dark:text-white'
                    : 'border-white/40 text-white hover:bg-white/10'
                }`}
              >
                <UserRound size={18} />
                <span className="flex flex-col leading-tight">
                  <span>Meinkonto</span>
                  {customerName && (
                    <span className={isScrolled ? 'max-w-36 truncate text-xs text-primary/60 dark:text-white/60' : 'max-w-36 truncate text-xs text-white/65'}>
                      {customerName}
                    </span>
                  )}
                </span>
                <span className="text-xs">▼</span>
              </Link>

              <div className="invisible absolute right-0 top-full z-50 w-64 pt-3 opacity-0 transition duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                <div className="overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-2xl shadow-shadow/30">
                  <div className="border-b border-border px-4 py-3">
                    <p className="text-sm font-black">Kundenkonto</p>
                    {customerName && <p className="mt-1 truncate text-xs text-muted-foreground">{customerName}</p>}
                  </div>
                  <button
                    type="button"
                    onClick={() => logout('/')}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-bold text-destructive transition hover:bg-destructive/10"
                  >
                    <LogOut size={17} />
                    Abmelden
                  </button>
                </div>
              </div>
            </div>
          )}
          {!authLoading && !isAuthenticated && (
            <Link
              href="/sign-in"
              className={`inline-flex items-center gap-3 rounded-full border px-4 py-2 text-sm font-bold transition-all duration-300 hover:scale-105 ${
                isScrolled
                  ? 'border-accent/60 text-primary hover:bg-accent/10 dark:text-white'
                  : 'border-white/40 text-white hover:bg-white/10'
              }`}
            >
              <UserRound size={18} />
              <span className="flex flex-col leading-tight">
                <span>Anmelden</span>
                <span className={isScrolled ? 'text-xs text-primary/60 dark:text-white/60' : 'text-xs text-white/65'}>
                  Registrieren
                </span>
              </span>
            </Link>
          )}
          <button
            onClick={() => setCartOpen(true)}
            className={`relative p-2 rounded-full transition-all ${
              isScrolled
                ? 'bg-primary/10 hover:bg-primary/20 text-primary dark:text-white'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
            aria-label="Warenkorb öffnen"
          >
            <ShoppingBag size={20} />
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-xs font-black text-accent-foreground">
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </button>
        </motion.div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden flex flex-col gap-1.5 p-2"
        >
          <span className={`h-0.5 w-6 transition-all ${
            isScrolled ? 'bg-primary' : 'bg-white'
          } ${isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`h-0.5 w-6 transition-all ${
            isScrolled ? 'bg-primary' : 'bg-white'
          } ${isMobileMenuOpen ? 'opacity-0' : ''}`} />
          <span className={`h-0.5 w-6 transition-all ${
            isScrolled ? 'bg-primary' : 'bg-white'
          } ${isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="md:hidden max-h-[calc(100vh-5rem)] overflow-y-auto bg-white/95 dark:bg-black/95 backdrop-blur-xl border-t border-border"
        >
          <nav className="flex flex-col p-6 gap-2">
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-base font-semibold text-primary dark:text-white hover:text-accent transition-colors py-3"
            >
              Home
            </Link>
            <div className="rounded-xl border border-border bg-secondary/40 p-3">
              <p className="px-2 pb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">Shop</p>
              <Link
                href="/produkte"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block rounded-lg px-3 py-3 text-sm font-semibold text-primary dark:text-white hover:bg-accent/10"
              >
                Alle Produkte
              </Link>
              {shopDropdownItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block rounded-lg px-3 py-3 text-sm text-primary/80 dark:text-white/80 hover:bg-accent/10 hover:text-accent"
                >
                  {item.label}
                </Link>
              ))}
            </div>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-base font-semibold text-primary dark:text-white hover:text-accent transition-colors py-3"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/faq"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-base font-semibold text-primary dark:text-white hover:text-accent transition-colors py-3"
            >
              FAQ
            </Link>
            <button
              onClick={() => setTheme(resolvedTheme === 'dunkel' ? 'hell' : 'dunkel')}
              className="mt-2 flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-bold text-primary dark:text-white"
            >
              {resolvedTheme === 'dunkel' ? <Sun size={18} /> : <Moon size={18} />}
              {resolvedTheme === 'dunkel' ? 'Hell aktivieren' : 'Dunkel aktivieren'}
            </button>
            <button
              onClick={() => setCartOpen(true)}
              className="flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-bold text-primary dark:text-white"
            >
              <ShoppingBag size={18} />
              Warenkorb ({cartCount})
            </button>
            {authLoading && (
              <div className="h-12 animate-pulse rounded-xl bg-secondary" aria-label="Anmeldestatus wird geladen" />
            )}
            {!authLoading && isAuthenticated && (
              <div className="rounded-xl border border-accent/60 bg-accent/5 p-2">
                <Link
                  href="/account"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-3 rounded-lg px-4 py-3 text-sm font-black text-accent transition hover:bg-accent/10"
                >
                  <UserRound size={18} />
                  <span className="flex flex-col leading-tight">
                    <span>Meinkonto</span>
                    {customerName && <span className="max-w-52 truncate text-xs text-accent/75">{customerName}</span>}
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false)
                    logout('/')
                  }}
                  className="mt-1 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-bold text-destructive transition hover:bg-destructive/10"
                >
                  <LogOut size={18} />
                  Abmelden
                </button>
              </div>
            )}
            {!authLoading && !isAuthenticated && (
              <Link
                href="/sign-in"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-center gap-3 rounded-xl border border-accent/60 px-4 py-3 text-sm font-black text-accent transition hover:bg-accent/10"
              >
                <UserRound size={18} />
                <span className="flex flex-col leading-tight">
                  <span>Anmelden</span>
                  <span className="text-xs text-accent/75">Registrieren</span>
                </span>
              </Link>
            )}
            <Link
              href="/produkte"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-6 py-2.5 bg-accent text-accent-foreground font-medium rounded-full text-center hover:shadow-lg transition-all duration-300"
            >
              Jetzt Kaufen
            </Link>
          </nav>
        </motion.div>
      )}
      <CartModal isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </header>
  )
}
