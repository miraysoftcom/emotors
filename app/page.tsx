import { LuxuryHeader } from '@/components/navigation/LuxuryHeader'
import { Footer } from '@/components/navigation/Footer'
import { HeroSlider } from '@/components/sections/HeroSlider'
import { PremiumHero } from '@/components/sections/PremiumHero'
import { ProductShowcase } from '@/components/sections/ProductShowcase'
import { CategoryShowcase } from '@/components/sections/CategoryShowcase'
import { PremiumService } from '@/components/sections/PremiumService'
import { BestsellerSection } from '@/components/sections/BestsellerSection'
import { OffersSection } from '@/components/sections/OffersSection'
import { LiveSalesSection } from '@/components/sections/LiveSalesSection'
import { ReviewsCarouselSection } from '@/components/sections/ReviewsCarouselSection'
import { ProductOfTheDaySection } from '@/components/sections/ProductOfTheDaySection'
import { CountdownProductsSection } from '@/components/sections/CountdownProductsSection'
import { EstimateAppointmentSection } from '@/components/sections/EstimateAppointmentSection'
import { MarqueeBannerRenderer } from '@/components/sections/MarqueeBannerRenderer'
import { ManagedHero } from '@/components/sections/ManagedHero'
import { HomeAnnouncementBanner, HomeAnnouncementMarquee, HomeAnnouncementTop } from '@/components/announcements/HomeAnnouncements'
import { SpecialDayHomepageBanner } from '@/components/campaigns/SpecialDayCampaignSurfaces'
import { SplitTitle } from '@/components/common/SplitTitle'
import { db } from '@/lib/db'
import { products, services, reviews, orders, sliders } from '@/lib/db/schema'
import { getCategories } from '@/lib/categories-store'
import { getStoredProducts, type StoredProduct } from '@/lib/products-store'
import { getStoredSliders } from '@/lib/sliders-store'
import { getStoredOrders } from '@/lib/orders-store'
import { resolveProductPrice } from '@/lib/product-price'
import { getHeroSettings } from '@/lib/hero-settings-store'
import { eq, sql } from 'drizzle-orm'

function normalizeHomepageProduct(product: any) {
  const galleryImage = Array.isArray(product.images) ? product.images.find(Boolean) : null
  const image = galleryImage || product.image || product.image_primary || product.image_url || '/placeholder.jpg'
  const title = product.title || product.name || 'Produkt'

  return {
    ...product,
    title,
    name: product.name || title,
    image,
    image_url: product.image_url || image,
    image_primary: product.image_primary || image,
    is_bestseller: product.is_bestseller || product.bestseller,
  }
}

function getStoredHomepageProducts(filter?: (product: StoredProduct) => boolean) {
  return getStoredProducts()
    .filter((product) => product.active !== false && product.archived !== true)
    .filter(filter || (() => true))
    .map(normalizeHomepageProduct)
}

async function getFeaturedProducts() {
  try {
    if (!db) {
      return getStoredHomepageProducts((product) => (
        product.featured === true || product.recommended === true || product.new_product === true
      )).slice(0, 10)
    }

    return await db
      .select()
      .from(products)
      .limit(10)
      .then((result) => result.map(normalizeHomepageProduct))
  } catch {
    return []
  }
}

async function getServices() {
  try {
    if (!db) return []

    return await db
      .select()
      .from(services)
      .where(eq(services.active, true))
      .orderBy(services.order)
  } catch {
    return []
  }
}

async function getBestsellerProducts() {
  try {
    if (!db) {
      return getStoredHomepageProducts((product) => product.bestseller === true).slice(0, 6)
    }

    return await db
      .select()
      .from(products)
      .where(eq(products.bestseller, true))
      .limit(10)
      .then((result) => result.map(normalizeHomepageProduct))
  } catch {
    return []
  }
}

async function getDiscountedProducts() {
  try {
    if (!db) {
      return getStoredHomepageProducts((product) => resolveProductPrice(product).hasDiscount).slice(0, 8)
    }

    return await db
      .select()
      .from(products)
      .where(sql`${products.discount_price} IS NOT NULL`)
      .limit(8)
      .then((result) => result.map(normalizeHomepageProduct).filter((product) => resolveProductPrice(product).hasDiscount))
  } catch {
    return []
  }
}

async function getRecentOrders() {
  try {
    const storedProducts = getStoredProducts()
    const productById = new Map(storedProducts.map((product) => [Number(product.id), product]))
    const storedOrders = getStoredOrders()
      .slice()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 12)
      .map((order) => ({
        ...order,
        city: order.billingCity,
        items: (order.items || []).map((item) => {
          const product = productById.get(Number(item.productId))
          const image = product?.images?.find(Boolean) || product?.image || item.image || '/placeholder.jpg'
          return {
            ...item,
            slug: product?.slug,
            image,
          }
        }),
      }))

    if (storedOrders.length > 0) return storedOrders
    if (!db) return []

    return await db
      .select()
      .from(orders)
      .orderBy(sql`${orders.createdAt} DESC`)
      .limit(8)
  } catch {
    return []
  }
}

async function getApprovedReviews() {
  try {
    if (!db) return []

    return await db
      .select()
      .from(reviews)
      .where(eq(reviews.approved, true))
      .limit(10)
  } catch {
    return []
  }
}

