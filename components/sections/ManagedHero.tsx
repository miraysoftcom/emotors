'use client'

import { type MouseEvent, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { TestDriveModal } from '@/components/modals/TestDriveModal'
import { useTheme } from '@/components/providers/ThemeProvider'
import type { HeroSettings } from '@/lib/hero-settings-store'

export function ManagedHero({ settings }: { settings: HeroSettings }) {
  const [testDriveOpen, setTestDriveOpen] = useState(false)
  const { resolvedTheme } = useTheme()
  if (!settings.enabled) return null

  const isLightTheme = resolvedTheme === 'hell'
  const imagePosition = settings.customImagePosition || settings.imagePosition
  const desktopImage = isLightTheme ? settings.lightDesktopImage || settings.desktopImage : settings.desktopImage
  const tabletImage = isLightTheme ? settings.lightTabletImage || settings.tabletImage || desktopImage : settings.tabletImage || desktopImage
  const mobileImage = isLightTheme ? settings.lightMobileImage || settings.mobileImage || desktopImage : settings.mobileImage || desktopImage
  const overlayColor = isLightTheme ? settings.lightOverlayColor || settings.overlayColor : settings.overlayColor
  const overlayOpacity = isLightTheme ? settings.lightOverlayOpacity ?? settings.overlayOpacity : settings.overlayOpacity
  const overlayOpacityMobile = isLightTheme ? settings.lightOverlayOpacityMobile ?? settings.overlayOpacityMobile : settings.overlayOpacityMobile
  const gradientFrom = isLightTheme ? settings.lightGradientFrom || settings.gradientFrom : settings.gradientFrom
  const gradientTo = isLightTheme ? settings.lightGradientTo || settings.gradientTo : settings.gradientTo
  const eyebrowColor = isLightTheme ? settings.lightEyebrowColor || settings.eyebrowColor : settings.eyebrowColor
  const titleColor = isLightTheme ? settings.lightTitleColor || settings.titleColor : settings.titleColor
  const descriptionColor = isLightTheme ? settings.lightDescriptionColor || settings.descriptionColor : settings.descriptionColor
  const activeButtons = [...settings.buttons]
    .filter((button) => button.active)
    .sort((a, b) => a.sortOrder - b.sortOrder)

  return (
    <section
      className="hero-managed relative isolate flex w-full items-center justify-center overflow-hidden bg-black"
      style={{
        minHeight: `${settings.minHeight}px`,
        height: settings.fullscreen ? `${settings.heightDesktop}vh` : undefined,
        paddingTop: `${settings.paddingTop}px`,
        paddingBottom: `${settings.paddingBottom}px`,
        ['--hero-tablet-height' as string]: `${settings.heightTablet}vh`,
        ['--hero-mobile-height' as string]: `${settings.heightMobile}vh`,
        ['--hero-title-tablet' as string]: `${settings.titleTabletSize}px`,
        ['--hero-title-mobile' as string]: `${settings.titleMobileSize}px`,
        ['--hero-overlay-mobile' as string]: String(overlayOpacityMobile),
      }}
      aria-label="Startseiten Hero"
    >
      <picture className="absolute inset-0 -z-30">
        <source media="(max-width: 640px)" srcSet={mobileImage} />
        <source media="(max-width: 1024px)" srcSet={tabletImage} />
        <img
          src={desktopImage}
          alt={settings.imageAlt}
          className="h-full w-full"
          style={{
            objectFit: settings.imageSize,
            objectPosition: imagePosition,
            transform: `scale(${settings.imageZoom})`,
          }}
          fetchPriority="high"
        />
      </picture>

      {settings.overlayEnabled && (
        <div
          className="hero-overlay absolute inset-0 -z-20"
          style={{ backgroundColor: overlayColor, opacity: overlayOpacity }}
        />
      )}
      {settings.gradientEnabled && (
        <div
          className="absolute inset-0 -z-10"
          style={{ backgroundImage: `linear-gradient(${settings.gradientDirection}, ${gradientFrom}, ${gradientTo})` }}
        />
      )}

      <div
        className="relative z-10 mx-auto px-5 text-center"
        style={{
          maxWidth: `${settings.contentMaxWidth}px`,
          transform: `translate(${settings.contentOffsetX}px, ${settings.contentOffsetY}px)`,
          textAlign: settings.textAlign,
        }}
      >
        {settings.eyebrowEnabled && (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="mb-8"
            style={{
              color: eyebrowColor,
              fontSize: `${settings.eyebrowFontSize}px`,
              fontWeight: settings.eyebrowFontWeight,
              letterSpacing: `${settings.eyebrowLetterSpacing}px`,
              textTransform: settings.eyebrowUppercase ? 'uppercase' : 'none',
            }}
          >
            {settings.eyebrow}
          </motion.div>
        )}

        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.08 }}
          className="hero-title mx-auto whitespace-pre-line"
          style={{
            color: titleColor,
            fontFamily: settings.titleFontFamily,
            fontSize: `${settings.titleDesktopSize}px`,
            fontWeight: settings.titleFontWeight,
            lineHeight: settings.titleLineHeight,
            maxWidth: `${settings.titleMaxWidth}px`,
            textShadow: settings.titleShadow ? '0 1.25rem 3rem rgba(0,0,0,.42)' : 'none',
          }}
        >
          {settings.title}
        </motion.h1>

        {settings.descriptionEnabled && (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.18 }}
            className="mx-auto mt-8"
            style={{
              color: descriptionColor,
              fontSize: `${settings.descriptionFontSize}px`,
              lineHeight: settings.descriptionLineHeight,
              maxWidth: `${settings.descriptionMaxWidth}px`,
            }}
            dangerouslySetInnerHTML={{ __html: settings.description }}
          />
        )}

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.28 }}
          className={`mt-12 flex justify-center ${settings.mobileButtonLayout === 'stack' ? 'max-sm:flex-col' : 'flex-wrap'}`}
          style={{ gap: `${settings.buttonGap}px` }}
        >
          {activeButtons.map((button) => {
            const isTestDriveButton = isProbefahrtButton(button.text, button.url)
            const sharedProps = {
              className: 'hero-button inline-flex items-center justify-center transition duration-200 hover:scale-[1.02]',
              style: {
                minHeight: `${button.height}px`,
                paddingInline: `${button.paddingX}px`,
                borderRadius: `${button.borderRadius}px`,
                border: `${button.borderWidth}px solid ${button.borderColor}`,
                backgroundColor: button.backgroundColor,
                color: button.textColor,
                fontSize: `${button.fontSize}px`,
                fontWeight: button.fontWeight,
              },
              onMouseEnter: (event: MouseEvent<HTMLElement>) => {
                event.currentTarget.style.backgroundColor = button.hoverBackgroundColor
                event.currentTarget.style.color = button.hoverTextColor
              },
              onMouseLeave: (event: MouseEvent<HTMLElement>) => {
                event.currentTarget.style.backgroundColor = button.backgroundColor
                event.currentTarget.style.color = button.textColor
              },
            }

            if (isTestDriveButton) {
              return (
                <button
                  key={button.id}
                  type="button"
                  {...sharedProps}
                  onClick={() => setTestDriveOpen(true)}
                >
                  {button.text}
                </button>
              )
            }

            return (
              <Link
                key={button.id}
                href={button.url || '#'}
                target={button.target}
                {...sharedProps}
              >
                {button.text}
              </Link>
            )
          })}
        </motion.div>
      </div>

      <TestDriveModal isOpen={testDriveOpen} onClose={() => setTestDriveOpen(false)} />

      <style jsx>{`
        @media (max-width: 1024px) {
          .hero-managed {
            height: var(--hero-tablet-height) !important;
          }
          .hero-title {
            font-size: var(--hero-title-tablet) !important;
          }
        }
        @media (max-width: 640px) {
          .hero-managed {
            height: var(--hero-mobile-height) !important;
            min-height: 34rem !important;
          }
          .hero-title {
            font-size: var(--hero-title-mobile) !important;
            max-width: 100% !important;
          }
          .hero-overlay {
            opacity: var(--hero-overlay-mobile) !important;
          }
          .hero-button {
            width: min(100%, 19rem);
          }
        }
      `}</style>
    </section>
  )
}

function isProbefahrtButton(text = '', url = '') {
  const normalizedText = text.toLowerCase()
  const normalizedUrl = url.toLowerCase()
  return normalizedText.includes('probefahrt') || normalizedUrl.includes('test-drive') || normalizedUrl.includes('probefahrt')
}
