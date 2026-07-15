import { NextRequest, NextResponse } from 'next/server'
import { getShopSettings } from '@/lib/shop-settings-store'
import { getStoredProducts, type StoredProduct } from '@/lib/products-store'
import { resolveProductPrice } from '@/lib/product-price'
import { formatMoney } from '@/lib/money'

type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
}

type AiProduct = {
  id: string
  title: string
  slug: string
  image: string
  price: number
  formattedPrice: string
  formattedRegularPrice?: string
  discountPercentage?: number
  monthlyPrice: number
  formattedMonthlyPrice: string
  description: string
  stockQuantity: number | null
  reason: string
  badges: string[]
}

type AiIntent = 'recommendation' | 'add_to_cart' | 'checkout' | 'support' | 'test_drive' | 'financing'
type AdvisorAction = { label: string; href: string; tone: 'primary' | 'secondary' | 'outline' }

const MAX_CONTEXT_PRODUCTS = 12

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function productSearchText(product: StoredProduct) {
  return normalize([
    product.title,
    product.short_description,
    product.description,
    product.long_description,
    product.brand,
    product.category_id,
    product.license_required,
    product.condition,
    product.color?.join(' '),
    product.power_watts,
    product.range_km,
    product.max_speed,
  ].filter(Boolean).join(' '))
}

function inferReason(message: string, product: StoredProduct) {
  const text = normalize(message)
  const pricing = resolveProductPrice(product)
  if (pricing.hasDiscount) return 'Aktuelles Angebot mit reduziertem Preis und starkem Preis-Leistungs-Verhältnis.'
  if (/(reichweite|lange|pendeln|arbeitsweg|commute)/.test(text) && product.range_km) {
    return `Passt gut für längere Strecken mit bis zu ${product.range_km} km Reichweite.`
  }
  if (/(schnell|power|leistung|berg|steigung)/.test(text) && product.power_watts) {
    return `Empfohlen wegen der Leistung von ${product.power_watts} W für dynamischere Fahrten.`
  }
  if (/(ohne fuhrerschein|ohne fuehrerschein|legal|strasse|zulassung)/.test(text)) {
    return 'Interessant, wenn Alltagstauglichkeit und klare Schweizer Nutzung wichtig sind.'
  }
  if (/(rate|ratenzahlung|finanz|monatlich|leasing)/.test(text)) {
    return 'Geeignet für Finanzierung, weil der Preis gut in ein Monatsbudget planbar ist.'
  }
  return 'Starke Empfehlung aus dem MK-eMotors Sortiment passend zu Ihrer Anfrage.'
}

function productBadges(product: StoredProduct) {
  const pricing = resolveProductPrice(product)
  return [
    product.bestseller ? 'Bestseller' : '',
    product.featured ? 'Empfohlen' : '',
    pricing.hasDiscount ? `-${pricing.discountPercentage}%` : '',
    product.range_km ? `${product.range_km} km` : '',
    product.max_speed ? `${product.max_speed} km/h` : '',
  ].filter(Boolean).slice(0, 4)
}

function toAiProduct(product: StoredProduct, message = ''): AiProduct {
  const pricing = resolveProductPrice(product)
  const monthlyPrice = Number(product.monthly_price || Math.max(1, Math.round(pricing.effectivePrice / 24)))
  return {
    id: String(product.id),
    title: product.title,
    slug: product.slug,
    image: product.image || product.images?.[0] || '/placeholder.svg',
    price: pricing.effectivePrice,
    formattedPrice: pricing.formattedEffectivePrice,
    formattedRegularPrice: pricing.hasDiscount ? pricing.formattedRegularPrice : undefined,
    discountPercentage: pricing.hasDiscount ? pricing.discountPercentage : undefined,
    monthlyPrice,
    formattedMonthlyPrice: formatMoney(monthlyPrice, 'CHF'),
    description: stripHtml(product.short_description || product.description || ''),
    stockQuantity: typeof product.stock_quantity === 'number' ? product.stock_quantity : null,
    reason: inferReason(message, product),
    badges: productBadges(product),
  }
}

