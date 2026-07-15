export type ProductImageBackground =
  | 'transparent'
  | 'white'
  | 'soft'
  | 'dark'
  | 'green'
  | 'custom'

export const productImageBackgroundOptions: Array<{
  value: ProductImageBackground
  label: string
  swatch: string
}> = [
  { value: 'transparent', label: 'Transparent / Seitenhintergrund', swatch: 'transparent' },
  { value: 'white', label: 'Weiss', swatch: '#ffffff' },
  { value: 'soft', label: 'Premium Hellgrau', swatch: '#f4f7f5' },
  { value: 'dark', label: 'Dunkel', swatch: '#050807' },
  { value: 'green', label: 'MK Green Soft', swatch: '#0f2b1c' },
  { value: 'custom', label: 'Eigene Farbe', swatch: '#21d878' },
]

export function getProductImageBackgroundStyle(
  value?: string | null,
  customColor?: string | null
): { background?: string; backgroundColor?: string } {
  const background = String(value || 'transparent') as ProductImageBackground

  if (background === 'white') return { backgroundColor: '#ffffff' }
  if (background === 'soft') return { background: 'linear-gradient(135deg, #ffffff 0%, #edf4ef 100%)' }
  if (background === 'dark') return { background: 'linear-gradient(135deg, #020403 0%, #102015 100%)' }
  if (background === 'green') return { background: 'radial-gradient(circle at 50% 35%, rgba(33,216,120,0.22), transparent 42%), #07110c' }
  if (background === 'custom') return { backgroundColor: customColor || '#21d878' }
  return {}
}

export function getProductImageBackground(
  metadata?: Record<string, unknown> | null
) {
  const imageBackground = typeof metadata?.image_background === 'string'
    ? metadata.image_background
    : 'transparent'
  const imageBackgroundColor = typeof metadata?.image_background_color === 'string'
    ? metadata.image_background_color
    : '#21d878'

  return {
    imageBackground,
    imageBackgroundColor,
    style: getProductImageBackgroundStyle(imageBackground, imageBackgroundColor),
  }
}
