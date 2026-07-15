'use client'

interface SortSelectorProps {
  categorySlug?: string
  license?: string
}

export function SortSelector({ categorySlug, license }: SortSelectorProps) {
  const handleSort = (value: string) => {
    const params = new URLSearchParams()
    if (categorySlug) params.set('category', categorySlug)
    if (license) params.set('license', license)
    params.set('sort', value)
    window.location.href = `/produkte?${params.toString()}`
  }

  return (
    <select
      defaultValue="featured"
      onChange={(e) => handleSort(e.target.value)}
      className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground text-sm"
    >
      <option value="featured">Empfohlen</option>
      <option value="newest">Neueste</option>
      <option value="price-low">Preis: Niedrig → Hoch</option>
      <option value="price-high">Preis: Hoch → Niedrig</option>
    </select>
  )
}
