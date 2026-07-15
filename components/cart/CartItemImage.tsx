'use client'

interface CartItemImageProps {
  image?: string | null
  title: string
  size?: 'sm' | 'md'
}

function normalizeImagePath(image?: string | null) {
  if (!image) return ''
  const trimmed = image.trim()
  if (!trimmed) return ''
  if (trimmed.startsWith('/') || trimmed.startsWith('http')) return trimmed
  if (/\.(png|jpe?g|webp|gif|svg)$/i.test(trimmed)) return `/${trimmed}`
  return ''
}

export function CartItemImage({ image, title, size = 'md' }: CartItemImageProps) {
  const src = normalizeImagePath(image)
  const dimensions = size === 'sm' ? 'h-12 w-12' : 'h-24 w-24'
  const fallbackText = image && !src ? image : title.slice(0, 2).toUpperCase()

  return (
    <div className={`${dimensions} flex-shrink-0 overflow-hidden rounded-lg bg-secondary`}>
      {src ? (
        <img
          src={src}
          alt={title}
          className="h-full w-full object-cover"
          onError={(event) => {
            event.currentTarget.style.display = 'none'
          }}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-sm font-bold text-muted-foreground">
          {fallbackText}
        </div>
      )}
    </div>
  )
}
