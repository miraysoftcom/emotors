import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import '@fontsource/bebas-neue'
import './globals.css'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { GlobalAnnouncementPopup } from '@/components/announcements/AnnouncementClientSurfaces'
import { GlobalSpecialDayCampaignPopup } from '@/components/campaigns/SpecialDayCampaignSurfaces'
import { TrackingScripts } from '@/components/analytics/TrackingScripts'
import { ShopAiWidget } from '@/components/ai/ShopAiWidget'

export const metadata: Metadata = {
  title: {
    template: '%s | MK-eMotors Dornach',
    default: 'MK-eMotors Dornach - Premium E-Mobility Schweiz',
  },
  description: 'Premium elektrische Scooter, E-Motorräder, E-Bikes und urbane E-Mobility Lösungen aus Dornach für die Schweiz.',
  generator: 'v0.app',
  keywords: ['e-scooter', 'e-motorrad', 'e-bike', 'elektromobilitaet', 'dornach', 'schweiz', 'mk-emotors'],
  openGraph: {
    type: 'website',
    locale: 'de_CH',
    url: 'https://mk-emotors.ch',
    siteName: 'MK-eMotors Dornach',
    title: 'MK-eMotors Dornach - Premium E-Mobility Schweiz',
    description: 'Elektrische Mobilitaet aus Dornach: E-Scooter, E-Motorräder, E-Bikes, Service und Finanzierung.',
    images: [
      {
        url: 'https://mk-emotors.ch/og-image.png',
        width: 1200,
        height: 630,
        alt: 'MK-eMotors Dornach',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MK-eMotors Dornach',
    description: 'Premium E-Mobility Produkte und Service aus Dornach.',
  },
  icons: {
    icon: [
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'dark light',
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#07110d' },
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
  ],
  userScalable: true,
}

const themeScript = `
try {
  const cookieMatch = document.cookie.match(/(?:^|;\\s*)theme=(dunkel|hell)(?:;|$)/);
  const stored = localStorage.getItem('theme') || (cookieMatch && cookieMatch[1]) || 'dunkel';
  const resolved = stored === 'hell' ? 'hell' : 'dunkel';
  document.documentElement.classList.toggle('dark', resolved !== 'hell');
  document.documentElement.classList.toggle('light', resolved === 'hell');
  document.documentElement.dataset.theme = resolved;
  document.documentElement.style.colorScheme = resolved === 'hell' ? 'light' : 'dark';
} catch (error) {
  document.documentElement.classList.add('dark');
  document.documentElement.dataset.theme = 'dunkel';
  document.documentElement.style.colorScheme = 'dark';
}
`

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark scroll-smooth" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="antialiased bg-background text-foreground">
        <ThemeProvider>
          {children}
          <GlobalAnnouncementPopup />
          <GlobalSpecialDayCampaignPopup />
          <ShopAiWidget />
          <TrackingScripts />
          {process.env.NODE_ENV === 'production' && <Analytics />}
        </ThemeProvider>
      </body>
    </html>
  )
}
