import fs from 'fs'
import path from 'path'

const STORE_FILE = path.join(process.cwd(), '.data', 'shop-settings.json')

export type PaymentMethodId = 'sumup' | 'stripe' | 'paypal' | 'twint' | 'bank_transfer' | 'vorauszahlung' | 'auf_rechnung'

export interface PaymentMethodSettings {
  id: PaymentMethodId
  label: string
  enabled: boolean
  sortOrder: number
  instructions: string
}

export interface ShopSettings {
  general: {
    siteName: string
    companyName: string
    email: string
    phone: string
    address: string
    currency: 'CHF' | 'EUR'
    defaultLanguage: string
    timezone: string
    maintenanceMode: boolean
  }
  seo: {
    metaTitle: string
    metaDescription: string
    canonicalUrl: string
    robots: string
    openGraphImage: string
  }
  tracking: {
    googleAnalyticsId: string
    metaPixelId: string
    enableGoogleAnalytics: boolean
    enableMetaPixel: boolean
    anonymizeIp: boolean
  }
  ai: {
    enabled: boolean
    title: string
    provider: 'openai_compatible'
    endpoint: string
    model: string
    apiKey: string
    temperature: number
    welcomeMessage: string
    systemPrompt: string
    suggestions: string[]
  }
  email: {
    smtpEnabled: boolean
    smtpHost: string
    smtpPort: number
    smtpSecure: boolean
    smtpUser: string
    smtpPassword: string
    fromEmail: string
    fromName: string
    replyTo: string
    adminRecipient: string
  }
  shop: {
    taxRate: number
    freeShippingFrom: number
    shippingCost: number
    lowStockThreshold: number
    minimumOrderAmount: number
    returnPeriodDays: number
    orderNumberPrefix: string
    invoiceNumberPrefix: string
  }
  payments: {
    mode: 'test' | 'live'
    methods: PaymentMethodSettings[]
    sumup: {
      merchantCode: string
      apiKey: string
      clientId: string
      clientSecret: string
      checkoutSuccessUrl: string
      webhookSecret: string
      instructions: string
    }
    stripe: {
      publishableKey: string
      secretKey: string
      webhookSecret: string
      successUrl: string
      cancelUrl: string
      instructions: string
    }
    paypal: {
      clientId: string
      clientSecret: string
      merchantEmail: string
      webhookId: string
      instructions: string
    }
    twint: {
      companyName: string
      phone: string
      merchantUuid: string
      apiKey: string
      storeId: string
      webhookSecret: string
      qrImageUrl: string
      instructions: string
    }
    bank: {
      bankName: string
      accountHolder: string
      iban: string
      bic: string
      instructions: string
    }
    invoice: {
      minAmount: number
      maxAmount: number
      dueDays: number
      registeredCustomersOnly: boolean
      manualApproval: boolean
      instructions: string
    }
  }
  footer: {
    brandTitle: string
    brandDescription: string
    logoText: string
    showLiveSales: boolean
    liveSalesTitle: string
    contactEmail: string
    contactPhone: string
    contactLocation: string
    copyrightText: string
    columns: Array<{
      title: string
      links: Array<{ label: string; href: string }>
    }>
    socialLinks: Array<{ label: string; href: string }>
  }
}