function pickProducts(message: string, products: StoredProduct[]) {
  const text = normalize(message)
  const budgetMatch = text.match(/(?:chf|fr|budget|bis|unter|max)\s*['’]?\s*(\d{3,5})|(\d{3,5})\s*(?:chf|franken)/)
  const budget = budgetMatch ? Number(budgetMatch[1] || budgetMatch[2]) : 0
  const wantsRange = /(reichweite|lange|pendeln|arbeitsweg|commute|km)/.test(text)
  const wantsPower = /(schnell|power|leistung|berg|steigung|motor)/.test(text)
  const wantsOffer = /(angebot|rabatt|sale|aktion|gunstig|guenstig|billig|indirim)/.test(text)
  const wantsAccessories = /(zubehor|zubehör|accessoire|ersatz|teile|helm|akku|ladegerat|ladegerät)/.test(text)

  const terms = normalize(message)
    .split(/[^a-z0-9]+/i)
    .filter((term) => term.length > 2)

  const ranked = products
    .filter((product) => product.active !== false && product.archived !== true)
    .map((product) => {
      const text = productSearchText(product)
      const pricing = resolveProductPrice(product)
      const score = terms.reduce((sum, term) => sum + (text.includes(term) ? 4 : 0), 0)
        + (product.featured ? 2 : 0)
        + (product.bestseller ? 2 : 0)
        + (pricing.hasDiscount ? 3 : 0)
        + (wantsOffer && pricing.hasDiscount ? 6 : 0)
        + (wantsRange && product.range_km ? Math.min(6, Number(product.range_km) / 20) : 0)
        + (wantsPower && product.power_watts ? Math.min(6, Number(product.power_watts) / 500) : 0)
        + (wantsAccessories && /zubehor|zubehör|accessoire|ersatz|teile|helm|akku|ladegerat|ladegerät/i.test(text) ? 7 : 0)
        + (budget > 0 && pricing.effectivePrice <= budget ? 5 : budget > 0 ? -3 : 0)
        + ((product.stock_quantity ?? 1) > 0 ? 1 : -4)

      return { product, score }
    })
    .sort((a, b) => b.score - a.score || resolveProductPrice(a.product).effectivePrice - resolveProductPrice(b.product).effectivePrice)

  const positive = ranked.filter((item) => item.score > 0).slice(0, 5)
  const fallback = ranked.slice(0, 5)

  return (positive.length ? positive : fallback).map((item) => item.product)
}

function buildProductContext(products: StoredProduct[]) {
  return products.slice(0, MAX_CONTEXT_PRODUCTS).map((product) => {
    const pricing = resolveProductPrice(product)
    return [
      `Produkt: ${product.title}`,
      `Slug: /produkte/${product.slug}`,
      `Preis: ${pricing.formattedEffectivePrice}`,
      pricing.hasDiscount ? `Angebot statt ${pricing.formattedRegularPrice}` : '',
      product.brand ? `Marke: ${product.brand}` : '',
      product.range_km ? `Reichweite: ${product.range_km} km` : '',
      product.max_speed ? `Geschwindigkeit: ${product.max_speed} km/h` : '',
      product.power_watts ? `Leistung: ${product.power_watts} W` : '',
      product.stock_quantity ? `Lager: ${product.stock_quantity}` : '',
      product.short_description ? `Kurztext: ${stripHtml(product.short_description)}` : '',
    ].filter(Boolean).join('\n')
  }).join('\n\n')
}

function detectIntent(message: string): AiIntent {
  const text = normalize(message)
  if (/(support|hilfe|kontakt|iletisim|yardim|ticket|servis|problem|ariza|defekt)/.test(text)) return 'support'
  if (/(probefahrt|testfahrt|test drive|deneme|surus|randevu)/.test(text)) return 'test_drive'
  if (/(finanz|rate|ratenzahlung|taksit|leasing|monatlich)/.test(text)) return 'financing'
  if (/(sat[iı]n al|kaufen|buy|checkout|kasse|bezahlen|siparis ver|bestellen)/.test(text)) return 'checkout'
  if (/(sepete|warenkorb|cart|add to cart|hinzufugen|hinzufuegen)/.test(text)) return 'add_to_cart'
  return 'recommendation'
}

function buildAdvisorActions(intent: AiIntent): AdvisorAction[] {
  if (intent === 'support') {
    return [
      { label: 'Support-Ticket öffnen', href: '/account?tab=support', tone: 'primary' },
      { label: 'Service Center', href: '/account?tab=service', tone: 'secondary' },
      { label: 'Kontaktformular', href: '/contact', tone: 'outline' },
    ]
  }
  if (intent === 'test_drive') {
    return [
      { label: 'Probefahrt buchen', href: '/account?tab=testdrives', tone: 'primary' },
      { label: 'Modell ansehen', href: '/produkte', tone: 'secondary' },
      { label: 'Kontakt', href: '/contact', tone: 'outline' },
    ]
  }
  if (intent === 'financing') {
    return [
      { label: 'Ratenzahlung prüfen', href: '/ratenzahlung', tone: 'primary' },
      { label: 'Finanzierungsrechner', href: '/finanzierungsrechner', tone: 'secondary' },
      { label: 'Beratung anfragen', href: '/contact', tone: 'outline' },
    ]
  }
  return [
    { label: 'Zur Kasse', href: '/kasse', tone: 'primary' },
    { label: 'Warenkorb öffnen', href: '/cart', tone: 'secondary' },
    { label: 'Probefahrt', href: '/account?tab=testdrives', tone: 'outline' },
  ]
}

function buildAdvisorSummary(intent: AiIntent, selected: AiProduct[]) {
  const first = selected[0]
  if (intent === 'checkout' || intent === 'add_to_cart') {
    return first
      ? `Ich habe ${first.title} als stärkste Kaufempfehlung vorbereitet. Sie können es direkt in den Warenkorb legen oder sicher zur Kasse gehen.`
      : 'Ich kann den passenden Artikel für den Warenkorb vorbereiten und Sie sicher zur Kasse führen.'
  }
  if (intent === 'support') return 'Ich leite Sie schnell zum passenden Support- oder Serviceweg und kann ein Ticket im Kundenkonto vorbereiten.'
  if (intent === 'test_drive') return 'Für eine Probefahrt empfehle ich zuerst ein Modell auszuwählen, damit der Termin gezielt vorbereitet werden kann.'
  if (intent === 'financing') return 'Ich priorisiere Modelle, die gut zu einem planbaren Monatsbudget und Ratenzahlung passen.'
  return first
    ? `Meine Top-Empfehlung ist ${first.title}, weil sie am besten zu Ihrer Anfrage passt.`
    : 'Ich suche passende Modelle, Zubehör und Serviceoptionen aus dem MK-eMotors Sortiment.'
}

function buildLocalAnswer(message: string, products: StoredProduct[], selected: AiProduct[]) {
  const text = normalize(message)
  const intent = detectIntent(message)
  const intro = intent === 'checkout'
    ? 'Ich kann den passenden Artikel für Sie vorbereiten und in den Warenkorb legen. Die Zahlung bestätigen Sie sicher selbst im Checkout.'
    : intent === 'add_to_cart'
      ? 'Ich habe den passendsten Artikel für den Warenkorb vorbereitet.'
      : intent === 'support'
        ? 'Ich kann Sie direkt zum Support oder zur Kontaktaufnahme führen.'
        : intent === 'test_drive'
          ? 'Für eine Probefahrt empfehle ich zuerst das passende Modell auszuwählen und anschliessend den Termin anzufragen.'
          : text.includes('finanz') || text.includes('rate')
    ? 'Für Finanzierung und Ratenzahlung eignen sich besonders Modelle mit planbarem Monatsbudget.'
    : text.includes('zubehor') || text.includes('accessoire') || text.includes('ersatz')
      ? 'Für Zubehör und Ersatzteile empfehle ich zuerst die passenden Artikel nach Kompatibilität und Nutzung.'
      : 'Ich habe passende Produkte aus dem MK-eMotors Sortiment für Sie ausgewählt.'

  const productLine = selected.length
    ? selected.slice(0, 3).map((product) => `${product.title} (${product.formattedPrice}${product.formattedRegularPrice ? ` statt ${product.formattedRegularPrice}` : ''})`).join(', ')
    : products.length
      ? `${products[0].title} (${formatMoney(resolveProductPrice(products[0]).effectivePrice, 'CHF')})`
      : 'Aktuell sind keine Produkte im Katalog verfügbar.'

  return `${intro}\n\nMeine Empfehlung: ${productLine}.\n\nWarum: ${selected[0]?.reason || 'Die Auswahl passt am besten zu Ihrer Anfrage.'}\n\nNächster Schritt: Produkt ansehen, in den Warenkorb legen, Probefahrt buchen oder sicher zur Kasse gehen.`
}

export async function POST(request: NextRequest) {
  try {
    const settings = getShopSettings()
    if (!settings.ai.enabled) {
      return NextResponse.json({ error: 'Shop mit AI ist deaktiviert.' }, { status: 403 })
    }

    const body = await request.json().catch(() => ({}))
    const message = String(body.message || '').trim()
    const history = Array.isArray(body.history) ? body.history.slice(-8) as ChatMessage[] : []

    if (!message) {
      return NextResponse.json({ error: 'Bitte geben Sie eine Nachricht ein.' }, { status: 400 })
    }

    const products = getStoredProducts().filter((product) => product.active !== false && product.archived !== true)
    const selectedProducts = pickProducts(message, products)
    const recommendations = selectedProducts.map((product) => toAiProduct(product, message))
    const intent = detectIntent(message)

    if (settings.ai.apiKey && settings.ai.endpoint && settings.ai.model) {
      try {
        const response = await fetch(settings.ai.endpoint, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${settings.ai.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: settings.ai.model,
            temperature: settings.ai.temperature,
            messages: [
              {
                role: 'system',
                content: `${stripHtml(settings.ai.systemPrompt)}\n\nProduktkontext:\n${buildProductContext(selectedProducts.length ? selectedProducts : products)}`,
              },
              ...history.map((item) => ({ role: item.role, content: String(item.content || '').slice(0, 1200) })),
              { role: 'user', content: message },
            ],
          }),
        })

        if (response.ok) {
          const data = await response.json()
          const answer = String(data?.choices?.[0]?.message?.content || '').trim()
          if (answer) {
            return NextResponse.json({
              answer,
              products: recommendations,
              intent,
              mode: 'ai',
              summary: buildAdvisorSummary(intent, recommendations),
              actions: buildAdvisorActions(intent),
            })
          }
        }
      } catch (error) {
        console.warn('[Shop AI] Falling back to local answer:', error)
      }
    }

    return NextResponse.json({
      answer: buildLocalAnswer(message, products, recommendations),
      products: recommendations,
      intent,
      mode: 'local',
      summary: buildAdvisorSummary(intent, recommendations),
      actions: buildAdvisorActions(intent),
    })
  } catch (error) {
    console.error('[Shop AI Error]', error)
    return NextResponse.json({ error: 'AI Assistent konnte nicht antworten.' }, { status: 500 })
  }
}
