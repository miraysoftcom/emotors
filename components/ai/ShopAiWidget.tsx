'use client'

import Link from 'next/link'
import { FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import {
  Bot,
  CalendarDays,
  ChevronRight,
  CreditCard,
  Headphones,
  MoreVertical,
  Send,
  ShoppingCart,
  Sparkles,
  X,
  Zap,
} from 'lucide-react'
import { useCartStore } from '@/lib/store/cartStore'

type AiSettings = {
  enabled: boolean
  title: string
  welcomeMessage: string
  suggestions: string[]
  configured: boolean
}

type ChatMessage = {
  role: 'assistant' | 'user'
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

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

export function ShopAiWidget() {
  const [settings, setSettings] = useState<AiSettings | null>(null)
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [products, setProducts] = useState<AiProduct[]>([])
  const [intent, setIntent] = useState<AiIntent>('recommendation')
  const [summary, setSummary] = useState('')
  const [actions, setActions] = useState<AdvisorAction[]>([])
  const [actionNotice, setActionNotice] = useState('')
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [addedId, setAddedId] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const { addItem } = useCartStore()

  useEffect(() => {
    let active = true
    fetch('/api/shop/settings', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (!active) return
        const ai = data?.ai as AiSettings | undefined
        if (ai?.enabled) {
          setSettings(ai)
          setMessages([{ role: 'assistant', content: stripHtml(ai.welcomeMessage) }])
        }
      })
      .catch(() => undefined)

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!open) return
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, products, open])

  const suggestions = useMemo(() => {
    const fallback = ['Zeige mir passende E-Scooter', 'Ich möchte kaufen', 'Support kontaktieren', 'Probefahrt buchen']
    return settings?.suggestions?.length ? settings.suggestions.slice(0, 4) : fallback
  }, [settings?.suggestions])

  const sendMessage = async (nextMessage?: string) => {
    const content = (nextMessage || input).trim()
    if (!content || loading) return

    const nextMessages: ChatMessage[] = [...messages, { role: 'user', content }]
    setMessages(nextMessages)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/shop-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          history: nextMessages.slice(-8),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'AI Antwort fehlgeschlagen.')
      const nextProducts = Array.isArray(data.products) ? data.products as AiProduct[] : []
      const nextIntent = (data.intent || 'recommendation') as AiIntent
      setMessages((current) => [...current, { role: 'assistant', content: String(data.answer || '') }])
      setProducts(nextProducts)
      setIntent(nextIntent)
      setSummary(String(data.summary || ''))
      setActions(Array.isArray(data.actions) ? data.actions as AdvisorAction[] : [])
      setActionNotice('')

      if ((nextIntent === 'add_to_cart' || nextIntent === 'checkout') && nextProducts[0]) {
        addProduct(nextProducts[0], { silent: true })
        setActionNotice(`${nextProducts[0].title} wurde für Sie in den Warenkorb gelegt.`)
      }
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          content: error instanceof Error
            ? error.message
            : 'Der Assistent ist gerade nicht erreichbar. Bitte versuchen Sie es erneut.',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const submit = (event: FormEvent) => {
    event.preventDefault()
    void sendMessage()
  }

  const addProduct = (product: AiProduct, options: { silent?: boolean } = {}) => {
    addItem({
      id: product.id,
      title: product.title,
      price: product.price,
      quantity: 1,
      image: product.image,
      handle: product.slug,
      stock_quantity: product.stockQuantity ?? undefined,
    })
    setAddedId(product.id)
    if (!options.silent) setActionNotice(`${product.title} wurde in den Warenkorb gelegt.`)
    window.setTimeout(() => setAddedId(null), 1600)
  }

  const buyProduct = (product: AiProduct) => {
    addProduct(product, { silent: true })
    window.location.href = '/kasse'
  }

  if (!settings) return null

  return (
    <div className="fixed bottom-4 right-4 z-[80] sm:bottom-6 sm:right-6">
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="group flex h-16 w-16 items-center justify-center rounded-full border border-white/20 bg-neutral-950 text-white shadow-2xl shadow-black/30 transition hover:scale-105 dark:border-emerald-400/30 dark:bg-neutral-900"
          aria-label="Shop mit AI öffnen"
        >
          <Sparkles className="h-7 w-7 text-emerald-300 transition group-hover:rotate-12" />
        </button>
      )}

      {open && (
        <section className="flex max-h-[min(44rem,calc(100vh-2rem))] w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-[2rem] border border-white/15 bg-[#262626] text-white shadow-2xl shadow-black/40 sm:w-[31rem]">
          <header className="flex items-center gap-4 border-b border-white/10 bg-gradient-to-r from-neutral-950 via-neutral-900 to-emerald-950/70 px-5 py-5">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white text-neutral-950">
              <Sparkles className="h-6 w-6" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-lg font-black">{settings.title || 'MK-eMotors AI'}</p>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300">Shop mit AI</p>
            </div>
            <Link href="/cart" className="rounded-full p-2 text-white/80 hover:bg-white/10" aria-label="Warenkorb">
              <ShoppingCart className="h-6 w-6" />
            </Link>
            <Link href="/account?tab=support" className="rounded-full p-2 text-white/80 hover:bg-white/10" aria-label="Support">
              <Headphones className="h-6 w-6" />
            </Link>
            <button type="button" className="hidden rounded-full p-2 text-white/80 hover:bg-white/10 sm:inline-flex" aria-label="Mehr">
              <MoreVertical className="h-6 w-6" />
            </button>
            <button type="button" onClick={() => setOpen(false)} className="rounded-full p-2 text-white/80 hover:bg-white/10" aria-label="Schliessen">
              <X className="h-7 w-7" />
            </button>
          </header>

          <div ref={scrollRef} className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => void sendMessage('Ich möchte ein passendes Modell kaufen')} className="rounded-2xl border border-emerald-300/25 bg-emerald-300/10 px-3 py-3 text-left text-sm font-black text-emerald-100 hover:bg-emerald-300/20">
                <Zap className="mb-2 h-5 w-5 text-emerald-300" /> Kaufen
              </button>
              <button type="button" onClick={() => void sendMessage('Ich brauche Support')} className="rounded-2xl border border-white/15 bg-white/[0.04] px-3 py-3 text-left text-sm font-black text-white hover:bg-white/10">
                <Headphones className="mb-2 h-5 w-5 text-emerald-300" /> Support
              </button>
              <button type="button" onClick={() => void sendMessage('Ich möchte eine Probefahrt buchen')} className="rounded-2xl border border-white/15 bg-white/[0.04] px-3 py-3 text-left text-sm font-black text-white hover:bg-white/10">
                <CalendarDays className="mb-2 h-5 w-5 text-emerald-300" /> Probefahrt
              </button>
              <button type="button" onClick={() => void sendMessage('Zeige Finanzierung und Ratenzahlung')} className="rounded-2xl border border-white/15 bg-white/[0.04] px-3 py-3 text-left text-sm font-black text-white hover:bg-white/10">
                <CreditCard className="mb-2 h-5 w-5 text-emerald-300" /> Finanzierung
              </button>
            </div>

            {actionNotice && (
              <div className="rounded-[1.5rem] border border-emerald-300/30 bg-emerald-300/10 p-4">
                <p className="font-black text-emerald-100">{actionNotice}</p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <Link href="/cart" className="rounded-full bg-white px-4 py-3 text-center text-sm font-black text-neutral-950 hover:bg-emerald-300">
                    Warenkorb öffnen
                  </Link>
                  <Link href="/kasse" className="rounded-full bg-emerald-400 px-4 py-3 text-center text-sm font-black text-neutral-950 hover:bg-emerald-300">
                    Zur Kasse
                  </Link>
                </div>
              </div>
            )}

            {(summary || actions.length > 0) && (
              <div className="rounded-[1.75rem] border border-emerald-300/25 bg-gradient-to-br from-emerald-300/15 via-white/[0.05] to-white/[0.02] p-4 shadow-xl shadow-black/20">
                <div className="flex items-start gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-emerald-300 text-neutral-950">
                    <Sparkles className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-300">MK Kaufberatung</p>
                    {summary && <p className="mt-2 text-sm font-bold leading-6 text-white">{summary}</p>}
                  </div>
                </div>
                {actions.length > 0 && (
                  <div className="mt-4 grid gap-2 sm:grid-cols-3">
                    {actions.map((action) => (
                      <Link
                        key={`${action.href}-${action.label}`}
                        href={action.href}
                        className={`rounded-full px-4 py-3 text-center text-xs font-black transition ${
                          action.tone === 'primary'
                            ? 'bg-emerald-400 text-neutral-950 hover:bg-emerald-300'
                            : action.tone === 'secondary'
                              ? 'bg-white text-neutral-950 hover:bg-emerald-100'
                              : 'border border-white/20 text-white hover:bg-white/10'
                        }`}
                      >
                        {action.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {(intent === 'support' || intent === 'test_drive') && (
              <div className="rounded-[1.5rem] border border-white/15 bg-white/[0.04] p-4">
                <p className="font-black">{intent === 'support' ? 'Support direkt kontaktieren' : 'Probefahrt anfragen'}</p>
                <p className="mt-2 text-sm text-white/70">
                  {intent === 'support'
                    ? 'Öffnen Sie ein Ticket im Kundenkonto oder senden Sie eine Kontaktanfrage.'
                    : 'Wählen Sie ein Modell und senden Sie Ihren Wunschtermin an MK-eMotors Dornach.'}
                </p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <Link href={intent === 'support' ? '/account?tab=support' : '/account?tab=testdrives'} className="rounded-full bg-emerald-400 px-4 py-3 text-center text-sm font-black text-neutral-950">
                    Kundenkonto öffnen
                  </Link>
                  <Link href="/contact" className="rounded-full border border-white/20 px-4 py-3 text-center text-sm font-black text-white hover:bg-white/10">
                    Kontaktformular
                  </Link>
                </div>
              </div>
            )}

            {products.length > 0 && (
              <div className="space-y-3">
                {products.slice(0, 3).map((product) => (
                  <article key={product.id} className="overflow-hidden rounded-[1.65rem] border border-white/15 bg-gradient-to-br from-white/[0.08] to-white/[0.02] shadow-xl shadow-black/20">
                    <Link href={`/produkte/${product.slug}`} className="block">
                      <div className="relative flex aspect-[4/3] items-center justify-center bg-white">
                        {product.discountPercentage ? (
                          <span className="absolute right-3 top-3 rounded-full bg-red-600 px-3 py-1 text-xs font-black text-white">
                            -{product.discountPercentage}%
                          </span>
                        ) : null}
                        <img src={product.image} alt={product.title} className="h-full w-full object-contain p-4" />
                      </div>
                      <div className="p-4">
                        {product.badges?.length > 0 && (
                          <div className="mb-3 flex flex-wrap gap-2">
                            {product.badges.map((badge) => (
                              <span key={badge} className="rounded-full border border-emerald-300/25 bg-emerald-300/10 px-2.5 py-1 text-[0.65rem] font-black uppercase tracking-widest text-emerald-200">
                                {badge}
                              </span>
                            ))}
                          </div>
                        )}
                        <h3 className="line-clamp-2 text-base font-black">{product.title}</h3>
                        <div className="mt-2 flex flex-wrap items-end gap-2">
                          {product.formattedRegularPrice && (
                            <span className="text-xs font-black text-white/45 line-through decoration-red-400 decoration-2">
                              {product.formattedRegularPrice}
                            </span>
                          )}
                          <p className="text-lg font-black text-emerald-300">{product.formattedPrice}</p>
                        </div>
                        <p className="mt-1 text-xs font-bold text-white/65">oder ab {product.formattedMonthlyPrice} / Monat</p>
                        {product.reason && (
                          <p className="mt-3 rounded-2xl border border-white/10 bg-black/20 p-3 text-sm font-semibold leading-5 text-white/80">
                            {product.reason}
                          </p>
                        )}
                        {product.description && <p className="mt-2 line-clamp-2 text-sm text-white/70">{product.description}</p>}
                      </div>
                    </Link>
                    <div className="grid gap-2 border-t border-white/10 p-4 sm:grid-cols-3">
                      <Link href={`/produkte/${product.slug}`} className="flex items-center justify-center rounded-full border border-white/20 px-4 py-3 text-sm font-black text-white hover:bg-white/10">
                        Ansehen
                      </Link>
                      <button
                        type="button"
                        onClick={() => addProduct(product)}
                        className="flex items-center justify-center gap-2 rounded-full bg-white px-4 py-3 text-sm font-black text-neutral-950 transition hover:bg-emerald-300"
                      >
                        <ShoppingCart className="h-5 w-5" />
                        {addedId === product.id ? 'Drin' : 'Warenkorb'}
                      </button>
                      <button
                        type="button"
                        onClick={() => buyProduct(product)}
                        className="flex items-center justify-center gap-2 rounded-full bg-emerald-400 px-4 py-3 text-sm font-black text-neutral-950 transition hover:bg-emerald-300"
                      >
                        Jetzt kaufen
                      </button>
                    </div>
                  </article>
                ))}
                {products.length > 3 && (
                  <Link href="/produkte" className="flex items-center justify-center gap-2 rounded-[1.5rem] border border-white/15 px-5 py-4 font-black text-white/90 hover:bg-white/10">
                    Mehr Produkte anzeigen
                    <ChevronRight className="h-5 w-5" />
                  </Link>
                )}
              </div>
            )}

            <div className="space-y-4">
              {messages.map((message, index) => (
                <div key={`${message.role}-${index}`} className={message.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                  <div className={`max-w-[88%] rounded-[1.5rem] px-5 py-4 text-[0.98rem] leading-relaxed ${
                    message.role === 'user'
                      ? 'bg-emerald-400 font-semibold text-neutral-950'
                      : 'border border-white/10 bg-white/[0.04] text-white'
                  }`}>
                    {message.role === 'assistant' && <Bot className="mb-2 h-5 w-5 text-emerald-300" />}
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/70">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-300" />
                  AI sucht passende Produkte...
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => void sendMessage(suggestion)}
                  className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white/90 hover:border-emerald-300 hover:text-emerald-200"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={submit} className="border-t border-white/10 p-5">
            <div className="flex items-center gap-3 rounded-full border border-white/15 bg-white/[0.04] px-5 py-3">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder={`Nachricht an ${settings.title || 'MK-eMotors AI'}`}
                className="min-w-0 flex-1 bg-transparent text-base text-white outline-none placeholder:text-white/45"
              />
              <button type="submit" disabled={loading || !input.trim()} className="rounded-full bg-emerald-400 p-3 text-neutral-950 disabled:cursor-not-allowed disabled:opacity-40" aria-label="Senden">
                <Send className="h-5 w-5" />
              </button>
            </div>
          </form>
        </section>
      )}
    </div>
  )
}
