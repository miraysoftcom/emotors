'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Bell, CheckCheck, Mail, Package, Star } from 'lucide-react'
import type { AdminNotification } from '@/lib/admin-notifications'

type NotificationPayload = {
  notifications: AdminNotification[]
  counts: {
    total: number
    high: number
    orders: number
    requests: number
    reviews: number
  }
  generatedAt: string
}

const storageKey = 'mk-admin-read-notifications'

const iconMap = {
  order: Package,
  request: Mail,
  review: Star,
}

export function AdminRealtimeNotifications() {
  const [open, setOpen] = useState(false)
  const [payload, setPayload] = useState<NotificationPayload | null>(null)
  const [readIds, setReadIds] = useState<Set<string>>(() => new Set())
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    try {
      setReadIds(new Set(JSON.parse(window.localStorage.getItem(storageKey) || '[]')))
    } catch {
      setReadIds(new Set())
    }
  }, [])

  useEffect(() => {
    const source = new EventSource('/api/admin/notifications/stream', { withCredentials: true })

    source.addEventListener('open', () => setConnected(true))
    source.addEventListener('error', () => setConnected(false))
    source.addEventListener('notifications', (event) => {
      try {
        setPayload(JSON.parse((event as MessageEvent).data))
        setConnected(true)
      } catch {
        setConnected(false)
      }
    })

    return () => source.close()
  }, [])

  const notifications = payload?.notifications || []
  const unreadCount = useMemo(
    () => notifications.filter((item) => !readIds.has(item.id)).length,
    [notifications, readIds]
  )

  function markAllRead() {
    const next = new Set([...readIds, ...notifications.map((item) => item.id)])
    setReadIds(next)
    window.localStorage.setItem(storageKey, JSON.stringify([...next].slice(-120)))
  }

  function markOneRead(id: string) {
    const next = new Set([...readIds, id])
    setReadIds(next)
    window.localStorage.setItem(storageKey, JSON.stringify([...next].slice(-120)))
    setOpen(false)
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="relative inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm font-bold text-slate-300 transition hover:bg-white/8 hover:text-white"
        aria-label="Live Benachrichtigungen"
      >
        <span className={`h-2 w-2 rounded-full ${connected ? 'bg-emerald-400 shadow-[0_0_0_4px_rgba(52,211,153,0.12)]' : 'bg-slate-500'}`} />
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-accent px-1 text-xs font-black text-accent-foreground">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+0.75rem)] z-[100] w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-white/10 bg-slate-950 shadow-2xl shadow-black/50">
          <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
            <div>
              <p className="text-sm font-black text-white">Live Benachrichtigungen</p>
              <p className="mt-0.5 text-xs text-slate-400">
                {connected ? 'Websocket-Livekanal aktiv' : 'Verbindung wird aufgebaut'}
              </p>
            </div>
            <button
              type="button"
              onClick={markAllRead}
              className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-2 py-1 text-xs font-bold text-slate-300 hover:bg-white/8"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Gelesen
            </button>
          </div>

          <div className="max-h-[28rem] overflow-y-auto p-2">
            {notifications.length === 0 ? (
              <div className="p-5 text-sm font-semibold text-slate-400">
                Noch keine neuen Ereignisse.
              </div>
            ) : notifications.map((item) => {
              const Icon = iconMap[item.type]
              const unread = !readIds.has(item.id)
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => markOneRead(item.id)}
                  className={`flex gap-3 rounded-xl p-3 transition hover:bg-white/8 ${unread ? 'bg-accent/10' : ''}`}
                >
                  <span className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${item.priority === 'high' ? 'bg-accent text-accent-foreground' : 'bg-white/8 text-slate-300'}`}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-black text-white">{item.title}</span>
                    <span className="mt-1 line-clamp-2 text-xs leading-5 text-slate-400">{item.message}</span>
                    <span className="mt-2 block text-[0.68rem] font-bold uppercase tracking-widest text-slate-500">
                      {new Date(item.createdAt).toLocaleString('de-CH')}
                    </span>
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

