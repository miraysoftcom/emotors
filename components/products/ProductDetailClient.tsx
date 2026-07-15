'use client'

import { LuxuryHeader } from '@/components/navigation/LuxuryHeader'
import { Footer } from '@/components/navigation/Footer'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Heart, ShoppingBag, Truck, RotateCcw, Check, Star } from 'lucide-react'
import Link from 'next/link'
import { ProductReviews } from '@/components/products/ProductReviews'
import { ProductSocialSharing } from '@/components/products/ProductSocialSharing'
import { resolveProductPrice } from '@/lib/product-price'
import { formatMoney } from '@/lib/money'
import { useCartStore } from '@/lib/store/cartStore'
import { useFavoritesStore } from '@/lib/store/favoritesStore'
import { getProductImageBackground } from '@/lib/product-image-background'

interface Product {
  id: number
  title: string
  slug: string
  price: number
  discount_price: number | null
  discount_percentage?: number | null
  monthly_price: number | null
  sales_start?: string | Date | null
  sales_end?: string | Date | null
  short_description: string | null
  description: string | null
  long_description: string | null
  image: string | null
  images: string[]
  power_watts: number | null
  battery_capacity: string | null
  range_km: number | null
  max_speed: number | null
  weight_kg: number | null
  charge_time: string | null
  warranty: string | null
  color: string[]
  stock_quantity: number
  featured: boolean
  new_product: boolean
  bestseller: boolean
  financing_available: boolean
  license_required: string | null
  condition: string
  metadata?: {
    variants?: ProductVariant[]
    [key: string]: unknown
  } | null
}

interface ProductVariant {
  id: string
  name: string
  hex?: string
  sku?: string
  ean?: string
  price_delta?: number
  stock_quantity?: number
  active?: boolean
  is_default?: boolean
  delivery_status?: string
  image?: string
}

