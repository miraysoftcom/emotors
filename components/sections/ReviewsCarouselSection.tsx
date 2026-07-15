'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, ChevronLeft, ChevronRight } from 'lucide-react'
import { SplitTitle } from '@/components/common/SplitTitle'

interface Review {
  id: number
  customerName: string
  rating: number
  comment: string
  title: string
  image?: string
}

interface ReviewsCarouselSectionProps {
  reviews: Review[]
}

export function ReviewsCarouselSection({ reviews }: ReviewsCarouselSectionProps) {
  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState(0)

  if (!reviews || reviews.length === 0) return null

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      zIndex: 0,
      x: dir < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  }

  const paginate = (newDirection: number) => {
    setDirection(newDirection)
    setCurrent((prev) => (prev + newDirection + reviews.length) % reviews.length)
  }

  const review = reviews[current]

  return (
    <section className="py-20 px-4 md:px-8 bg-white">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <SplitTitle title="Kundenbewertungen" />
          </h2>
          <p className="text-xl text-gray-600">
            Das sagen unsere Kunden über ihre Erfahrung mit uns
          </p>
        </motion.div>

        <div className="relative">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={current}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: 'spring', stiffness: 300, damping: 30 },
                opacity: { duration: 0.5 },
              }}
              className="w-full"
            >
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 md:p-12 shadow-xl">
                {/* Stars */}
                <div className="flex gap-2 mb-6">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={24}
                      className={i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                    />
                  ))}
                </div>

                {/* Review Title */}
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {review.title}
                </h3>

                {/* Review Comment */}
                <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                  &quot;{review.comment}&quot;
                </p>

                {/* Customer Info */}
                <div className="flex items-center gap-4">
                  {review.image && (
                    <img
                      src={review.image}
                      alt={review.customerName}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <p className="font-bold text-gray-900">
                      {review.customerName}
                    </p>
                    <p className="text-sm text-gray-600">
                      Verifizierter Kunde
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <button
            onClick={() => paginate(-1)}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-16 md:-translate-x-20 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full transition-colors"
          >
            <ChevronLeft size={24} />
          </button>

          <button
            onClick={() => paginate(1)}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-16 md:translate-x-20 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full transition-colors"
          >
            <ChevronRight size={24} />
          </button>
        </div>

        {/* Indicators */}
        <div className="flex justify-center gap-2 mt-8">
          {reviews.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setDirection(index > current ? 1 : -1)
                setCurrent(index)
              }}
              className={`h-2 rounded-full transition-all ${
                index === current
                  ? 'bg-blue-600 w-8'
                  : 'bg-gray-300 w-2 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