async function getActiveSliders() {
  try {
    if (!db) return getStoredSliders().filter((slide) => slide.active)

    const result = await db
      .select()
      .from(sliders)
      .where(eq(sliders.active, true))
      .orderBy(sliders.order)
    return result.length ? result : getStoredSliders().filter((slide) => slide.active)
  } catch {
    return getStoredSliders().filter((slide) => slide.active)
  }
}

async function getProductOfTheDay() {
  try {
    if (!db) {
      return getStoredHomepageProducts((product) => product.featured === true).slice(0, 1)
    }

    return await db
      .select()
      .from(products)
      .where(eq(products.featured, true))
      .limit(1)
      .then((result) => result.map(normalizeHomepageProduct))
  } catch {
    return null
  }
}

async function getCountdownProducts() {
  try {
    if (!db) {
      return getStoredHomepageProducts((product) => resolveProductPrice(product).hasDiscount).slice(0, 4)
    }

    return await db
      .select()
      .from(products)
      .where(sql`${products.discount_price} IS NOT NULL`)
      .orderBy(products.discount_percentage)
      .limit(4)
      .then((result) => result.map(normalizeHomepageProduct).filter((product) => resolveProductPrice(product).hasDiscount))
  } catch {
    return []
  }
}

async function getHomepageCategories() {
  try {
    return getCategories().filter((category) => (
      category.active && category.type === 'main'
    ))
  } catch {
    return []
  }
}

export const metadata = {
  title: 'MK-eMotors Dornach | Premium Schweizer Elektromobilität',
  description: 'Entdecken Sie unsere Kollektion von hochwertigen E-Rollern, Escootern und Kabinenrollern. Premium Schweizer Qualität mit 0% Finanzierung.',
  openGraph: {
    title: 'MK-eMotors Dornach | Premium Schweizer Elektromobilität',
    description: 'Entdecken Sie unsere Kollektion von hochwertigen E-Rollern.',
    url: 'https://mk-emotors.ch',
  },
}

export const dynamic = 'force-dynamic'

export default async function Page() {
  const [featuredProducts, homepageCategories, allServices, bestsellers, discounted, recentOrders, approvedReviews, activeSliders, productOfDay, countdownProducts, heroSettings] = await Promise.all([
    getFeaturedProducts(),
    getHomepageCategories(),
    getServices(),
    getBestsellerProducts(),
    getDiscountedProducts(),
    getRecentOrders(),
    getApprovedReviews(),
    getActiveSliders(),
    getProductOfTheDay(),
    getCountdownProducts(),
    Promise.resolve(getHeroSettings()),
  ])

  return (
    <main className="w-full bg-background">
      <HomeAnnouncementTop />
      <MarqueeBannerRenderer placement="homepage_top" pagePath="/" />
      <MarqueeBannerRenderer placement="header_top" pagePath="/" />
      <LuxuryHeader />
      <MarqueeBannerRenderer placement="header_bottom" pagePath="/" />
      {heroSettings.enabled ? (
        <ManagedHero settings={heroSettings} />
      ) : activeSliders && activeSliders.length > 0 ? (
        <HeroSlider slides={activeSliders} />
      ) : (
        <PremiumHero
          title="MK-eMotors Dornach"
          subtitle="Willkommen"
          description="Entdecken Sie die Zukunft der Fortbewegung mit unserer exklusiven Kollektion hochwertiger Elektromobilität."
        />
      )}
      <SpecialDayHomepageBanner placement="hero_banner" />
      <HomeAnnouncementMarquee />
      <MarqueeBannerRenderer placement="homepage_after_hero" pagePath="/" />
      <HomeAnnouncementBanner />
      <MarqueeBannerRenderer placement="content_top" pagePath="/" />
      <section className="bg-secondary px-4 py-20 md:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 xl:grid-cols-[1.05fr_0.95fr]">
          <CategoryShowcase categories={homepageCategories} compact />
          <CountdownProductsSection products={countdownProducts} compact />
        </div>
      </section>
      <ProductShowcase 
        products={featuredProducts}
        title="Unsere Kollektion"
      />
      <EstimateAppointmentSection />
      <MarqueeBannerRenderer placement="homepage_middle" pagePath="/" />
      <BestsellerSection products={bestsellers} />
      <OffersSection products={discounted} />
      {productOfDay && productOfDay.length > 0 && (
        <ProductOfTheDaySection product={productOfDay[0]} />
      )}
      <LiveSalesSection orders={recentOrders} />
      <ReviewsCarouselSection reviews={approvedReviews} />
      <PremiumService 
        services={allServices}
        title="Unser Service"
        description="Premium Service für Ihre Mobilität"
      />
      <MarqueeBannerRenderer placement="homepage_bottom" pagePath="/" />
      <MarqueeBannerRenderer placement="content_bottom" pagePath="/" />
      
      {/* Financing CTA */}
      <section className="py-20 px-4 md:px-8 bg-secondary">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-black mb-6">
            <SplitTitle title="Flexible Finanzierung" />
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Berechnen Sie Ihre monatliche Rate mit unserem intelligenten Finanzierungsrechner.
            Flexible Laufzeiten und beste Konditionen.
          </p>
          <a
            href="/finanzierungsrechner"
            className="inline-block px-8 py-4 bg-accent text-accent-foreground font-semibold rounded-full hover:shadow-lg transition-all hover:scale-105"
          >
            Zum Finanzierungsrechner
          </a>
        </div>
      </section>
      <MarqueeBannerRenderer placement="footer_top" pagePath="/" />
      <Footer />
      <MarqueeBannerRenderer placement="footer_bottom" pagePath="/" />
    </main>
  )
}
