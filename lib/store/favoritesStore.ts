import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface FavoriteItem {
  id: string
  title: string
  price: number
  image?: string | null
  handle?: string
  stock_quantity?: number | null
}

interface FavoritesStore {
  items: FavoriteItem[]
  toggleFavorite: (item: FavoriteItem) => void
  removeFavorite: (id: string) => void
  isFavorite: (id: string) => boolean
  getTotalFavorites: () => number
}

export const useFavoritesStore = create<FavoritesStore>()(
  persist(
    (set, get) => ({
      items: [],

      toggleFavorite: (item) => {
        const exists = get().items.some((favorite) => favorite.id === item.id)
        set((state) => ({
          items: exists
            ? state.items.filter((favorite) => favorite.id !== item.id)
            : [...state.items, item],
        }))
      },

      removeFavorite: (id) => {
        set((state) => ({
          items: state.items.filter((favorite) => favorite.id !== id),
        }))
      },

      isFavorite: (id) => get().items.some((favorite) => favorite.id === id),

      getTotalFavorites: () => get().items.length,
    }),
    {
      name: 'mk-favorites-store',
    },
  ),
)
