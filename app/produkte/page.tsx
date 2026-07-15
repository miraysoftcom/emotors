import { ProductListingPage } from '@/components/products/ProductListingPage'
import { loadShopProducts, type ShopListingParams } from '@/lib/shop-listing'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams?: Promise<ShopListingParams>
}

export default async function ProduktePage({ searchParams }: PageProps) {
  const params = await searchParams || {}
  const listing = await loadShopProducts(params)

  return (
    <ProductListingPage
      routeBase="/produkte"
      products={listing.products}
      categories={listing.categories}
      selectedCategory={listing.selectedCategory}
      license={listing.license}
      sort={listing.sort}
      searchParams={{
        category: params.category || undefined,
        license: params.license || undefined,
        sort: params.sort || undefined,
        search: params.search || undefined,
      }}
    />
  )
}
