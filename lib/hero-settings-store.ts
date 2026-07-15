import fs from 'fs'
import path from 'path'

const STORE_FILE = path.join(process.cwd(), '.data', 'hero-settings.json')

export type HeroTextAlign = 'left' | 'center' | 'right'
export type HeroPosition = 'center' | 'top' | 'bottom' | 'left' | 'right'
export type HeroSize = 'cover' | 'contain' | 'auto'
export type HeroStatus = 'draft' | 'published'

export interface HeroButtonSettings {
  id: string
  active: boolean
  text: string
  url: string
  target: '_self' | '_blank'
  sortOrder: number
  variant: 'primary' | 'outline'
  backgroundColor: string
  textColor: string
  borderColor: string
  hoverBackgroundColor: string
  hoverTextColor: string
  borderWidth: number
  borderRadius: number
  height: number
  paddingX: number
  fontSize: number
  fontWeight: number
}

export interface HeroSettings {
  enabled: boolean
  status: HeroStatus
  desktopImage: string
  tabletImage: string
  mobileImage: string
  imageAlt: string
  imagePosition: HeroPosition
  customImagePosition: string
  imageSize: HeroSize
  imageZoom: number
  overlayEnabled: boolean
  overlayColor: string
  overlayOpacity: number
  overlayOpacityMobile: number
  gradientEnabled: boolean
  gradientFrom: string
  gradientTo: string
  gradientDirection: string
  eyebrowEnabled: boolean
  eyebrow: string
  eyebrowColor: string
  eyebrowFontSize: number
  eyebrowFontWeight: number
  eyebrowLetterSpacing: number
  eyebrowUppercase: boolean
  title: string
  titleColor: string
  titleFontFamily: string
  titleDesktopSize: number
  titleTabletSize: number
  titleMobileSize: number
  titleFontWeight: number
  titleLineHeight: number
  titleMaxWidth: number
  titleShadow: boolean
  descriptionEnabled: boolean
  description: string
  descriptionColor: string
  descriptionFontSize: number
  descriptionLineHeight: number
  descriptionMaxWidth: number
  textAlign: HeroTextAlign
  heightDesktop: number
  heightTablet: number
  heightMobile: number
  minHeight: number
  fullscreen: boolean
  contentMaxWidth: number
  contentOffsetX: number
  contentOffsetY: number
  paddingTop: number
  paddingBottom: number
  buttonGap: number
  mobileButtonLayout: 'stack' | 'wrap' | 'scroll'
  buttons: HeroButtonSettings[]
  updatedAt: string
  publishedAt: string
}

