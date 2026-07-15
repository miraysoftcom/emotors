'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link as LinkIcon, Copy, Send } from 'lucide-react'
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

  const productUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/produkte/${product.slug}`
    : `${process.env.NEXT_PUBLIC_BASE_URL || 'https://mk-emotors.ch'}/produkte/${product.slug}`
  const pricing = resolveProductPrice(product)
  const shareText = `${product.title} - ${pricing.formattedEffectivePrice} - MK-eMotors Dornach`

  const shareLinks = {
    whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + productUrl)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`,
    instagram: `https://www.instagram.com/`,
    x: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(productUrl)}`,
    tiktok: `https://www.tiktok.com/`,
  }

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(productUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = async (platform: string) => {
    if (platform === 'copy') {
      handleCopyLink()
      return
    }
    if (platform === 'native') {
      if (navigator.share) {
        const file = await getShareImageFile(product.image, product.title)
        if (file && navigator.canShare?.({ files: [file] })) {
          navigator.share({ title: product.title, text: shareText, url: productUrl, files: [file] }).catch(() => undefined)
        } else {
          navigator.share({ title: product.title, text: shareText, url: productUrl }).catch(() => undefined)
        }
      } else {
        handleCopyLink()
      }
      return
    }

    const url = shareLinks[platform as keyof typeof shareLinks]
    if (url) {
      window.open(url, '_blank', 'width=600,height=400')
    }
  }

  const shareButtons = [
    { id: 'whatsapp', label: 'WhatsApp', brand: 'whatsapp', className: 'border-emerald-500/30 bg-emerald-500/12 text-emerald-500 hover:bg-emerald-500 hover:text-white' },
    { id: 'facebook', label: 'Facebook', brand: 'facebook', className: 'border-blue-600/30 bg-blue-600/12 text-blue-600 hover:bg-blue-600 hover:text-white' },
    { id: 'x', label: 'X', brand: 'x', className: 'border-foreground/30 bg-foreground/10 text-foreground hover:bg-foreground hover:text-background' },
    { id: 'instagram', label: 'Instagram', brand: 'instagram', className: 'border-pink-500/30 bg-pink-500/12 text-pink-500 hover:bg-pink-500 hover:text-white' },
    { id: 'tiktok', label: 'TikTok', brand: 'tiktok', className: 'border-cyan-400/30 bg-cyan-400/12 text-cyan-400 hover:bg-cyan-400 hover:text-black' },
    { id: 'native', label: 'Mehr teilen', icon: Send, className: 'border-accent/40 bg-accent/12 text-accent hover:bg-accent hover:text-accent-foreground' },
    { id: 'copy', label: copied ? 'Kopiert' : 'Link', icon: copied ? Copy : LinkIcon, className: 'border-muted-foreground/30 bg-muted-foreground/10 text-muted-foreground hover:bg-muted-foreground hover:text-background' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl border border-border bg-secondary/50 p-4"
    >
      <h3 className="mb-3 text-sm font-black uppercase tracking-wide text-muted-foreground">Produkt teilen</h3>

      <div className="flex flex-wrap gap-2">
        {shareButtons.map((button) => {
          const Icon = button.icon
          return (
            <motion.button
              key={button.id}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleShare(button.id)}
              className={`inline-flex h-11 w-11 items-center justify-center rounded-full border transition-all ${button.className}`}
              title={button.label}
              aria-label={button.label}
            >
              {Icon ? <Icon size={18} /> : <BrandIcon name={button.brand || ''} />}
            </motion.button>
          )
        })}
      </div>

      {copied && (
        <p className="mt-3 text-sm font-bold text-emerald-500">Link kopiert.</p>
      )}
    </motion.div>
  )
}

function BrandIcon({ name }: { name: string }) {
  if (name === 'whatsapp') {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M5.4 18.8 6.5 15A7.4 7.4 0 1 1 9 17.5z" />
        <path d="M9.2 8.8c.2-.4.4-.4.7-.4h.5c.2 0 .4.1.5.4l.7 1.6c.1.2.1.4-.1.6l-.4.5c.6 1 1.4 1.8 2.5 2.3l.5-.6c.2-.2.4-.3.7-.2l1.5.7c.3.1.4.3.4.6v.5c0 .4-.2.6-.5.8-.5.3-1.2.4-2 .2-2.6-.6-5.2-3.1-5.8-5.7-.2-.8-.1-1.5.3-2z" />
      </svg>
    )
  }
  if (name === 'facebook') {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
        <path d="M14 8.5h2.3V5.1c-.4-.1-1.8-.2-3.3-.2-3.3 0-5.5 2-5.5 5.7v3.2H4v3.8h3.5V24h4.2v-6.4h3.5l.6-3.8h-4.1V11c0-1.1.3-2.5 2.3-2.5z" />
      </svg>
    )
  }
  if (name === 'x') {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
        <path d="m4 4 16 16M20 4 4 20" />
      </svg>
    )
  }
  if (name === 'instagram') {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <rect x="4" y="4" width="16" height="16" rx="5" />
        <circle cx="12" cy="12" r="3.5" />
        <circle cx="17" cy="7" r="1" fill="currentColor" stroke="none" />
      </svg>
    )
  }
  if (name === 'tiktok') {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M14 4v10.2a4.2 4.2 0 1 1-3.2-4.1" />
        <path d="M14 4c.6 3 2.4 4.8 5.2 5.2" />
      </svg>
    )
  }
  return null
}

async function getShareImageFile(imageUrl: string, title: string) {
  if (!imageUrl || typeof window === 'undefined' || typeof File === 'undefined') return null
  try {
    const absoluteUrl = /^https?:\/\//i.test(imageUrl) ? imageUrl : `${window.location.origin}/${imageUrl.replace(/^\//, '')}`
    const response = await fetch(absoluteUrl)
    if (!response.ok) return null
    const blob = await response.blob()
    if (!blob.type.startsWith('image/')) return null
    return new File([blob], `${slugify(title)}.${blob.type.includes('png') ? 'png' : 'jpg'}`, { type: blob.type })
  } catch {
    return null
  }
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'produkt'
}
