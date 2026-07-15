import Link from 'next/link'
import { Footer } from '@/components/navigation/Footer'
import { LuxuryHeader } from '@/components/navigation/LuxuryHeader'
import { ProductCard } from '@/components/products/ProductCard'
import { ProductSortControl } from '@/components/products/ProductSortControl'
import type { LicenseFilter, ShopCategory, ShopProduct } from '@/lib/shop-listing'

interface ProductListingPageProps {
  routeBase: '/products' | '/produkte'
  products: ShopProduct[]
  categories: ShopCategory[]
  selectedCategory?: ShopCategory
  license: LicenseFilter
  sort: string
  searchParams: Record<string, string | undefined>
}

function buildHref(routeBase: string, current: Record<string, string | undefined>, updates: Record<string, string | null | undefined>) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(current)) {
    if (value) params.set(key, value)
  }
  for (const [key, value] of Object.entries(updates)) {
    if (!value) params.delete(key)
    else params.set(key, value)
  }
  const query = params.toString()
  return query ? `${routeBase}?${query}` : routeBase
}

export function ProductListingPage({
  routeBase,
  products,
  categories,
  selectedCategory,
  license,
  sort,
  searchParams,
}: ProductListingPageProps) {
  const activeCategory = selectedCategory || (
    license === 'ohne'
      ? categories.find((category) => category.slug === 'ohne-fuehrerschein')
      : license === 'mit'
        ? categories.find((category) => category.slug === 'mit-fuehrerschein')
        : undefined
  )
  const pageTitle = selectedCategory?.name || (
    license === 'ohne' ? 'Produkte ohne Führerschein' : license === 'mit' ? 'Produkte mit Führerschein' : 'Alle Produkte'
  )
  const categoryBanner = activeCategory?.banner || activeCategory?.image || ''

  return (
    <main className="w-full bg-background">
      <LuxuryHeader />

      <div className="border-b border-border bg-secondary py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav className="mb-4 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">Startseite</Link>
            <span className="mx-2">/</span>
            <Link href={routeBase} className="hover:text-foreground">Shop</Link>
            {selectedCategory && (
              <>
                <span className="mx-2">/</span>
                <span>{selectedCategory.name}</span>
              </>
            )}
          </nav>
          <h1 className="mb-2 text-4xl font-black tracking-tighter">{pageTitle}</h1>
          <p className="text-muted-foreground">
            {products.length} Produkte verfügbar
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          <aside className="lg:col-span-1">
            <div className="sticky top-28 space-y-8 rounded-lg border border-border bg-card p-5">
              <section>
                <h2 className="mb-4 text-lg font-semibold">Kategorien</h2>
                <div className="space-y-2">
                  <Link
                    href={buildHref(routeBase, searchParams, { category: null })}
                    className={`block rounded-lg px-3 py-2 transition-colors ${
                      !searchParams.category
                        ? 'bg-accent font-semibold text-accent-foreground'
                        : 'text-foreground hover:bg-secondary'
                    }`}
                  >
                    Alle
                  </Link>
                  {categories.map((category) => (
                    <Link
                      key={category.id}
                      href={buildHref(routeBase, searchParams, { category: category.slug })}
                      className={`block rounded-lg px-3 py-2 transition-colors ${
                        searchParams.category === category.slug || searchParams.category === String(category.id)
                          ? 'bg-accent font-semibold text-accent-foreground'
                          : 'text-foreground hover:bg-secondary'
                      }`}
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              </section>

              <section>
                <h2 className="mb-4 text-lg font-semibold">Führerschein</h2>
                <div className="space-y-2">
                  <Link
                    href={buildHref(routeBase, searchParams, { license: null })}
                    className={`block rounded-lg px-3 py-2 transition-colors ${
                      license === 'all'
                        ? 'bg-accent font-semibold text-accent-foreground'
                        : 'text-foreground hover:bg-secondary'
                    }`}
                  >
                    Alle Fahrzeuge
                  </Link>
                  <Link
                    href={buildHref(routeBase, searchParams, { license: 'ohne' })}
                    className={`block rounded-lg px-3 py-2 transition-colors ${
                      license === 'ohne'
                        ? 'bg-accent font-semibold text-accent-foreground'
                        : 'text-foreground hover:bg-secondary'
                    }`}
                  >
                    Ohne Führerschein
                  </Link>
                  <Link
                    href={buildHref(routeBase, searchParams, { license: 'mit' })}
                    className={`block rounded-lg px-3 py-2 transition-colors ${
                      license === 'mit'
                        ? 'bg-accent font-semibold text-accent-foreground'
                        : 'text-foreground hover:bg-secondary'
                    }`}
                  >
                    Mit Führerschein
                  </Link>
                </div>
              </section>

              <section>
                <h2 className="mb-4 text-lg font-semibold">Sortierung</h2>
                <ProductSortControl value={sort} />
              </section>
            </div>
          </aside>

          <section className="lg:col-span-3">
            {activeCategory && (
              <div className="mb-6 overflow-hidden rounded-2xl border border-border bg-card shadow-luxury-sm">
                {categoryBanner ? (
                  <div className="relative min-h-52 md:min-h-64">
                    <img
                      src={categoryBanner}
                      alt={activeCategory.name}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-black/10" />
                    <div className="relative flex min-h-52 max-w-2xl flex-col justify-end p-6 text-white md:min-h-64 md:p-8">
                      <p className="mb-3 text-xs font-black uppercase tracking-[0.28em] text-accent">Kategorie</p>
                      <h2 className="text-3xl font-black md:text-5xl">{activeCategory.name}</h2>
                      {activeCategory.description && (
                        <div
                          className="managed-page-content mt-4 max-w-xl text-sm leading-6 text-white/78 md:text-base"
                          dangerouslySetInnerHTML={{ __html: activeCategory.description }}
                        />
                      )}
                    </div>
                  </div>
                ) : (
                  <div
                    className="p-6 md:p-8"
                    style={{
                      background: `linear-gradient(135deg, ${activeCategory.color || '#111827'}22, transparent 70%)`,
                    }}
                  >
                    <p className="mb-3 text-xs font-black uppercase tracking-[0.28em] text-accent">Kategorie</p>
                    <h2 className="text-3xl font-black text-foreground md:text-5xl">{activeCategory.name}</h2>
                    {activeCategory.description && (
                      <div
                        className="managed-page-content mt-4 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base"
                        dangerouslySetInnerHTML={{ __html: activeCategory.description }}
                      />
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="mb-6 flex flex-col justify-between gap-4 rounded-lg border border-border bg-card p-4 md:flex-row md:items-center">
              <div>
                <p className="text-sm font-semibold text-foreground">{products.length} Produkte gefunden</p>
                <p className="text-sm text-muted-foreground">Filter und Sortierung sind mit der URL synchronisiert.</p>
              </div>
              <div className="md:hidden">
                <ProductSortControl value={sort} />
              </div>
            </div>

            {products.length === 0 ? (
              <div className="rounded-lg border border-border bg-card py-20 text-center">
                <div className="space-y-3 px-6">
                  <p className="text-lg font-semibold text-muted-foreground">Keine Produkte gefunden</p>
                  <p className="text-sm text-muted-foreground">Bitte ändern Sie die Kategorie oder den Führerschein-Filter.</p>
                  <Link href={routeBase} className="inline-flex rounded-lg bg-accent px-4 py-2 font-bold text-accent-foreground">
                    Alle Produkte anzeigen
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      <Footer />
    </main>
  )
}