export const defaultHeroSettings: HeroSettings = {
  enabled: true,
  status: 'published',
  desktopImage: '/hero-background.png',
  tabletImage: '/hero-background.png',
  mobileImage: '/hero-background.png',
  imageAlt: 'MK-eMotors Dornach Elektromobilität vor Schweizer Stadtpanorama',
  imagePosition: 'center',
  customImagePosition: '',
  imageSize: 'cover',
  imageZoom: 1,
  overlayEnabled: true,
  overlayColor: '#000000',
  overlayOpacity: 0.66,
  overlayOpacityMobile: 0.72,
  gradientEnabled: true,
  gradientFrom: 'rgba(0,0,0,0.72)',
  gradientTo: 'rgba(0,0,0,0.38)',
  gradientDirection: 'to bottom',
  eyebrowEnabled: true,
  eyebrow: 'WILLKOMMEN',
  eyebrowColor: '#22c55e',
  eyebrowFontSize: 14,
  eyebrowFontWeight: 800,
  eyebrowLetterSpacing: 4,
  eyebrowUppercase: true,
  title: 'MK-eMotors\nDornach',
  titleColor: '#ffffff',
  titleFontFamily: 'Inter, Helvetica, Arial, sans-serif',
  titleDesktopSize: 88,
  titleTabletSize: 68,
  titleMobileSize: 44,
  titleFontWeight: 950,
  titleLineHeight: 0.98,
  titleMaxWidth: 780,
  titleShadow: true,
  descriptionEnabled: true,
  description: 'Entdecken Sie die Zukunft der Fortbewegung mit unserer exklusiven Kollektion hochwertiger Elektromobilität.',
  descriptionColor: 'rgba(255,255,255,0.78)',
  descriptionFontSize: 20,
  descriptionLineHeight: 1.45,
  descriptionMaxWidth: 720,
  textAlign: 'center',
  heightDesktop: 100,
  heightTablet: 88,
  heightMobile: 78,
  minHeight: 640,
  fullscreen: true,
  contentMaxWidth: 980,
  contentOffsetX: 0,
  contentOffsetY: 24,
  paddingTop: 96,
  paddingBottom: 72,
  buttonGap: 18,
  mobileButtonLayout: 'wrap',
  buttons: [
    {
      id: 'shop',
      active: true,
      text: 'Jetzt Kaufen',
      url: '/produkte',
      target: '_self',
      sortOrder: 1,
      variant: 'primary',
      backgroundColor: '#21d878',
      textColor: '#06120b',
      borderColor: '#21d878',
      hoverBackgroundColor: '#28e987',
      hoverTextColor: '#031008',
      borderWidth: 2,
      borderRadius: 999,
      height: 56,
      paddingX: 38,
      fontSize: 16,
      fontWeight: 800,
    },
    {
      id: 'financing',
      active: true,
      text: 'Ratenzahlung',
      url: '/ratenzahlung',
      target: '_self',
      sortOrder: 2,
      variant: 'outline',
      backgroundColor: 'transparent',
      textColor: '#ffffff',
      borderColor: '#ffffff',
      hoverBackgroundColor: 'rgba(255,255,255,0.12)',
      hoverTextColor: '#ffffff',
      borderWidth: 2,
      borderRadius: 999,
      height: 56,
      paddingX: 38,
      fontSize: 16,
      fontWeight: 800,
    },
    {
      id: 'test-drive',
      active: true,
      text: 'Probefahrt',
      url: '/contact',
      target: '_self',
      sortOrder: 3,
      variant: 'outline',
      backgroundColor: 'transparent',
      textColor: '#ffffff',
      borderColor: '#ffffff',
      hoverBackgroundColor: 'rgba(255,255,255,0.12)',
      hoverTextColor: '#ffffff',
      borderWidth: 2,
      borderRadius: 999,
      height: 56,
      paddingX: 38,
      fontSize: 16,
      fontWeight: 800,
    },
  ],
  updatedAt: new Date().toISOString(),
  publishedAt: new Date().toISOString(),
}

function ensureStore() {
  const dir = path.dirname(STORE_FILE)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  if (!fs.existsSync(STORE_FILE)) fs.writeFileSync(STORE_FILE, JSON.stringify(defaultHeroSettings, null, 2))
}

export function getHeroSettings() {
  ensureStore()
  try {
    const stored = JSON.parse(fs.readFileSync(STORE_FILE, 'utf-8'))
    return mergeHeroSettings(stored)
  } catch {
    return defaultHeroSettings
  }
}

export function saveHeroSettings(settings: Partial<HeroSettings>, publish = false) {
  const current = getHeroSettings()
  const next = mergeHeroSettings({
    ...current,
    ...settings,
    buttons: Array.isArray(settings.buttons) ? settings.buttons : current.buttons,
    status: publish ? 'published' : settings.status || current.status,
    updatedAt: new Date().toISOString(),
    publishedAt: publish ? new Date().toISOString() : current.publishedAt,
  })
  ensureStore()
  fs.writeFileSync(STORE_FILE, JSON.stringify(next, null, 2))
  return next
}

function mergeHeroSettings(settings: Partial<HeroSettings>): HeroSettings {
  return {
    ...defaultHeroSettings,
    ...settings,
    buttons: mergeButtons(settings.buttons),
  }
}

function mergeButtons(buttons?: Partial<HeroButtonSettings>[]) {
  const source = Array.isArray(buttons) && buttons.length > 0 ? buttons : defaultHeroSettings.buttons
  return source.map((button, index) => ({
    ...defaultHeroSettings.buttons[index % defaultHeroSettings.buttons.length],
    ...button,
    id: String(button.id || defaultHeroSettings.buttons[index % defaultHeroSettings.buttons.length].id || `button-${index + 1}`),
    sortOrder: Number(button.sortOrder || index + 1),
  }))
}
