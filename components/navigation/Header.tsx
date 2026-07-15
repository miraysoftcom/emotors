'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Menu, X, ShoppingCart, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCartStore } from '@/lib/store/cartStore'
import { CartModal } from '@/components/cart/CartModal'
import { BrandLogo } from '@/components/navigation/BrandLogo'

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [cartModalOpen, setCartModalOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { getTotalItems } = useCartStore()
  const cartItemCount = mounted ? getTotalItems() : 0

  useEffect(() => {
    setMounted(true)
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-border',
        scrolled ? 'bg-background shadow-lg' : 'bg-background/80 backdrop-blur-sm'
      )}
    >
      <nav className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        <BrandLogo scrolled slogan />

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-12">
          <Link href="/produkte" className="text-sm font-bold uppercase tracking-widest hover:text-accent transition-colors relative group">
            Produkte
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-accent group-hover:w-full transition-all duration-300" />
          </Link>
          <Link href="/" className="text-sm font-bold uppercase tracking-widest hover:text-accent transition-colors relative group">
            Finanzierung
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-accent group-hover:w-full transition-all duration-300" />
          </Link>
          <Link href="/about" className="text-sm font-bold uppercase tracking-widest hover:text-accent transition-colors relative group">
            Über uns
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-accent group-hover:w-full transition-all duration-300" />
          </Link>
          <Link href="/contact" className="text-sm font-bold uppercase tracking-widest hover:text-accent transition-colors relative group">
            Kontakt
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-accent group-hover:w-full transition-all duration-300" />
          </Link>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-6">
          <div className="hidden lg:flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2 px-3 py-2 rounded bg-secondary/50">
              <span className="text-muted-foreground">Logged as</span>
              <span className="font-bold text-accent">Christ Deo</span>
            </div>
          </div>

          <button className="w-10 h-10 rounded bg-secondary hover:bg-secondary/80 transition-colors flex items-center justify-center hover-glow">
            <Search className="w-5 h-5 text-accent" />
          </button>

          <button
            onClick={() => setCartModalOpen(!cartModalOpen)}
            className="w-10 h-10 rounded bg-secondary hover:bg-secondary/80 transition-colors flex items-center justify-center hover-glow relative"
          >
            <ShoppingCart className="w-5 h-5 text-accent" />
            {cartItemCount > 0 && (
              <span className="absolute -top-2 -right-2 flex items-center justify-center w-5 h-5 bg-accent text-primary text-xs font-bold rounded-full animate-glow-pulse">
                {cartItemCount > 9 ? '9+' : cartItemCount}
              </span>
            )}
          </button>

          {/* Orange Menu Button */}
          <button className="w-12 h-12 bg-accent rounded flex items-center justify-center hover-glow md:hidden">
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-primary" onClick={() => setMobileMenuOpen(false)} />
            ) : (
              <Menu className="w-6 h-6 text-primary" onClick={() => setMobileMenuOpen(true)} />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-secondary/20 backdrop-blur-sm">
          <div className="px-4 py-6 space-y-3">
            <Link
              href="/produkte"
              className="block text-sm font-bold uppercase tracking-widest hover:text-accent transition-colors py-3 border-b border-border/50"
            >
              Produkte
            </Link>
            <Link
              href="/"
              className="block text-sm font-bold uppercase tracking-widest hover:text-accent transition-colors py-3 border-b border-border/50"
            >
              Finanzierung
            </Link>
            <Link
              href="/about"
              className="block text-sm font-bold uppercase tracking-widest hover:text-accent transition-colors py-3 border-b border-border/50"
            >
              Über uns
            </Link>
            <Link
              href="/contact"
              className="block text-sm font-bold uppercase tracking-widest hover:text-accent transition-colors py-3"
            >
              Kontakt
            </Link>
          </div>
        </div>
      )}

      {/* Cart Modal */}
      <CartModal isOpen={cartModalOpen} onClose={() => setCartModalOpen(false)} />
    </header>
  )
}
