import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: string = 'CHF'): string {
  return new Intl.NumberFormat('de-CH', {
    style: 'currency',
    currency: currency,
  }).format(amount)
}

export function formatPrice(amount: string, currency: string = 'CHF'): string {
  return formatCurrency(parseFloat(amount), currency)
}

export function truncateText(text: string, length: number): string {
  if (text.length <= length) return text
  return text.slice(0, length) + '...'
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export function getImageUrl(src: string, size?: string): string {
  if (!src) return ''
  if (src.startsWith('http')) return src
  if (size) return `${src}?w=${size}`
  return src
}

export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
