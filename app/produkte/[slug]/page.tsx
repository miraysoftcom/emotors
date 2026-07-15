import type { Metadata } from 'next'
import { ProductDetailClient } from '@/components/products/ProductDetailClient'
import { loadShopProducts } from '@/lib/shop-listing'
import { resolveProductPrice } from '@/lib/product-price'

type PageProps = {
  params: Promise<{ slug: string }>
}

const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://mk-emotors.ch'

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductForMetadata(slug)

  if (!product) {
    return {
      title: 'Produkt | MK-eMotors Dornach',
      description: 'MK-eMotors Dornach Produktdetail',
    }
  }

  const pricing = resolveProductPrice(product)
  const title = `${product.title} | MK-eMotors Dornach`
  const description = product.short_description || product.description || `${product.title} fuer ${pricing.formattedEffectivePrice} bei MK-eMotors Dornach.`
  const url = `${siteUrl.replace(/\/$/, '')}/produkte/${product.slug}`
  const image = absoluteUrl(product.image || product.images?.[0] || '/hero-background.png')

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: 'MK-eMotors Dornach',
      type: 'website',
      images: [{ url: image, width: 1200, height: 630, alt: product.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  }
}

export default function ProductDetailPage() {
  return <ProductDetailClient />
}

async function getProductForMetadata(slug: string) {
  const listing = await loadShopProducts({ search: slug })
  return listing.products.find((product) => product.slug === slug) || null
}

function absoluteUrl(value: string) {
  if (/^https?:\/\//i.test(value)) return value
  return `${siteUrl.replace(/\/$/, '')}/${value.replace(/^\//, '')}`
}
