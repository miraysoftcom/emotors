import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'MK-eMotors Dornach',
    short_name: 'MK-eMotors',
    description: 'Premium Elektromobilitaet, Service und Finanzierung aus Dornach.',
    start_url: '/',
    display: 'standalone',
    background_color: '#07110d',
    theme_color: '#07110d',
    lang: 'de-CH',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
      {
        src: '/apple-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  }
}