export function ProductDetailClient() {
  const params = useParams()
  const slug = params?.slug as string
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('specs')
  const [reviews, setReviews] = useState<any[]>([])
  const [reviewSummary, setReviewSummary] = useState({ total: 0, average: 0 })
  const [addedToCart, setAddedToCart] = useState(false)
  const { addItem } = useCartStore()
  const { toggleFavorite, isFavorite } = useFavoritesStore()

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products?search=${slug}`)
        if (res.ok) {
          const data = await res.json()
          const foundProduct = (data.data || data).find(
            (p: Product) => p.slug === slug
          )
          if (foundProduct) {
            setProduct(foundProduct)
            const variants = getActiveVariants(foundProduct)
            const defaultVariant = variants.find((variant) => variant.is_default) || variants[0]
            if (defaultVariant?.name) {
              setSelectedColor(defaultVariant.name)
              setSelectedImage(0)
            } else if (foundProduct.color && foundProduct.color.length > 0) {
              setSelectedColor(foundProduct.color[0])
              setSelectedImage(0)
            }
          }
        }
      } catch (error) {
        console.error('Error fetching product:', error)
      } finally {
        setLoading(false)
      }
    }

    if (slug) fetchProduct()
  }, [slug])

  useEffect(() => {
    const fetchReviews = async () => {
      if (!product?.id) return
      try {
        const res = await fetch(`/api/reviews?productId=${product.id}`)
        if (res.ok) {
          const data = await res.json()
          setReviews(data.reviews || [])
          setReviewSummary({
            total: data.total || (data.reviews || []).length || 0,
            average: Number(data.average || 0),
          })
        }
      } catch (error) {
        console.error('Error fetching reviews:', error)
      }
    }
    fetchReviews()
  }, [product?.id])

  if (loading) {
    return (
      <main className="w-full bg-background">
        <LuxuryHeader />
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-accent" />
        </div>
      </main>
    )
  }

  if (!product) {
    return (
      <main className="w-full bg-background">
        <LuxuryHeader />
        <section className="py-12 px-4 md:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-3xl font-bold text-foreground mb-4">Produkt nicht gefunden</h1>
            <Link href="/produkte" className="text-accent hover:underline">
              Zurück zur Produktliste
            </Link>
          </div>
        </section>
      </main>
    )
  }

  const pricing = resolveProductPrice(product)
  const activeVariants = getActiveVariants(product)
  const selectedVariant = activeVariants.find((variant) => sameColorName(variant.name, selectedColor))
  const displayImages = buildDisplayImages(product, selectedVariant)
  const variantPriceDelta = Number(selectedVariant?.price_delta || 0)
  const displayPrice = pricing.effectivePrice + variantPriceDelta
  const formattedDisplayPrice = formatMoney(displayPrice, 'CHF')
  const discount = pricing.hasDiscount ? pricing.discountPercentage : null
  const variantStock = selectedVariant?.stock_quantity
  const inStock = typeof variantStock === 'number' ? variantStock > 0 : product.stock_quantity > 0
  const productId = String(product.id)
  const favorite = isFavorite(productId)
  const selectedDisplayImage = displayImages[selectedImage] || displayImages[0] || ''
  const imageBackground = getProductImageBackground(product.metadata || null)

  const handleAddToCart = () => {
    if (!inStock) return
    addItem({
      id: productId,
      title: selectedColor ? `${product.title} - ${selectedColor}` : product.title,
      price: displayPrice,
      quantity,
      image: selectedDisplayImage,
      handle: product.slug,
      stock_quantity: typeof variantStock === 'number' ? variantStock : product.stock_quantity,
    })
    setAddedToCart(true)
    window.setTimeout(() => setAddedToCart(false), 1800)
  }

  return (
    <main className="w-full bg-background">
      <LuxuryHeader />

      {/* Breadcrumb */}
      <section className="py-4 px-4 md:px-8 border-b border-border">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <span>/</span>
            <Link href="/produkte" className="hover:text-foreground">Produkte</Link>
            <span>/</span>
            <span className="text-foreground">{product.title}</span>
          </div>
        </div>
      </section>

      {/* Product Section */}
      <section className="py-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left - Image Gallery */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="sticky top-32 h-fit"
            >
              {/* Main Image */}
              <div
                className="relative w-full aspect-square bg-secondary rounded-2xl overflow-hidden mb-4 border border-border"
                style={imageBackground.style}
              >
                {selectedDisplayImage ? (
                  <motion.img
                    key={`${selectedColor || 'default'}-${selectedImage}-${selectedDisplayImage}`}
                    src={selectedDisplayImage}
                    alt={selectedColor ? `${product.title} ${selectedColor}` : product.title}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="w-full h-full object-contain p-8"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    Kein Bild
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {displayImages.length > 1 && (
                <div className="grid grid-cols-4 gap-3">
                  {displayImages.map((img, idx) => (
                    <motion.button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      whileHover={{ scale: 1.05 }}
                      className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                        selectedImage === idx
                          ? 'border-accent'
                          : 'border-border hover:border-accent/50'
                      }`}
                      style={imageBackground.style}
                    >
                      <img
                        src={img}
                        alt={`${product.title} ${selectedColor || ''} ${idx + 1}`.trim()}
                        className="w-full h-full object-contain p-2"
                      />
                    </motion.button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Right - Product Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="space-y-6"
            >
              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                {product.new_product && (
                  <span className="px-3 py-1 bg-accent text-accent-foreground rounded-full text-xs font-bold">
                    NEU
                  </span>
                )}
                {product.bestseller && (
                  <span className="px-3 py-1 bg-green-600 text-white rounded-full text-xs font-bold">
                    BESTSELLER
                  </span>
                )}
                {product.featured && (
                  <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-xs font-bold">
                    FEATURED
                  </span>
                )}
              </div>

              {/* Title */}
              <div>
                <h1 className="text-4xl font-black text-foreground mb-2">
                  {product.title}
                </h1>
                <p className="text-muted-foreground">{product.short_description}</p>
              </div>

              {/* Rating & Reviews */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      size={16}
                      className={i <= Math.round(reviewSummary.average) ? 'fill-accent text-accent' : 'text-muted-foreground'}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {reviewSummary.total > 0 ? `(${reviewSummary.total} Bewertungen)` : 'Noch keine Bewertungen'}
                </span>
              </div>

              {/* Pricing */}
              <div className="space-y-2">
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-black text-foreground">
                    {formattedDisplayPrice}
                  </span>
                  {discount && (
                    <>
                      <span className="text-xl text-muted-foreground line-through">
                        {pricing.formattedRegularPrice}
                      </span>
                      <span className="px-2 py-1 bg-red-600 text-white rounded text-sm font-bold">
                        -{discount}%
                      </span>
                    </>
                  )}
                </div>
                {(product.monthly_price || pricing.hasDiscount) && product.financing_available && (
                  <p className="text-accent font-semibold">
                    Ab {pricing.formattedMonthlyPrice}/Monat mit Finanzierung
                  </p>
                )}
                {variantPriceDelta !== 0 && (
                  <p className="text-sm text-muted-foreground">
                    Farbvariante: {variantPriceDelta > 0 ? '+' : ''}{formatMoney(variantPriceDelta, 'CHF')}
                  </p>
                )}
              </div>

              {/* Stock Status */}
              <div className={`p-3 rounded-lg ${inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {inStock ? (
                  <p className="flex items-center gap-2">
                    <Check size={16} />
                    {typeof variantStock === 'number' ? variantStock : product.stock_quantity} auf Lager verfügbar
                  </p>
                ) : (
                  <p>Momentan nicht verfügbar</p>
                )}
              </div>

              {/* Color Selection */}
              {product.color && product.color.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Farbe
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {product.color.map((color) => {
                      const variant = activeVariants.find((item) => sameColorName(item.name, color))
                      return (
                      <button
                        key={color}
                        onClick={() => {
                          setSelectedColor(color)
                          setSelectedImage(0)
                        }}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                          selectedColor === color
                            ? 'border-accent bg-accent text-accent-foreground'
                            : 'border-border hover:border-accent'
                        }`}
                      >
                        {variant?.hex && (
                          <span className="h-4 w-4 rounded-full border border-border" style={{ backgroundColor: variant.hex }} />
                        )}
                        {color}
                      </button>
                    )})}
                  </div>
                  {selectedVariant?.image && (
                    <p className="mt-2 text-xs text-muted-foreground">Bild passend zur Farbe {selectedColor} aktiv.</p>
                  )}
                </div>
              )}

              {/* Quantity & CTA */}
              <div className="flex gap-4">
                <div className="flex items-center border border-border rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 text-foreground hover:bg-secondary"
                  >
                    −
                  </button>
                  <span className="px-4 py-2 text-foreground">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-4 py-2 text-foreground hover:bg-secondary"
                  >
                    +
                  </button>
                </div>
                <button
                  disabled={!inStock}
                  onClick={handleAddToCart}
                  className="flex-1 bg-accent hover:bg-accent/90 disabled:opacity-50 text-accent-foreground font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <ShoppingBag size={20} />
                  {addedToCart ? 'Hinzugefügt' : 'In den Warenkorb'}
                </button>
                <button
                  onClick={() => toggleFavorite({
                    id: productId,
                    title: product.title,
                    price: displayPrice,
                    image: selectedDisplayImage,
                    handle: product.slug,
                    stock_quantity: typeof variantStock === 'number' ? variantStock : product.stock_quantity,
                  })}
                  className="px-6 py-3 border border-border rounded-lg hover:border-accent transition-colors"
                  aria-label="Favorit umschalten"
                >
                  <Heart
                    size={20}
                    className={favorite ? 'fill-red-600 text-red-600' : 'text-foreground'}
                  />
                </button>
              </div>

              <ProductSocialSharing
                product={{
                  id: product.id,
                  slug: product.slug,
                  title: product.title,
                  price: product.price,
                  discount_price: product.discount_price,
                  discount_percentage: product.discount_percentage,
                  sales_start: product.sales_start,
                  sales_end: product.sales_end,
                  description: product.description || product.short_description || '',
                  image: selectedDisplayImage,
                }}
              />

              {/* Shipping Info */}
              <div className="space-y-3 p-4 bg-secondary rounded-lg border border-border">
                <div className="flex items-start gap-3">
                  <Truck size={20} className="text-accent mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-foreground">Kostenloser Versand</p>
                    <p className="text-sm text-muted-foreground">In der ganzen Schweiz</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <RotateCcw size={20} className="text-accent mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-foreground">30 Tage Rückgabe</p>
                    <p className="text-sm text-muted-foreground">Kostenlos und ohne Fragen</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Tabs Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-16"
          >
            <div className="flex gap-4 border-b border-border mb-6">
              {['specs', 'description', 'reviews'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 font-semibold transition-colors border-b-2 ${
                    activeTab === tab
                      ? 'text-accent border-accent'
                      : 'text-muted-foreground border-transparent hover:text-foreground'
                  }`}
                >
                  {tab === 'specs' && 'Spezifikationen'}
                  {tab === 'description' && 'Beschreibung'}
                  {tab === 'reviews' && 'Bewertungen'}
                </button>
              ))}
            </div>

            {/* Specs Tab */}
            {activeTab === 'specs' && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {product.power_watts && (
                  <div>
                    <p className="text-sm text-muted-foreground">Motorleistung</p>
                    <p className="text-lg font-semibold text-foreground">{product.power_watts}W</p>
                  </div>
                )}
                {product.max_speed && (
                  <div>
                    <p className="text-sm text-muted-foreground">Max. Geschwindigkeit</p>
                    <p className="text-lg font-semibold text-foreground">{product.max_speed}km/h</p>
                  </div>
                )}
                {product.range_km && (
                  <div>
                    <p className="text-sm text-muted-foreground">Reichweite</p>
                    <p className="text-lg font-semibold text-foreground">{product.range_km}km</p>
                  </div>
                )}
                {product.battery_capacity && (
                  <div>
                    <p className="text-sm text-muted-foreground">Batterie</p>
                    <p className="text-lg font-semibold text-foreground">{product.battery_capacity}</p>
                  </div>
                )}
                {product.charge_time && (
                  <div>
                    <p className="text-sm text-muted-foreground">Ladezeit</p>
                    <p className="text-lg font-semibold text-foreground">{product.charge_time}</p>
                  </div>
                )}
                {product.weight_kg && (
                  <div>
                    <p className="text-sm text-muted-foreground">Gewicht</p>
                    <p className="text-lg font-semibold text-foreground">{product.weight_kg}kg</p>
                  </div>
                )}
              </div>
            )}

            {/* Description Tab */}
            {activeTab === 'description' && (
              <div
                className="managed-page-content prose prose-invert max-w-none text-foreground"
                dangerouslySetInnerHTML={{ __html: product.long_description || product.description || 'Keine Beschreibung verfügbar.' }}
              />
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <ProductReviews productId={product.id} reviews={reviews} />
            )}
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  )
}

function getActiveVariants(product: Product | null): ProductVariant[] {
  const variants = product?.metadata?.variants
  if (!Array.isArray(variants)) return []
  return variants
    .filter((variant): variant is ProductVariant => Boolean(variant && typeof variant === 'object' && 'name' in variant))
    .filter((variant) => variant.active !== false && String(variant.name || '').trim().length > 0)
}

function sameColorName(left?: string | null, right?: string | null) {
  return normalizeColorName(left) === normalizeColorName(right)
}

function normalizeColorName(value?: string | null) {
  return String(value || '').trim().toLowerCase()
}

function buildDisplayImages(product: Product, selectedVariant?: ProductVariant) {
  const baseImages = [
    product.image || '',
    ...(Array.isArray(product.images) ? product.images : []),
  ].filter(Boolean)
  const images = selectedVariant?.image ? [selectedVariant.image, ...baseImages] : baseImages
  return Array.from(new Set(images))
}
