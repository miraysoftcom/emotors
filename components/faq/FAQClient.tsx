'use client'

import { useEffect, useMemo, useState } from 'react'
import { ChevronDown, Copy, Search, ArrowUp } from 'lucide-react'
import type { FAQCategory, FAQItem } from '@/lib/faq-store'

interface FAQClientProps {
  initialFaqs: FAQItem[]
  categories: FAQCategory[]
}

export function FAQClient({ initialFaqs, categories }: FAQClientProps) {
  const [faqs, setFaqs] = useState(initialFaqs)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null)

  useEffect(() => {
    const hash = decodeURIComponent(window.location.hash.replace('#', ''))
    if (hash) setExpanded(hash)
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    const timeout = window.setTimeout(async () => {
      setLoading(true)
      const params = new URLSearchParams({ limit: '500' })
      if (query.trim()) params.set('q', query.trim())
      if (category !== 'all') params.set('category', category)

      try {
        const res = await fetch(`/api/faqs?${params.toString()}`, {
          signal: controller.signal,
          cache: 'no-store',
        })
        if (res.ok) {
          const data = await res.json()
          setFaqs(data.faqs || [])
        }
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('[FAQ Search Error]', error)
        }
      } finally {
        setLoading(false)
      }
    }, 180)

    return () => {
      window.clearTimeout(timeout)
      controller.abort()
    }
  }, [query, category])

  const categoryCounts = useMemo(() => {
    return initialFaqs.reduce<Record<string, number>>((acc, faq) => {
      acc[faq.categorySlug] = (acc[faq.categorySlug] || 0) + 1
      return acc
    }, {})
  }, [initialFaqs])

  const openItem = (slug: string) => {
    const next = expanded === slug ? null : slug
    setExpanded(next)
    if (next) window.history.replaceState(null, '', `#${next}`)
    if (!next) window.history.replaceState(null, '', window.location.pathname)
  }

  const copyLink = async (slug: string) => {
    const url = `${window.location.origin}${window.location.pathname}#${slug}`
    await navigator.clipboard.writeText(url)
    setCopiedSlug(slug)
    window.setTimeout(() => setCopiedSlug(null), 1400)
  }

  return (
    <section className="bg-background">
      <div className="border-b border-border bg-card/60">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="mb-3 text-sm font-bold uppercase tracking-widest text-accent">FAQ Center</p>
            <h1 className="text-4xl font-black tracking-tight md:text-5xl">Häufig gestellte Fragen</h1>
            <p className="mt-5 text-lg leading-8 text-muted-foreground">
              Antworten zu E-Scootern, E-Bikes, E-Motorrädern, Akkus, Lieferung, Zahlung, Garantie,
              Rückgabe, Wartung und rechtlichen Fragen rund um urbane Elektromobilität.
            </p>
          </div>

          <div className="mt-8 flex max-w-3xl items-center gap-3 rounded-lg border border-border bg-background px-4 py-3 shadow-sm">
            <Search className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="FAQ durchsuchen, z. B. Akku, Führerschein, Lieferung..."
              className="w-full bg-transparent text-base outline-none placeholder:text-muted-foreground"
              aria-label="FAQ durchsuchen"
            />
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[280px_1fr] lg:px-8">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="space-y-2">
            <button
              onClick={() => setCategory('all')}
              className={`flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left text-sm font-bold transition ${
                category === 'all' ? 'border-accent bg-accent text-accent-foreground' : 'border-border bg-card hover:border-accent/50'
              }`}
            >
              <span>Alle Kategorien</span>
              <span>{initialFaqs.length}</span>
            </button>
            {categories.map((item) => (
              <button
                key={item.slug}
                onClick={() => setCategory(item.slug)}
                className={`flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left text-sm font-bold transition ${
                  category === item.slug ? 'border-accent bg-accent text-accent-foreground' : 'border-border bg-card hover:border-accent/50'
                }`}
              >
                <span>{item.name}</span>
                <span>{categoryCounts[item.slug] || 0}</span>
              </button>
            ))}
          </div>
        </aside>

        <div>
          <div className="mb-5 flex items-center justify-between gap-4 text-sm text-muted-foreground">
            <span>{loading ? 'Suche läuft...' : `${faqs.length} Antworten gefunden`}</span>
            {(query || category !== 'all') && (
              <button
                onClick={() => {
                  setQuery('')
                  setCategory('all')
                }}
                className="font-bold text-accent hover:underline"
              >
                Filter zurücksetzen
              </button>
            )}
          </div>

          <div className="space-y-3">
            {faqs.map((faq) => {
              const isOpen = expanded === faq.slug
              return (
                <article
                  key={faq.id}
                  id={faq.slug}
                  className="scroll-mt-28 rounded-lg border border-border bg-card shadow-sm transition hover:border-accent/40"
                >
                  <h2>
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={`${faq.slug}-answer`}
                      onClick={() => openItem(faq.slug)}
                      className="flex w-full items-start justify-between gap-5 px-5 py-5 text-left"
                    >
                      <span>
                        <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-accent">
                          {faq.category}
                        </span>
                        <span className="text-lg font-black leading-snug">{faq.question}</span>
                      </span>
                      <ChevronDown className={`mt-1 h-5 w-5 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                  </h2>
                  <div
                    id={`${faq.slug}-answer`}
                    className={`grid transition-all duration-300 ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
                  >
                    <div className="overflow-hidden">
                      <div className="border-t border-border px-5 py-5">
                        <div
                          className="managed-page-content text-base leading-8 text-muted-foreground"
                          dangerouslySetInnerHTML={{ __html: faq.answer }}
                        />
                        <div className="mt-5 flex flex-wrap items-center gap-3">
                          <button
                            type="button"
                            onClick={() => copyLink(faq.slug)}
                            className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-bold hover:border-accent hover:text-accent"
                          >
                            <Copy className="h-4 w-4" />
                            {copiedSlug === faq.slug ? 'Link kopiert' : 'Link kopieren'}
                          </button>
                          {faq.popular && <span className="rounded-full bg-secondary px-3 py-2 text-xs font-bold">Beliebte Frage</span>}
                          {faq.featured && <span className="rounded-full bg-secondary px-3 py-2 text-xs font-bold">Empfohlen</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>

          {faqs.length === 0 && (
            <div className="rounded-lg border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
              Keine passenden FAQ gefunden. Bitte ändern Sie den Suchbegriff oder die Kategorie.
            </div>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-5 right-5 inline-flex h-11 w-11 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg"
        aria-label="Nach oben"
      >
        <ArrowUp className="h-5 w-5" />
      </button>
    </section>
  )
}
