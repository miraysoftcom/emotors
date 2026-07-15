'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

interface ProductSortControlProps {
  value: string
}

export function ProductSortControl({ value }: ProductSortControlProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const changeSort = (nextSort: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (nextSort === 'featured') {
      params.delete('sort')
    } else {
      params.set('sort', nextSort)
    }
    const query = params.toString()
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }

  return (
    <select
      value={value || 'featured'}
      onChange={(event) => changeSort(event.target.value)}
      className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-accent md:w-auto"
      aria-label="Produkte sortieren"
    >
      <option value="featured">Empfohlen</option>
      <option value="newest">Neueste zuerst</option>
      <option value="bestseller">Bestseller</option>
      <option value="price-low">Preis: Niedrig nach Hoch</option>
      <option value="price-high">Preis: Hoch nach Niedrig</option>
    </select>
  )
}
