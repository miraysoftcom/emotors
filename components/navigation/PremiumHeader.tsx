'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Menu, X, Search, ShoppingBag, User, Sun, Moon } from 'lucide-react'
import { useTheme } from '@/components/providers/ThemeProvider'
import { useCartStore } from '@/lib/store/cartStore'
import { CartModal } from '@/components/cart/CartModal'
import { BrandLogo } from '@/components/navigation/BrandLogo'

export function PremiumHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [openMega, setOpenMega] = useState<string | null>(null)
  const [cartOpen, setCartOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { resolvedTheme, setTheme } = useTheme()
  const { getTotalItems } = useCartStore()
  const cartCount = mounted ? getTotalItems() : 0

  useEffect(() => {
    setMounted(true)
  }, [])

  const navigationItems = [
    {
      label: 'Produkte',
      href: '/produkte',
      submenu: [
        { label: 'Ohne Führerschein', href: '/ohne-fuehrerschein' },
        { label: 'eMotor', href: '/produkte' },
        { label: 'eScooter', href: '/produkte' },
      ],
    },
    {
      label: 'Shop',
      href: '/produkte',
      submenu: [
        { label: 'Alle Produkte', href: '/produkte' },
        { label: 'Premium Angebote', href: '/produkte' },
        { label: 'Finanzierung', href: '/finanzierungsrechner' },
      ],
    },
    { label: 'Finanzierung', href: '/finanzierungsrechner' },
    { label: 'Kontakt', href: '/contact' },
    { label: 'Admin', href: '/admin/marketplace' },
  ]

  return (
    <>
      {/* Announcement Bar */}
      <div className="bg-accent text-accent-foreground py-3 text-center text-sm font-medium">
        0% Zinsen auf Ratenzahlungen • 2 Jahre Garantie • Gratis Lieferung
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-card border-b border-border transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <BrandLogo scrolled slogan compact />

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navigationItems.map((item) => (
                <div
                  key={item.label}
                  className="relative group"
                  onMouseEnter={() => setOpenMega(item.label)}
                  onMouseLeave={() => setOpenMega(null)}
                >
                  <Link
                    href={item.href}
                    className="px-4 py-2 text-sm font-medium text-foreground hover:text-accent transition-colors"
                  >
                    {item.label}
                  </Link>

                  {/* Mega Menu Dropdown */}
                  {item.submenu && openMega === item.label && (
                    <div className="absolute left-0 mt-0 w-48 bg-card border border-border rounded-lg shadow-lg overflow-hidden">
                      {item.submenu.map((subitem) => (
                        <Link
                          key={subitem.label}
                          href={subitem.href}
                          className="block px-4 py-3 text-sm text-foreground hover:bg-secondary transition-colors"
                        >
                          {subitem.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="hidden sm:flex items-center space-x-6">
              <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
                <Search size={20} className="text-foreground" />
              </button>
              <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
                <User size={20} className="text-foreground" />
              </button>
              <button onClick={() => setCartOpen(true)} className="relative p-2 hover:bg-secondary rounded-lg transition-colors" aria-label="Warenkorb öffnen">
                <ShoppingBag size={20} className="text-foreground" />
                {cartCount > 0 && (
                  <span className="absolute top-1 right-1 bg-destructive text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 hover:bg-secondary rounded-lg transition-colors"
            >
              {isMenuOpen ? (
                <X size={24} className="text-foreground" />
              ) : (
                <Menu size={24} className="text-foreground" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden max-h-[calc(100vh-8rem)] overflow-y-auto border-t border-border bg-card">
            <nav className="px-4 py-4 space-y-2">
              {navigationItems.map((item) => (
                <div key={item.label}>
                  <Link
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-4 py-3 text-sm font-medium text-foreground hover:bg-secondary rounded-lg transition-colors"
                  >
                    {item.label}
                  </Link>
                  {item.submenu && (
                    <div className="pl-4 space-y-2">
                      {item.submenu.map((subitem) => (
                        <Link
                          key={subitem.label}
                          href={subitem.href}
                          onClick={() => setIsMenuOpen(false)}
                          className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {subitem.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <div className="grid grid-cols-3 gap-2 border-t border-border pt-4">
                <button className="flex items-center justify-center gap-2 rounded-lg bg-secondary px-3 py-3 text-sm font-semibold text-foreground">
                  <Search size={18} />
                  Suche
                </button>
                <button className="flex items-center justify-center gap-2 rounded-lg bg-secondary px-3 py-3 text-sm font-semibold text-foreground">
                  <User size={18} />
                  Konto
                </button>
                <button onClick={() => setCartOpen(true)} className="relative flex items-center justify-center gap-2 rounded-lg bg-secondary px-3 py-3 text-sm font-semibold text-foreground">
                  <ShoppingBag size={18} />
                  Warenkorb
                  {cartCount > 0 && (
                    <span className="absolute right-2 top-2 bg-destructive text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                      {cartCount > 9 ? '9+' : cartCount}
                    </span>
                  )}
                </button>
              </div>
              <button
                onClick={() => setTheme(resolvedTheme === 'dunkel' ? 'hell' : 'dunkel')}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-border px-4 py-3 text-sm font-bold text-foreground"
              >
                {resolvedTheme === 'dunkel' ? <Sun size={18} /> : <Moon size={18} />}
                {resolvedTheme === 'dunkel' ? 'Hell aktivieren' : 'Dunkel aktivieren'}
              </button>
            </nav>
          </div>
        )}
      </header>
      <CartModal isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  )
}
