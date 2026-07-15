'use client'

import { useCartStore } from '@/lib/store/cartStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import Link from 'next/link'
import { X, ShoppingCart } from 'lucide-react'
import { formatMoney } from '@/lib/money'
import { CartItemImage } from '@/components/cart/CartItemImage'

interface CartModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CartModal({ isOpen, onClose }: CartModalProps) {
  const { items, removeItem, getTotalPrice, getTotalItems } = useCartStore()
  const total = getTotalPrice()

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <Card className="fixed right-4 top-24 w-full max-w-sm z-50 max-h-96 flex flex-col">
        <CardHeader className="flex items-center justify-between pb-3">
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Warenkorb ({getTotalItems()})
          </CardTitle>
          <button
            onClick={onClose}
            className="p-1 hover:bg-secondary rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto space-y-3">
          {items.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="w-10 h-10 text-muted-foreground mx-auto mb-2 opacity-50" />
              <p className="text-sm text-muted-foreground">Ihr Warenkorb ist leer</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-3 p-3 bg-secondary rounded-lg">
                <CartItemImage image={item.image} title={item.title} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">{item.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.quantity}x {formatMoney(item.price)}
                  </p>
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className="p-1 hover:bg-destructive/10 rounded text-destructive"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </CardContent>

        {items.length > 0 && (
          <div className="border-t border-border p-4 space-y-3">
            <div className="flex justify-between font-bold">
              <span>Total:</span>
              <span className="text-accent">{formatMoney(total)}</span>
            </div>

            <Link href="/cart" onClick={onClose} className="block">
              <Button variant="primary" size="sm" className="w-full">
                Warenkorb ansehen
              </Button>
            </Link>
            <Link href="/checkout" onClick={onClose} className="block">
              <Button variant="primary" size="sm" className="w-full">
                Zur Kasse
              </Button>
            </Link>

            <Button variant="outline" size="sm" className="w-full" onClick={onClose}>
              Weiter einkaufen
            </Button>
          </div>
        )}
      </Card>
    </>
  )
}
