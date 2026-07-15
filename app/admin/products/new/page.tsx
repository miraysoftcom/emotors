import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { ProductForm } from '../form'

export default function NewProductPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center gap-4">
          <Link
            href="/admin/products"
            className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              Produkt erstellen
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Erstellen Sie ein neues Produkt in Ihrem Katalog
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProductForm mode="create" />
      </div>
    </div>
  )
}
