'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, ArrowLeft } from 'lucide-react'
import { ProductsDataTable } from '@/components/admin/ProductsDataTable'

export default function AdminProductsPage() {
  const [refreshKey, setRefreshKey] = useState(0)

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/dashboard"
              className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              Products
            </h1>
          </div>
          <Link
            href="/admin/products/new"
            className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent/90 text-white rounded-lg font-semibold transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create Product
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProductsDataTable key={refreshKey} onRefresh={handleRefresh} />
      </div>
    </div>
  )
}
