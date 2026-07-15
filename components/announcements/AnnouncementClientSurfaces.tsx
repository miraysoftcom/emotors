'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Bell, Megaphone, X } from 'lucide-react'

type Announcement = {
  id: string
  title: string
  excerpt: string
  content: string
  priority: string
  accentColor?: string
  buttonText?: string
  buttonUrl?: string
  dismissible?: boolean
}

function textOf(item: Announcement) {
  return item.excerpt || item.content || item.title
}

function AnnouncementBody({ item, className }: { item: Announcement; className: string }) {
  if (item.excerpt) return <p className={className}>{item.excerpt}</p>
  return <div className={`managed-page-content ${className}`} dangerouslySetInnerHTML={{ __html: item.content || item.title }} />
}

export function GlobalAnnouncementPopup() {
  const [items, setItems] = useState<Announcement[]>([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    fetch('/api/announcements?placement=popup', { credentials: 'include' })
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        const announcements = (data?.announcements || []) as Announcement[]
        const visible = announcements.filter((item) => {
          try {
            return window.sessionStorage.getItem(`announcement-popup:${item.id}`) !== 'closed'
          } catch {
            return true
          }
        })
        setItems(visible)
        setReady(true)
      })
      .catch(() => setReady(true))
  }, [])

  const item = items[0]
  if (!ready || !item) return null

  const close = () => {
    try {
      window.sessionStorage.setItem(`announcement-popup:${item.id}`, 'closed')
    } catch {}
    setItems((current) => current.filter((entry) => entry.id !== item.id))
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/65 px-4 py-8 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={item.title}>
      <div className="w-full max-w-xl overflow-hidden rounded-3xl border border-white/10 bg-card text-card-foreground shadow-2xl shadow-black/50">
        <div className="flex items-start justify-between gap-4 border-b border-border bg-secondary/60 px-5 py-4">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
              <Megaphone className="h-5 w-5" />
            </span>
            <div>
              <span className="rounded-full px-3 py-1 text-xs font-black uppercase text-accent-foreground" style={{ backgroundColor: item.accentColor || '#26D872' }}>
                {item.priority}
              </span>
              <h2 className="mt-3 text-2xl font-black">{item.title}</h2>
            </div>
          </div>
          {item.dismissible !== false && (
            <button type="button" onClick={close} className="rounded-full border border-border p-2 text-muted-foreground hover:bg-secondary hover:text-foreground" aria-label="Popup schließen">
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
        <div className="space-y-5 p-6">
          <AnnouncementBody item={item} className="text-sm leading-6 text-muted-foreground" />
          <div className="flex flex-wrap gap-3">
            {item.buttonUrl && (
              <Link href={item.buttonUrl} onClick={close} className="rounded-2xl bg-accent px-5 py-3 text-sm font-black uppercase tracking-widest text-accent-foreground">
                {item.buttonText || 'Öffnen'}
              </Link>
            )}
            {item.dismissible !== false && (
              <button type="button" onClick={close} className="rounded-2xl border border-border px-5 py-3 text-sm font-black uppercase tracking-widest hover:bg-secondary">
                Später
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export function CheckoutAnnouncementBanner() {
  const [items, setItems] = useState<Announcement[]>([])

  useEffect(() => {
    fetch('/api/announcements?placement=checkout', { credentials: 'include' })
      .then((res) => res.ok ? res.json() : null)
      .then((data) => setItems(data?.announcements || []))
      .catch(() => setItems([]))
  }, [])

  const item = items[0]
  if (!item) return null

  return (
    <section className="mb-6 rounded-2xl border border-accent/30 bg-accent/10 p-4 text-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <Bell className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
          <div>
            <p className="font-black text-accent">{item.title}</p>
            <AnnouncementBody item={item} className="mt-1 text-muted-foreground" />
          </div>
        </div>
        {item.buttonUrl && (
          <Link href={item.buttonUrl} className="shrink-0 rounded-full border border-accent/50 px-4 py-2 text-xs font-black uppercase tracking-widest text-accent hover:bg-accent/10">
            {item.buttonText || 'Ansehen'}
          </Link>
        )}
      </div>
    </section>
  )
}

export function mergeAnnouncements(...groups: Announcement[][]) {
  const seen = new Set<string>()
  return groups.flat().filter((item) => {
    if (seen.has(item.id)) return false
    seen.add(item.id)
    return true
  })
}