export const defaultShopSettings: ShopSettings = {
  general: {
    siteName: 'MK-eMotors',
    companyName: 'MK-eMotors GmbH',
    email: 'info@mk-emotorsdornach.ch',
    phone: '+41 61 701 50 50',
    address: 'Dornach, Schweiz',
    currency: 'CHF',
    defaultLanguage: 'de',
    timezone: 'Europe/Zurich',
    maintenanceMode: false,
  },
  seo: {
    metaTitle: 'MK-eMotors | Premium E-Mobility Schweiz',
    metaDescription: 'Elektrische Scooter, E-Bikes, E-Motorräder und urbane Elektromobilität in der Schweiz kaufen.',
    canonicalUrl: 'https://mk-emotorsdornach.ch',
    robots: 'index,follow',
    openGraphImage: '/images/hero-showroom.png',
  },
  tracking: {
    googleAnalyticsId: '',
    metaPixelId: '',
    enableGoogleAnalytics: false,
    enableMetaPixel: false,
    anonymizeIp: true,
  },
  ai: {
    enabled: true,
    title: 'MK-eMotors AI',
    provider: 'openai_compatible',
    endpoint: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-4o-mini',
    apiKey: '',
    temperature: 0.35,
    welcomeMessage: 'Willkommen bei MK-eMotors AI. Ich helfe Ihnen, das passende E-Motorrad, den richtigen E-Scooter oder Zubehör für Ihre Mobilität zu finden.',
    systemPrompt: 'Du bist der deutschsprachige Shop-Assistent von MK-eMotors Dornach in der Schweiz. Antworte kurz, professionell und verkaufsorientiert. Empfiehl nur Produkte aus dem bereitgestellten Produktkontext. Nenne Preise in CHF, verweise auf Probefahrt, Finanzierung und Warenkorb, wenn passend. Erfinde keine technischen Daten.',
    suggestions: [
      'Welcher E-Scooter passt zu mir?',
      'Zeige Angebote mit Finanzierung',
      'Ich brauche Zubehör',
    ],
  },
  email: {
    smtpEnabled: false,
    smtpHost: '',
    smtpPort: 587,
    smtpSecure: false,
    smtpUser: '',
    smtpPassword: '',
    fromEmail: 'info@mk-emotorsdornach.ch',
    fromName: 'MK-eMotors Dornach',
    replyTo: 'info@mk-emotorsdornach.ch',
    adminRecipient: 'info@mk-emotorsdornach.ch',
  },
  shop: {
    taxRate: 8.1,
    freeShippingFrom: 1000,
    shippingCost: 25,
    lowStockThreshold: 3,
    minimumOrderAmount: 0,
    returnPeriodDays: 14,
    orderNumberPrefix: 'ORD',
    invoiceNumberPrefix: 'INV',
  },
  payments: {
    mode: 'test',
    methods: [
      { id: 'sumup', label: 'SumUp', enabled: false, sortOrder: 1, instructions: 'Sichere Zahlung über SumUp. Nach Aktivierung werden Bestellungen für SumUp vorbereitet.' },
      { id: 'stripe', label: 'Kreditkarte (Stripe)', enabled: true, sortOrder: 2, instructions: 'Sichere Kartenzahlung über Stripe. Kartendaten werden nicht bei uns gespeichert.' },
      { id: 'paypal', label: 'PayPal', enabled: true, sortOrder: 3, instructions: 'Sie werden nach der Bestellung zu PayPal weitergeleitet.' },
      { id: 'twint', label: 'TWINT', enabled: true, sortOrder: 4, instructions: 'Bitte überweisen Sie den Betrag per TWINT und laden Sie den Zahlungsbeleg hoch.' },
      { id: 'bank_transfer', label: 'Banküberweisung / IBAN', enabled: true, sortOrder: 5, instructions: 'Bitte überweisen Sie den Betrag mit der angegebenen Referenz.' },
      { id: 'vorauszahlung', label: 'Vorauszahlung', enabled: true, sortOrder: 6, instructions: 'Die Bestellung wird nach Zahlungseingang verarbeitet.' },
      { id: 'auf_rechnung', label: 'Kauf auf Rechnung', enabled: true, sortOrder: 7, instructions: 'Die Rechnung ist innerhalb der angegebenen Zahlungsfrist zu begleichen.' },
    ],
    sumup: {
      merchantCode: '',
      apiKey: '',
      clientId: '',
      clientSecret: '',
      checkoutSuccessUrl: '',
      webhookSecret: '',
      instructions: 'Sie bezahlen sicher über SumUp. Die Bestellung bleibt bis zur Zahlungsbestätigung offen.',
    },
    stripe: {
      publishableKey: '',
      secretKey: '',
      webhookSecret: '',
      successUrl: '',
      cancelUrl: '',
      instructions: 'Sichere Kartenzahlung über Stripe.',
    },
    paypal: {
      clientId: '',
      clientSecret: '',
      merchantEmail: '',
      webhookId: '',
      instructions: 'Sichere Zahlung über PayPal.',
    },
    twint: {
      companyName: 'MK-eMotors GmbH',
      phone: '+41 61 701 50 50',
      merchantUuid: '',
      apiKey: '',
      storeId: '',
      webhookSecret: '',
      qrImageUrl: '',
      instructions: 'Öffnen Sie TWINT, senden Sie den Gesamtbetrag an die angegebene Telefonnummer und verwenden Sie die Bestellnummer als Referenz.',
    },
    bank: {
      bankName: 'Schweizer Bank',
      accountHolder: 'MK-eMotors GmbH',
      iban: 'CH00 0000 0000 0000 0000 0',
      bic: '',
      instructions: 'Bitte geben Sie die Bestellnummer als Zahlungsreferenz an. Die Bestellung wird nach Zahlungseingang freigegeben.',
    },
    invoice: {
      minAmount: 50,
      maxAmount: 10000,
      dueDays: 14,
      registeredCustomersOnly: false,
      manualApproval: true,
      instructions: 'Kauf auf Rechnung kann manuell geprüft werden. Die Ware wird nach Freigabe versendet.',
    },
  },
  footer: {
    brandTitle: 'MK-eMotors Dornach',
    brandDescription: 'Premium Swiss-engineered electric mobility solutions.',
    logoText: 'MK',
    showLiveSales: true,
    liveSalesTitle: 'Gerade verkauft',
    contactEmail: 'info@mk-emotors.ch',
    contactPhone: '+41 (0) 800 000 0000',
    contactLocation: 'Zurich, Switzerland',
    copyrightText: 'MK-eMotors Dornach. All rights reserved.',
    columns: [
      {
        title: 'Shop',
        links: [
          { label: 'Alle Produkte', href: '/produkte' },
          { label: 'Ohne Führerschein', href: '/produkte?license=ohne' },
          { label: 'Mit Führerschein', href: '/produkte?license=mit' },
          { label: 'eScooter', href: '/produkte?category=escooter' },
        ],
      },
      {
        title: 'Unternehmen',
        links: [
          { label: 'Über uns', href: '/ueber-uns' },
          { label: 'FAQ', href: '/faq' },
          { label: 'Kontakt', href: '/contact' },
          { label: 'Finanzierung', href: '/finanzierungsrechner' },
        ],
      },
      {
        title: 'Rechtliches',
        links: [
          { label: 'AGB', href: '/agb' },
          { label: 'Datenschutz', href: '/datenschutz' },
          { label: 'Impressum', href: '/impressum' },
          { label: 'Ratenzahlung', href: '/ratenzahlung' },
        ],
      },
    ],
    socialLinks: [
      { label: 'Instagram', href: '#' },
      { label: 'LinkedIn', href: '#' },
      { label: 'Twitter', href: '#' },
    ],
  },
}

