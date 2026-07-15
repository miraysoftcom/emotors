'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  BarChart3,
  Boxes,
  CalendarClock,
  ChevronDown,
  FileText,
  Gift,
  Home,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  MessageSquare,
  MonitorPlay,
  PanelsTopLeft,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Tags,
  Users,
  X,
} from 'lucide-react'
import { AdminRealtimeNotifications } from '@/components/admin/AdminRealtimeNotifications'

const navGroups = [
  {
    label: 'Übersicht',
    description: 'Dashboard und Kennzahlen',
    items: [
      { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard, description: 'Zentrale Übersicht' },
      { label: 'Statistik', href: '/admin/stats', icon: BarChart3, description: 'Auswertung und Performance' },
    ],
  },
  {
    label: 'Verkauf',
    description: 'Orders, Kunden, Rechnungen',
    items: [
      { label: 'Bestellungen', href: '/admin/orders', icon: Boxes, description: 'Aufträge bearbeiten' },
      { label: 'Coupons', href: '/admin/coupons', icon: Gift, description: 'Codes und Geschenkkarten' },
      { label: 'Rechnungen', href: '/admin/invoices', icon: FileText, description: 'Swiss QR und PDF' },
      { label: 'Garantie', href: '/admin/warranty', icon: ShieldCheck, description: 'Seriennummern und Service' },
      { label: 'Kunden', href: '/admin/customers', icon: Users, description: 'Kundendaten verwalten' },
      { label: 'Mitteilungen', href: '/admin/announcements', icon: Megaphone, description: 'Kundeninfos und Ankündigungen' },
      { label: 'Nachrichten', href: '/admin/messages', icon: MessageSquare, description: 'Kontaktanfragen' },
      { label: 'Kostenvoranschlag', href: '/admin/customer-requests', icon: CalendarClock, description: 'Termine und Antworten' },
    ],
  },
  {
    label: 'Katalog',
    description: 'Produkte und Kategorien',
    items: [
      { label: 'Produkte', href: '/admin/products', icon: ShoppingBag, description: 'Fahrzeuge und Artikel' },
      { label: 'Kategorien', href: '/admin/categories', icon: Tags, description: 'Shop-Struktur' },
      { label: 'Bewertungen', href: '/admin/reviews', icon: Star, description: 'Reviews moderieren' },
    ],
  },
  {
    label: 'Startseite',
    description: 'Hero, Banner, Inhalte',
    items: [
      { label: 'Hero-Bereich', href: '/admin/hero', icon: MonitorPlay, description: 'Startseiten-Banner' },
      { label: 'Login Slider', href: '/admin/login-slider', icon: PanelsTopLeft, description: 'Admin Login Hintergrund' },
      { label: 'Banner', href: '/admin/banners', icon: PanelsTopLeft, description: 'Marquee und Hinweise' },
      { label: 'Aktionen & Feiertage', href: '/admin/special-days', icon: Sparkles, description: 'Special Days Campaigns' },
      { label: 'Inhalte', href: '/admin/pages', icon: FileText, description: 'Seiteninhalte' },
    ],
  },
  {
    label: 'System',
    description: 'Konfiguration',
    items: [
      { label: 'Einstellungen', href: '/admin/settings', icon: Settings, description: 'Shop und Admin' },
      { label: 'Invoice Settings', href: '/admin/settings/invoices', icon: FileText, description: 'Swiss QR und MWST' },
    ],
  },
]

const allItems = navGroups.flatMap((group) => group.items)

export function AdminHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  if (pathname === '/admin/login') return null

  const activeItem = allItems.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' })
    } finally {
      router.push('/admin/login')
      router.refresh()
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#020604]/88 text-white shadow-2xl shadow-black/30 backdrop-blur-2xl">
      <div className="mx-auto flex h-20 max-w-[92rem] items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/admin/dashboard" className="flex min-w-fit items-center gap-3">
          <span className="admin-gradient-border flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-emerald-400 text-sm font-black text-black shadow-2xl shadow-accent/20">
            MK
          </span>
          <span className="hidden sm:block">
            <span className="block text-base font-black leading-tight tracking-tight">MK-eMotors <span className="text-accent">Dornach</span></span>
            <span className="block text-xs font-bold uppercase tracking-[0.22em] text-slate-500">
              {activeItem?.label || 'Admin Panel'}
            </span>
          </span>
        </Link>

        <nav className="hidden min-w-0 flex-1 items-center justify-center gap-1 lg:flex">
          {navGroups.map((group) => {
            const groupActive = group.items.some((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))

            return (
              <div key={group.label} className="group relative py-3">
                <button
                  type="button"
                  className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-black transition ${
                    groupActive
                      ? 'bg-accent text-black shadow-lg shadow-accent/20'
                      : 'text-slate-300 hover:bg-white/8 hover:text-white'
                  }`}
                >
                  {group.label}
                  <ChevronDown className="h-4 w-4 transition group-hover:rotate-180" />
                </button>

                <div className="invisible absolute left-1/2 top-[calc(100%-0.5rem)] z-[80] w-[24rem] -translate-x-1/2 opacity-0 transition duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                  <div className="h-3" aria-hidden="true" />
                  <div className="admin-gradient-border overflow-hidden rounded-3xl bg-[#050b08]/98 shadow-2xl shadow-black/50 backdrop-blur-2xl">
                    <div className="border-b border-white/10 px-4 py-3">
                      <p className="text-sm font-black">{group.label}</p>
                      <p className="mt-1 text-xs text-slate-400">{group.description}</p>
                    </div>
                    <div className="grid gap-1 p-2">
                      {group.items.map((item) => {
                        const Icon = item.icon
                        const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-start gap-3 rounded-2xl px-3 py-3 transition ${
                              active
                                ? 'bg-accent text-black shadow-lg shadow-accent/15'
                                : 'text-slate-300 hover:bg-white/8 hover:text-white'
                            }`}
                          >
                            <Icon className="mt-0.5 h-5 w-5 shrink-0" />
                            <span>
                              <span className="block text-sm font-black">{item.label}</span>
                              <span className={`mt-0.5 block text-xs ${active ? 'text-black/70' : 'text-slate-500'}`}>
                                {item.description}
                              </span>
                            </span>
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <AdminRealtimeNotifications />
          <Link
            href="/"
            className="hidden items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm font-bold text-slate-300 transition hover:bg-white/8 hover:text-white md:flex"
          >
            <Home className="h-4 w-4" />
            Website
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm font-bold text-slate-300 transition hover:bg-white/8 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileOpen((value) => !value)}
            className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] p-2 text-slate-300 lg:hidden"
            aria-label="Admin Menü"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="border-t border-white/10 bg-[#020604]/96 px-4 py-4 backdrop-blur-xl lg:hidden">
          <div className="mx-auto grid max-w-7xl gap-3">
            {navGroups.map((group) => (
              <details key={group.label} className="rounded-3xl border border-white/10 bg-white/[0.04]">
                <summary className="cursor-pointer px-4 py-3 text-sm font-black">{group.label}</summary>
                <div className="grid gap-1 border-t border-white/10 p-2">
                  {group.items.map((item) => {
                    const Icon = item.icon
                    const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-bold ${
                          active ? 'bg-accent text-black' : 'text-slate-300 hover:bg-white/8'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    )
                  })}
                </div>
              </details>
            ))}
          </div>
        </nav>
      )}
    </header>
  )
}
