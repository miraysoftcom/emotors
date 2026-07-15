import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { ProductForm } from '../../form'
import { db } from '@/lib/db'
import { products } from '@/lib/db/schema'
import { getStoredProduct } from '@/lib/products-store'
import { eq } from 'drizzle-orm'

interface EditProductPageProps {
  params: Promise<{ id: string }>
}

async function getProduct(id: string) {
  try {
    const productId = Number(id)
    if (!Number.isFinite(productId)) return null

    if (!db) return getStoredProduct(productId)

    const result = await db
      .select()
      .from(products)
      .where(eq(products.id, productId))
      .limit(1)

    return result[0] || null
  } catch {
    return null
  }
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params
  const product = await getProduct(id)

  if (!product) notFound()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="sticky top-0 z-40 border-b border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center gap-4">
          <Link
            href="/admin/products"
            className="text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              Produkt bearbeiten
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              {product.title}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProductForm mode="edit" productId={Number(id)} initialData={product} />
      </div>
    </div>
  )
}
