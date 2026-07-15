'use client'

import { useEffect, useMemo, useState } from 'react'
import { LuxuryHeader } from '@/components/navigation/LuxuryHeader'
import { Footer } from '@/components/navigation/Footer'
import { Card, CardContent } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import Link from 'next/link'
import { ShoppingCart, X, Plus, Minus } from 'lucide-react'
import { useCartStore } from '@/lib/store/cartStore'
import { formatMoney } from '@/lib/money'
import { CartItemImage } from '@/components/cart/CartItemImage'
import { calculateOrderTax, type TaxSettings } from '@/lib/tax-calculation'

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, getTotalPrice, getTotalItems } =
    useCartStore()

  const total = getTotalPrice()
  const shipping = total > 100 ? 0 : 25
  const [taxSettings, setTaxSettings] = useState<TaxSettings | undefined>()
  useEffect(() => {
    fetch('/api/shop/settings')
      .then((res) => res.json())
      .then((data) => setTaxSettings(data.tax))
      .catch(() => setTaxSettings(undefined))
  }, [])
  const taxCalculation = useMemo(() => calculateOrderTax({ items, shippingCost: shipping, settings: taxSettings }), [items, shipping, taxSettings])
  const grandTotal = taxCalculation.gross

  return (
    <main className="w-full min-h-screen bg-slate-950 text-white">
      <LuxuryHeader />

      <div className="pt-32 pb-20 min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(23,150,118,0.18),transparent_34rem),linear-gradient(180deg,#020617_0%,#07110d_45%,#020617_100%)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="prose-heading text-4xl md:text-5xl mb-12 text-white">Warenkorb</h1>

          {items.length === 0 ? (
            /* Empty State */
            <Card className="mb-12 border-white/10 bg-white/[0.04] text-white shadow-2xl shadow-black/30">
              <CardContent className="py-16 text-center">
                <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h2 className="prose-heading text-2xl mb-4 text-white">Ihr Warenkorb ist leer</h2>
                <p className="text-muted-foreground mb-8">
                  Entdecken Sie unsere Produkte und legen Sie Ihr Wunschfahrzeug in den Warenkorb.
                </p>
                <Link href="/produkte">
                  <Button variant="primary" size="lg">
                    Weiter einkaufen
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            /* Cart With Items */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
              {/* Cart Items */}
              <div className="lg:col-span-2">
                <Card className="border-white/10 bg-white/[0.04] text-white shadow-2xl shadow-black/30">
                  <CardContent className="p-0">
                    <div className="divide-y divide-white/10">
                      {items.map((item) => (
                        <div key={item.id} className="p-6 flex gap-4">
                          {/* Item Image */}
                          <CartItemImage image={item.image} title={item.title} />

                          {/* Item Details */}
                          <div className="flex-1 min-w-0">
                            <Link href={`/produkte/${item.handle || item.id}`}>
                              <h3 className="font-bold text-lg hover:text-accent transition-colors">
                                {item.title}
                              </h3>
                            </Link>
                            <p className="text-accent font-bold mb-4">{formatMoney(item.price)}</p>

                            {/* Quantity Controls */}
                            <div className="flex items-center gap-2 mb-4 rounded-lg border border-white/10 bg-white/10 w-fit">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="p-1 hover:bg-border rounded transition-colors"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="px-3 font-bold w-8 text-center">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="p-1 hover:bg-border rounded transition-colors"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>

                            <p className="text-sm text-muted-foreground">
                              Zwischensumme: {formatMoney(item.price * item.quantity)}
                            </p>
                          </div>

                          {/* Remove Button */}
                          <button
                            onClick={() => removeItem(item.id)}
                            className="p-2 hover:bg-destructive/10 rounded-lg text-destructive transition-colors flex-shrink-0"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <div className="mt-6 flex gap-3">
                  <Link href="/produkte" className="flex-1">
                    <Button variant="outline" size="lg" className="w-full border-white/30 text-white hover:border-accent hover:bg-accent/10 hover:text-accent">
                      Weiter einkaufen
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={clearCart}
                    className="flex-1 border border-white/20 text-white hover:bg-white/10 hover:text-accent"
                  >
                    Warenkorb leeren
                  </Button>
                </div>
              </div>

              {/* Order Summary */}
              <Card className="h-fit border-white/10 bg-white/[0.04] text-white shadow-2xl shadow-black/30">
                <CardContent className="pt-8 space-y-4">
                  <h3 className="font-bold text-lg">Bestellübersicht</h3>

                  <div className="space-y-2 pb-4 border-b border-white/10">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Zwischensumme ({getTotalItems()} Artikel)</span>
                      <span>{formatMoney(total)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Versand</span>
                      <span>{shipping === 0 ? 'Kostenlos' : formatMoney(shipping)}</span>
                    </div>
                    {taxCalculation.enabled && taxCalculation.lines.map((line) => (
                      <div key={line.rateId} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{taxCalculation.priceDisplay === 'inclusive' ? 'inkl.' : 'zzgl.'} MWST ({line.percentage}%)</span>
                        <span>{formatMoney(line.tax)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-accent">{formatMoney(grandTotal)}</span>
                  </div>

                  {total > 100 && (
                    <p className="text-xs text-accent bg-accent/10 rounded p-2">
                      ✓ Kostenloser Versand angewendet
                    </p>
                  )}

                  <Link href="/checkout" className="block">
                    <Button variant="primary" size="lg" className="w-full">
                      Zur Kasse
                    </Button>
                  </Link>

                  <p className="text-xs text-muted-foreground text-center">
                    Sichere Bestellung mit verschlüsselter Übertragung
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  )
}