function ensureStore() {
  const dir = path.dirname(STORE_FILE)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  if (!fs.existsSync(STORE_FILE)) fs.writeFileSync(STORE_FILE, JSON.stringify(defaultShopSettings, null, 2))
}

export function getShopSettings() {
  ensureStore()
  try {
    const stored = JSON.parse(fs.readFileSync(STORE_FILE, 'utf-8')) as Partial<ShopSettings>
    return {
      ...defaultShopSettings,
      ...stored,
      general: { ...defaultShopSettings.general, ...(stored.general || {}) },
      seo: { ...defaultShopSettings.seo, ...(stored.seo || {}) },
      tracking: { ...defaultShopSettings.tracking, ...(stored.tracking || {}) },
      ai: {
        ...defaultShopSettings.ai,
        ...(stored.ai || {}),
        suggestions: stored.ai?.suggestions?.length ? stored.ai.suggestions : defaultShopSettings.ai.suggestions,
      },
      email: { ...defaultShopSettings.email, ...(stored.email || {}) },
      shop: { ...defaultShopSettings.shop, ...(stored.shop || {}) },
      payments: {
        ...defaultShopSettings.payments,
        ...(stored.payments || {}),
        methods: mergePaymentMethods(stored.payments?.methods),
        sumup: { ...defaultShopSettings.payments.sumup, ...(stored.payments?.sumup || {}) },
        stripe: { ...defaultShopSettings.payments.stripe, ...(stored.payments?.stripe || {}) },
        paypal: { ...defaultShopSettings.payments.paypal, ...(stored.payments?.paypal || {}) },
        twint: { ...defaultShopSettings.payments.twint, ...(stored.payments?.twint || {}) },
        bank: { ...defaultShopSettings.payments.bank, ...(stored.payments?.bank || {}) },
        invoice: { ...defaultShopSettings.payments.invoice, ...(stored.payments?.invoice || {}) },
      },
      footer: {
        ...defaultShopSettings.footer,
        ...(stored.footer || {}),
        columns: stored.footer?.columns || defaultShopSettings.footer.columns,
        socialLinks: stored.footer?.socialLinks || defaultShopSettings.footer.socialLinks,
      },
    } as ShopSettings
  } catch {
    return defaultShopSettings
  }
}

function mergePaymentMethods(storedMethods?: PaymentMethodSettings[]) {
  if (!storedMethods?.length) return defaultShopSettings.payments.methods
  const byId = new Map(storedMethods.map((method) => [method.id, method]))
  return defaultShopSettings.payments.methods
    .map((method) => ({ ...method, ...(byId.get(method.id) || {}) }))
    .sort((a, b) => a.sortOrder - b.sortOrder)
}

export function saveShopSettings(settings: ShopSettings) {
  ensureStore()
  fs.writeFileSync(STORE_FILE, JSON.stringify(settings, null, 2))
  return settings
}

export function getEnabledPaymentMethods() {
  return getShopSettings().payments.methods
    .filter((method) => method.enabled)
    .sort((a, b) => a.sortOrder - b.sortOrder)
}
