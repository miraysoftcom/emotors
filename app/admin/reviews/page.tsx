'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Check, Trash2, Eye } from 'lucide-react'

interface Review {
  id: number
  productId: number
  customerName: string
  rating: number
  title: string
  comment: string
  approved: boolean
  image?: string
  createdAt: Date
}

export default function ReviewsAdminPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all')

  useEffect(() => {
    fetchReviews()
  }, [])

  const fetchReviews = async () => {
    try {
      const response = await fetch('/api/admin/reviews')
      const data = await response.json()
      setReviews(data.reviews || [])
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id: number) => {
    try {
      await fetch(`/api/admin/reviews/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved: true }),
      })
      fetchReviews()
    } catch (error) {
      console.error('Error approving review:', error)
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm('Sind Sie sicher, dass Sie diese Bewertung löschen möchten?')) {
      try {
        await fetch(`/api/admin/reviews/${id}`, { method: 'DELETE' })
        fetchReviews()
      } catch (error) {
        console.error('Error deleting review:', error)
      }
    }
  }

  const filteredReviews = reviews.filter((r) => {
    if (filter === 'pending') return !r.approved
    if (filter === 'approved') return r.approved
    return true
  })

  return (
    <div className="p-8 bg-gradient-to-br from-slate-900 to-slate-800 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Kundenbewertungen verwalten
          </h1>
          <p className="text-gray-400">
            {reviews.length} Bewertungen insgesamt
          </p>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-8">
          {['all', 'pending', 'approved'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                filter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
              }`}
            >
              {f === 'all' && 'Alle'}
              {f === 'pending' && 'Ausstehend'}
              {f === 'approved' && 'Genehmigt'}
            </button>
          ))}
        </div>

        {/* Reviews Grid */}
        {loading ? (
          <div className="text-center text-gray-400">Wird geladen...</div>
        ) : filteredReviews.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            Keine Bewertungen gefunden
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReviews.map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-slate-700 rounded-lg p-6 border border-slate-600 hover:border-blue-500 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-white font-bold text-lg">
                      {review.title}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      {review.customerName} • {review.rating} Sterne
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    review.approved
                      ? 'bg-green-900 text-green-200'
                      : 'bg-yellow-900 text-yellow-200'
                  }`}>
                    {review.approved ? 'Genehmigt' : 'Ausstehend'}
                  </span>
                </div>

                <p className="text-gray-300 mb-4">
                  {review.comment}
                </p>

                <div className="flex items-center gap-4 pt-4 border-t border-slate-600">
                  {!review.approved && (
                    <button
                      onClick={() => handleApprove(review.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                    >
                      <Check size={18} />
                      Genehmigen
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(review.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                    Löschen
                  </button>

                  {review.image && (
                    <a
                      href={review.image}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      <Eye size={18} />
                      Bild ansehen
                    </a>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
