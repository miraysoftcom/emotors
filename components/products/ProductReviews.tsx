'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Star, Upload, Send } from 'lucide-react'

interface Review {
  id: number
  customerName: string
  rating: number
  title: string
  comment: string
  image?: string
}

interface ProductReviewsProps {
  productId: number
  reviews: Review[]
  onSubmit?: (review: any) => void
}

export function ProductReviews({ productId, reviews, onSubmit }: ProductReviewsProps) {
  const [formData, setFormData] = useState({
    customerName: '',
    rating: 5,
    title: '',
    comment: '',
    image: null as File | null,
  })
  const [uploading, setUploading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [eligibility, setEligibility] = useState({
    loading: true,
    authenticated: false,
    canReview: false,
    customerName: '',
  })

  const approvedReviews = reviews.filter((r: any) => r.approved !== false)
  const averageRating = approvedReviews.length > 0
    ? (approvedReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / approvedReviews.length).toFixed(1)
    : 0

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFormData({ ...formData, image: e.target.files[0] })
    }
  }

  useEffect(() => {
    let active = true

    async function loadEligibility() {
      setEligibility((current) => ({ ...current, loading: true }))
      try {
        const response = await fetch(`/api/reviews?productId=${productId}`, {
          credentials: 'include',
          cache: 'no-store',
        })
        const data = await response.json()
        const next = data.eligibility || {}
        if (!active) return
        setEligibility({
          loading: false,
          authenticated: Boolean(next.authenticated),
          canReview: Boolean(next.canReview),
          customerName: next.customerName || '',
        })
        if (next.customerName) {
          setFormData((current) => ({ ...current, customerName: next.customerName }))
        }
      } catch {
        if (!active) return
        setEligibility({ loading: false, authenticated: false, canReview: false, customerName: '' })
      }
    }

    loadEligibility()
    return () => {
      active = false
    }
  }, [productId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploading(true)
    setError('')

    try {
      const formDataObj = new FormData()
      formDataObj.append('productId', productId.toString())
      formDataObj.append('customerName', eligibility.customerName || formData.customerName)
      formDataObj.append('rating', formData.rating.toString())
      formDataObj.append('title', formData.title)
      formDataObj.append('comment', formData.comment)
      if (formData.image) {
        formDataObj.append('image', formData.image)
      }

      const response = await fetch('/api/reviews', {
        method: 'POST',
        body: formDataObj,
        credentials: 'include',
      })
      const data = await response.json().catch(() => ({}))

      if (response.ok) {
        setSubmitted(true)
        setFormData({ customerName: eligibility.customerName, rating: 5, title: '', comment: '', image: null })
        setTimeout(() => setSubmitted(false), 3000)
      } else {
        setError(data.error || 'Bewertung konnte nicht gesendet werden.')
      }
    } catch (error) {
      console.error('Error submitting review:', error)
      setError('Bewertung konnte nicht gesendet werden.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <section className="py-12 border-t border-gray-200">
      <h2 className="text-3xl font-bold text-gray-900 mb-8">Bewertungen</h2>

      {/* Average Rating */}
      {approvedReviews.length > 0 && (
        <div className="mb-12 p-6 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600">{averageRating}</div>
              <div className="flex gap-1 mt-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={20}
                    className={i < Math.round(Number(averageRating)) ? 'fill-warning text-warning' : 'text-muted-foreground/40'}
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {approvedReviews.length} {approvedReviews.length === 1 ? 'Bewertung' : 'Bewertungen'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-6 mb-12">
        {approvedReviews.length === 0 && (
          <div className="theme-card p-8 text-center">
            <h3 className="text-xl font-bold text-foreground">Noch keine Bewertungen</h3>
            <p className="mt-2 text-muted-foreground">
              Für dieses Produkt wurden bisher keine Bewertungen veröffentlicht.
            </p>
          </div>
        )}
        {approvedReviews.map((review: Review, index: number) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="theme-card p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="font-bold text-foreground">{review.title}</h4>
                <p className="text-sm text-muted-foreground mt-1">{review.customerName}</p>
              </div>
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={i < review.rating ? 'fill-warning text-warning' : 'text-muted-foreground/40'}
                  />
                ))}
              </div>
            </div>

            <p className="text-muted-foreground mb-4">{review.comment}</p>

            {review.image && (
              <img
                src={review.image}
                alt="Review"
                className="w-32 h-32 object-cover rounded-lg"
              />
            )}
          </motion.div>
        ))}
      </div>

      {/* Review Form */}
      <div className="theme-card p-8">
        <h3 className="text-2xl font-bold text-foreground mb-6">
          Ihre Bewertung schreiben
        </h3>

        {submitted && (
          <div className="mb-6 p-4 status-success rounded-lg">
            Vielen Dank für Ihre Bewertung. Sie wird nach der Prüfung veröffentlicht.
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm font-semibold text-destructive">
            {error}
          </div>
        )}

        {eligibility.loading && (
          <div className="rounded-2xl border border-border bg-secondary/50 p-5 text-sm font-semibold text-muted-foreground">
            Bewertung wird vorbereitet...
          </div>
        )}

        {!eligibility.loading && !eligibility.authenticated && (
          <div className="rounded-2xl border border-border bg-secondary/50 p-5 text-sm font-semibold text-muted-foreground">
            Bitte melden Sie sich an, um eine Bewertung zu schreiben. Bewertungen sind nur für gekaufte Produkte möglich.
          </div>
        )}

        {!eligibility.loading && eligibility.authenticated && !eligibility.canReview && (
          <div className="rounded-2xl border border-warning/40 bg-warning/10 p-5 text-sm font-semibold text-foreground">
            Sie können dieses Produkt bewerten, sobald es in Ihren Bestellungen vorhanden ist.
          </div>
        )}

        {!eligibility.loading && eligibility.canReview && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Name *
            </label>
            <input
              type="text"
              required
              readOnly
              value={eligibility.customerName || formData.customerName}
              className="w-full px-4 py-2 border border-border bg-input text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Ihr Name"
            />
            <p className="mt-2 text-xs text-muted-foreground">
              Der Name wird aus Ihrem Kundenkonto übernommen.
            </p>
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Bewertung *
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => setFormData({ ...formData, rating })}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <Star
                    size={32}
                    className={rating <= formData.rating ? 'fill-warning text-warning' : 'text-muted-foreground/40'}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Überschrift *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-border bg-input text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Kurze Überschrift"
            />
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Ihre Bewertung *
            </label>
            <textarea
              required
              value={formData.comment}
              onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
              className="w-full px-4 py-2 border border-border bg-input text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-ring h-24 resize-none"
              placeholder="Ihre Erfahrung mit dem Produkt"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Foto (optional)
            </label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 px-4 py-2 bg-secondary border border-border rounded-lg cursor-pointer hover:bg-surface-hover">
                <Upload size={20} />
                <span>Foto hochladen</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
              {formData.image && (
                <span className="text-sm text-muted-foreground">
                  {formData.image.name}
                </span>
              )}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={uploading}
            className="w-full bg-accent text-accent-foreground py-3 rounded-lg font-semibold hover:bg-accent/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Send size={20} />
            {uploading ? 'Wird übermittelt...' : 'Bewertung abschicken'}
          </button>
        </form>
        )}
      </div>
    </section>
  )
}
