import { redirect } from 'next/navigation'
import type { ShopListingParams } from '@/lib/shop-listing'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams?: Promise<ShopListingParams>
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const params = await searchParams || {}
  const next = new URLSearchParams()
  if (params.category) next.set('category', params.category)
  if (params.license) next.set('license', params.license)
  if (params.sort) next.set('sort', params.sort)
  if (params.search) next.set('search', params.search)
  const query = next.toString()
  redirect(query ? `/produkte?${query}` : '/produkte')
}
