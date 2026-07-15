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
  description: string
  stockQuantity: number | null
}

type AiIntent = 'recommendation' | 'add_to_cart' | 'checkout' | 'support' | 'test_drive' | 'financing'

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

function toAiProduct(product: StoredProduct): AiProduct {
  const pricing = resolveProductPrice(product)
  return {
    id: String(product.id),
    title: product.title,
    slug: product.slug,
    image: product.image || product.images?.[0] || '/placeholder.svg',
    price: pricing.effectivePrice,
    formattedPrice: pricing.formattedEffectivePrice,
    description: stripHtml(product.short_description || product.description || ''),
    stockQuantity: typeof product.stock_quantity === 'number' ? product.stock_quantity : null,
  }
}

function pickProducts(message: string, products: StoredProduct[]) {
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
    ? selected.map((product) => `${product.title} (${product.formattedPrice})`).join(', ')
    : products.length
      ? `${products[0].title} (${formatMoney(resolveProductPrice(products[0]).effectivePrice, 'CHF')})`
      : 'Aktuell sind keine Produkte im Katalog verfügbar.'

  return `${intro} Meine Empfehlung: ${productLine}. Sie können die Produkte direkt ansehen, in den Warenkorb legen, zur Kasse gehen oder Support kontaktieren.`
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
    const recommendations = selectedProducts.map(toAiProduct)
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
            return NextResponse.json({ answer, products: recommendations, intent, mode: 'ai' })
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
    })
  } catch (error) {
    console.error('[Shop AI Error]', error)
    return NextResponse.json({ error: 'AI Assistent konnte nicht antworten.' }, { status: 500 })
  }
}
