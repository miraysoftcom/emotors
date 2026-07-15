'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

interface BannerProps {
  id: number
  type: string
  image?: string
  video?: string
  headline?: string
  description?: string
  buttonText?: string
  buttonUrl?: string
  height: string
  width: string
  backgroundColor?: string
  overlayOpacity: number
  textPosition: string
  buttonStyle: string
  borderRadius: string
  animation: string
}

const animationVariants: Record<string, any> = {
  fadeIn: {
    initial: { opacity: 0 },
    whileInView: { opacity: 1 },
  },
  slideUp: {
    initial: { opacity: 0, y: 50 },
    whileInView: { opacity: 1, y: 0 },
  },
  slideDown: {
    initial: { opacity: 0, y: -50 },
    whileInView: { opacity: 1, y: 0 },
  },
  slideLeft: {
    initial: { opacity: 0, x: 50 },
    whileInView: { opacity: 1, x: 0 },
  },
  slideRight: {
    initial: { opacity: 0, x: -50 },
    whileInView: { opacity: 1, x: 0 },
  },
  zoom: {
    initial: { opacity: 0, scale: 0.8 },
    whileInView: { opacity: 1, scale: 1 },
  },
}

export function BannerComponent({ banner }: { banner: BannerProps }) {
  const textPositionClass = {
    left: 'text-left items-start',
    center: 'text-center items-center',
    right: 'text-right items-end',
  }[banner.textPosition] || 'text-center items-center'

  const buttonClass = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
    outline: 'border-2 border-white text-white hover:bg-white hover:text-black',
  }[banner.buttonStyle] || 'bg-blue-600 hover:bg-blue-700 text-white'

  const animationConfig = animationVariants[banner.animation] || animationVariants.fadeIn

  return (
    <motion.div
      initial={animationConfig.initial}
      whileInView={animationConfig.whileInView}
      transition={{ duration: 0.6 }}
      className="w-full overflow-hidden"
      style={{
        height: banner.height,
        width: banner.width,
        borderRadius: banner.borderRadius,
      }}
    >
      <div className="relative w-full h-full">
        {/* Background */}
        {banner.image && (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${banner.image})`,
            }}
          />
        )}
        {banner.video && (
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            src={banner.video}
          />
        )}

        {/* Overlay */}
        <div
          className="absolute inset-0 bg-black"
          style={{ opacity: banner.overlayOpacity / 100 }}
        />
        {banner.backgroundColor && !banner.image && !banner.video && (
          <div
            className="absolute inset-0"
            style={{ backgroundColor: banner.backgroundColor }}
          />
        )}

        {/* Content */}
        <div className={`absolute inset-0 flex flex-col gap-4 px-4 md:px-8 lg:px-12 py-8 md:py-12 justify-center ${textPositionClass}`}>
          {banner.headline && (
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">
              {banner.headline}
            </h2>
          )}

          {banner.description && (
            <div
              className="managed-page-content max-w-xl text-lg text-gray-200"
              dangerouslySetInnerHTML={{ __html: banner.description }}
            />
          )}

          {banner.buttonText && banner.buttonUrl && (
            <div className="mt-4">
              <Link
                href={banner.buttonUrl}
                className={`inline-block font-bold py-3 px-8 rounded-lg transition-all duration-300 hover:scale-105 ${buttonClass}`}
              >
                {banner.buttonText}
              </Link>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
