'use client'

import { useState } from 'react'
import { Button } from '@/components/common/Button'
import { useCartStore } from '@/lib/store/cartStore'
import { ShoppingCart, Check } from 'lucide-react'

interface AddToCartButtonProps {
  productId: string
  productTitle: string
  productPrice: number
  productImage: string
  handle?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function AddToCartButton({
  productId,
  productTitle,
  productPrice,
  productImage,
  handle,
  size = 'md',
  className,
}: AddToCartButtonProps) {
  const [isAdded, setIsAdded] = useState(false)
  const { addItem } = useCartStore()

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    addItem({
      id: productId,
      title: productTitle,
      price: productPrice,
      quantity: 1,
      image: productImage,
      handle,
    })

    setIsAdded(true)
    setTimeout(() => setIsAdded(false), 2000)
  }

  return (
    <Button
      onClick={handleAddToCart}
      variant={isAdded ? 'secondary' : 'primary'}
      size={size}
      className={className}
    >
      {isAdded ? (
        <>
          <Check className="w-4 h-4 mr-2" />
          Hinzugefügt!
        </>
      ) : (
        <>
          <ShoppingCart className="w-4 h-4 mr-2" />
          Zum Warenkorb
        </>
      )}
    </Button>
  )
}
