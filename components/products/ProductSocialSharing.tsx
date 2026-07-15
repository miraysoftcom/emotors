'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Instagram, Facebook, MessageCircle, Share2, Link as LinkIcon, Copy } from 'lucide-react'
import { resolveProductPrice } from '@/lib/product-price'

interface ProductSocialSharingProps {
  product: {
    id: number
    slug: string
    title: string
    price: number
    discount_price?: number | null
    discount_percentage?: number | null
    sales_start?: string | Date | null
    sales_end?: string | Date | null
    description?: string
    image: string
  }
}

export function ProductSocialSharing({ product }: ProductSocialSharingProps) {
  const [copied, setCopied] = useState(false)

  const productUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://mk-emotors.ch'}/produkte/${product.slug}`
  const pricing = resolveProductPrice(product)
  const shareText = `${product.title} - ${pricing.formattedEffectivePrice} - MK-eMotors Dornach`
  const shareDescription = product.description || `Hochwertiges E-Fahrzeug von MK-eMotors Dornach`

  const shareLinks = {
    whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + productUrl)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`,
    instagram: `https://www.instagram.com/?url=${encodeURIComponent(productUrl)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(productUrl)}`,
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(productUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = (platform: string) => {
    if (platform === 'copy') {
      handleCopyLink()
      return
    }

    const url = shareLinks[platform as keyof typeof shareLinks]
    if (url) {
      window.open(url, '_blank', 'width=600,height=400')
    }
  }

  const shareButtons = [
    { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, color: 'hover:text-green-500' },
    { id: 'facebook', label: 'Facebook', icon: Facebook, color: 'hover:text-blue-600' },
    { id: 'instagram', label: 'Instagram', icon: Instagram, color: 'hover:text-pink-600' },
    { id: 'twitter', label: 'X (Twitter)', icon: Share2, color: 'hover:text-black' },
    { id: 'copy', label: 'Link kopieren', icon: copied ? Copy : LinkIcon, color: 'hover:text-gray-600' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="py-8 border-t border-b border-gray-200"
    >
      <h3 className="text-lg font-bold text-gray-900 mb-4">
        Teilen Sie dieses Produkt
      </h3>

      <div className="flex flex-wrap gap-3">
        {shareButtons.map((button) => {
          const Icon = button.icon
          return (
            <motion.button
              key={button.id}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleShare(button.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 hover:border-gray-400 transition-all ${button.color} text-gray-700`}
              title={button.label}
            >
              <Icon size={20} />
              <span className="text-sm font-semibold">{button.label}</span>
            </motion.button>
          )
        })}
      </div>

      {copied && (
        <p className="text-sm text-green-600 mt-4">
          ✓ Link in die Zwischenablage kopiert
        </p>
      )}

      {/* Open Graph Meta Tags Info */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-xs text-gray-600">
          Wenn Sie diesen Link teilen, wird eine Vorschau mit Produktbild, Titel und Preis angezeigt.
        </p>
      </div>
    </motion.div>
  )
}
