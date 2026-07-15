import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  id: string
  title: string
  price: number
  quantity: number
  image: string
  handle?: string
  stock_quantity?: number | null
}

interface CartStore {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  getTotalPrice: () => number
  getTotalItems: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item: CartItem) => {
        const { items } = get()
        const existingItem = items.find((i) => i.id === item.id)

        if (existingItem) {
          const nextQuantity = existingItem.quantity + item.quantity
          const maxQuantity = existingItem.stock_quantity || item.stock_quantity || 999
          set({
            items: items.map((i) =>
              i.id === item.id ? { ...i, quantity: Math.min(nextQuantity, maxQuantity) } : i
            ),
          })
        } else {
          set({ items: [...items, item] })
        }
      },

      removeItem: (id: string) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }))
      },

      updateQuantity: (id: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(id)
          return
        }

        set((state) => ({
          items: state.items.map((item) => (
            item.id === id
              ? { ...item, quantity: Math.min(quantity, item.stock_quantity || 999) }
              : item
          )),
        }))
      },

      clearCart: () => {
        set({ items: [] })
      },

      getTotalPrice: () => {
        const { items } = get()
        return items.reduce((total, item) => total + item.price * item.quantity, 0)
      },

      getTotalItems: () => {
        const { items } = get()
        return items.reduce((total, item) => total + item.quantity, 0)
      },
    }),
    {
      name: 'mk-cart-store',
    }
  )
)
