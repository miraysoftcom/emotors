'use client'

import Script from 'next/script'
import { useEffect, useState } from 'react'

type TrackingSettings = {
  googleAnalyticsId: string
  metaPixelId: string
  enableGoogleAnalytics: boolean
  enableMetaPixel: boolean
  anonymizeIp: boolean
}

export function TrackingScripts() {
  const [settings, setSettings] = useState<TrackingSettings | null>(null)

  useEffect(() => {
    let active = true
    fetch('/api/shop/settings', { credentials: 'include' })
      .then((response) => response.ok ? response.json() : null)
      .then((data) => {
        if (!active) return
        setSettings(data?.tracking || null)
      })
      .catch(() => {
        if (active) setSettings(null)
      })
    return () => {
      active = false
    }
  }, [])

  const envGaId = process.env.NEXT_PUBLIC_GA_ID || process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID || ''
  const envMetaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID || ''
  const gaId = settings?.enableGoogleAnalytics ? (settings.googleAnalyticsId || envGaId) : ''
  const metaPixelId = settings?.enableMetaPixel ? (settings.metaPixelId || envMetaPixelId) : ''
  const anonymizeIp = settings?.anonymizeIp !== false

  return (
    <>
      {gaId && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
          <Script id="ga4-tracking" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaId}', { anonymize_ip: ${anonymizeIp ? 'true' : 'false'} });
            `}
          </Script>
        </>
      )}
      {metaPixelId && (
        <>
          <Script id="meta-pixel" strategy="afterInteractive">
            {`
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${metaPixelId}');
              fbq('track', 'PageView');
            `}
          </Script>
          <noscript>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              height="1"
              width="1"
              style={{ display: 'none' }}
              src={`https://www.facebook.com/tr?id=${metaPixelId}&ev=PageView&noscript=1`}
              alt=""
            />
          </noscript>
        </>
      )}
    </>
  )
}
