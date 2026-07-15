'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  BarChart3,
  Settings,
  FileText,
  Zap,
  HelpCircle,
  ShoppingBag,
  LogOut,
  Layers,
  Users,
  CreditCard,
  MessageSquare,
  TrendingUp,
  Package,
  Clock,
  CalendarClock,
} from 'lucide-react'

export default function AdminDashboard() {
  const router = useRouter()
  const [configStatus, setConfigStatus] = useState<{
    qr?: { label: string; missing: string[]; errors: string[] }
    tax?: { enabled: boolean; priceDisplay: string; uidNumber: string; rates: Array<{ percentage: number; isDefault: boolean }> }
  }>({})

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/invoice-settings', { credentials: 'include' }).then((res) => res.ok ? res.json() : null),
      fetch('/api/admin/tax-settings', { credentials: 'include' }).then((res) => res.ok ? res.json() : null),
    ]).then(([qrData, taxData]) => {
      setConfigStatus({ qr: qrData?.status, tax: taxData?.settings })
    }).catch(() => setConfigStatus({}))
  }, [])

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', {
        method: 'POST',
        credentials: 'include',
      })
    } catch (error) {
      console.error('[Logout Error]', error)
    }
    // Use router.push first, then force refresh if needed
    router.push('/admin/login')
    // Ensure logout completes by reloading after brief delay
    setTimeout(() => {
      router.refresh()
    }, 500)
  }

  const adminMenuItems = [
    {
      category: 'Verkauf & Bestellungen',
      items: [
        {
          label: 'Bestellungen',
          href: '/admin/orders',
          icon: ShoppingBag,
          description: 'Verwalten Sie alle Bestellungen',
          badge: 'Neu',
        },
        {
          label: 'Zahlungen',
          href: '/admin/payments',
          icon: CreditCard,
          description: 'Zahlungsverwaltung',
          badge: null,
        },
        {
          label: 'Kunden',
          href: '/admin/customers',
          icon: Users,
          description: 'Kundenverwaltung',
          badge: null,
        },
      ],
    },
    {
      category: 'Produkte & Inhalte',
      items: [
        {
          label: 'Produkte',
          href: '/admin/products',
          icon: Package,
          description: 'Verwalten Sie Produkte',
          badge: null,
        },
        {
          label: 'Kategorien',
          href: '/admin/categories',
          icon: Layers,
          description: 'Produktkategorien',
          badge: null,
        },
        {
          label: 'Sliders',
          href: '/admin/sliders',
          icon: Layers,
          description: 'Hero-Slider verwalten',
          badge: null,
        },
        {
          label: 'Banners',
          href: '/admin/banners',
          icon: FileText,
          description: 'Banner-Verwaltung',
          badge: 'Neu',
        },
        {
          label: 'Hero-Bereich',
          href: '/admin/hero',
          icon: Zap,
          description: 'Startseiten-Banner bearbeiten',
          badge: null,
        },
        {
          label: 'Login Slider',
          href: '/admin/login-slider',
          icon: Layers,
          description: 'Admin Login Hintergründe',
          badge: 'Neu',
        },
        {
          label: 'Features',
          href: '/admin/features',
          icon: Settings,
          description: 'Feature-Karten verwalten',
          badge: null,
        },
        {
          label: 'FAQ',
          href: '/admin/faq',
          icon: HelpCircle,
          description: 'FAQ verwalten',
          badge: null,
        },
      ],
    },
    {
      category: 'Kundenservice',
      items: [
        {
          label: 'Nachrichten',
          href: '/admin/messages',
          icon: MessageSquare,
          description: 'Kontaktanfragen anzeigen',
          badge: null,
        },
        {
          label: 'Finanzierungsanfragen',
          href: '/admin/financing-requests',
          icon: Clock,
          description: 'Finanzierungsanfragen verwalten',
          badge: 'Neu',
        },
        {
          label: 'Kostenvoranschlag',
          href: '/admin/customer-requests',
          icon: CalendarClock,
          description: 'Termine, Serviceanfragen und Antworten',
          badge: 'Live',
        },
      ],
    },
    {
      category: 'Verwaltung',
      items: [
        {
          label: 'Benutzer & Rollen',
          href: '/admin/users',
          icon: Users,
          description: 'Benutzer und Rollen verwalten',
          badge: null,
        },
        {
          label: 'Einstellungen',
          href: '/admin/settings',
          icon: Settings,
          description: 'Website-Einstellungen',
          badge: null,
        },
        {
          label: 'Statistiken',
          href: '/admin/stats',
          icon: BarChart3,
          description: 'Dashboard-Statistiken',
          badge: null,
        },
      ],
    },
  ]

  const dashboardStats = [
    {
      label: 'Neue Bestellungen',
      value: '24',
      icon: ShoppingBag,
      color: 'from-blue-500 to-blue-600',
      trend: '+12%',
    },
    {
      label: 'Umsatz',
      value: 'CHF 18,456',
      icon: CreditCard,
      color: 'from-green-500 to-green-600',
      trend: '+8%',
    },
    {
      label: 'Kunden',
      value: '342',
      icon: Users,
      color: 'from-purple-500 to-purple-600',
      trend: '+23%',
    },
    {
      label: 'Ausstehende Zahlungen',
      value: 'CHF 4,200',
      icon: Clock,
      color: 'from-orange-500 to-orange-600',
      trend: '-5%',
    },
  ]

  return (
    <div className="min-h-screen px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[92rem]">
        <section className="admin-gradient-border admin-surface mb-8 overflow-hidden p-6 md:p-8">
          <div className="grid gap-8 lg:grid-cols-[1.35fr_0.65fr] lg:items-end">
            <div>
              <p className="admin-kicker">Executive Control Center</p>
              <h1 className="mt-4 max-w-4xl text-4xl font-black tracking-tight md:text-6xl">
                MK-eMotors <span className="text-accent">Dornach</span> Admin
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 md:text-lg">
                Verkauf, Inhalte, Kundenservice und Swiss QR Prozesse in einer fokussierten Premium-Oberfläche.
              </p>
            </div>
            <div className="admin-surface-soft p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-400">Systemstatus</span>
                <span className="rounded-full bg-accent/15 px-3 py-1 text-xs font-black text-accent">Live</span>
              </div>
              <div className="mt-5 grid gap-3">
                <StatusLine label="Swiss QR" value={configStatus.qr?.label || 'Prüfung'} />
                <StatusLine label="MWST" value={configStatus.tax?.enabled ? 'Aktiv' : 'Deaktiviert'} />
                <StatusLine label="Benachrichtigungen" value="Realtime" />
              </div>
            </div>
          </div>
        </section>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {dashboardStats.map((stat, idx) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="admin-surface-soft group p-6 transition hover:-translate-y-1 hover:border-accent/40 hover:bg-white/[0.07]"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className={`rounded-2xl bg-gradient-to-br ${stat.color} p-3 shadow-lg shadow-black/20`}>
                    <Icon size={24} className="text-white" />
                  </span>
                  <span className="text-sm font-black bg-white/10 px-2.5 py-1 rounded-full text-accent">
                    {stat.trend}
                  </span>
                </div>
                <p className="text-sm font-bold text-slate-400 mb-1">{stat.label}</p>
                <p className="text-3xl font-black tracking-tight">{stat.value}</p>
              </motion.div>
            )
          })}
        </div>

        <div className="mb-8 grid gap-4 lg:grid-cols-2">
          <Link href="/admin/settings/invoices" className="admin-surface-soft block p-5 transition hover:-translate-y-1 hover:border-accent/40">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-black text-white">Swiss QR-Bill</h2>
              <span className="rounded-full bg-accent/15 px-3 py-1 text-xs font-black text-accent">{configStatus.qr?.label || 'Nicht konfiguriert'}</span>
            </div>
            <p className="text-sm text-slate-400">Fehlende Angaben: {configStatus.qr?.missing?.length ? configStatus.qr.missing.join(', ') : 'Keine'}</p>
            {(configStatus.qr?.errors?.length || 0) > 0 && <p className="mt-2 text-sm text-red-600">{configStatus.qr?.errors.join(' ')}</p>}
          </Link>
          <Link href="/admin/settings/invoices" className="admin-surface-soft block p-5 transition hover:-translate-y-1 hover:border-accent/40">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-black text-white">MWST</h2>
              <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-black text-emerald-300">{configStatus.tax?.enabled ? 'Aktiv' : 'Deaktiviert'}</span>
            </div>
            <p className="text-sm text-slate-400">Standardsteuersatz: {configStatus.tax?.rates?.find((rate) => rate.isDefault)?.percentage ?? 8.1}%</p>
            <p className="text-sm text-slate-400">Preisdarstellung: {configStatus.tax?.priceDisplay === 'exclusive' ? 'Exklusive MWST' : 'Inklusive MWST'}</p>
            <p className="text-sm text-slate-400">MWST-Nummer: {configStatus.tax?.uidNumber || 'Nicht hinterlegt'}</p>
          </Link>
        </div>

        {/* Menu Categories */}
        {adminMenuItems.map((category, catIdx) => (
          <motion.div
            key={catIdx}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 + catIdx * 0.1 }}
            className="mb-8"
          >
            <h2 className="mb-4 text-lg font-black text-white">{category.category}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {category.items.map((item, idx) => {
                const Icon = item.icon
                return (
                  <Link key={idx} href={item.href}>
                    <motion.div
                      whileHover={{ y: -4 }}
                      className="admin-surface-soft group cursor-pointer p-6 transition-all hover:border-accent/40 hover:bg-white/[0.07]"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="rounded-2xl bg-accent/12 p-3 text-accent transition group-hover:bg-accent group-hover:text-black">
                          <Icon size={24} />
                        </div>
                        {item.badge && (
                          <span className="text-xs font-black bg-accent/15 text-accent px-2 py-1 rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <h3 className="font-black text-white group-hover:text-accent transition-colors mb-1">
                        {item.label}
                      </h3>
                      <p className="text-sm leading-6 text-slate-400">{item.description}</p>
                    </motion.div>
                  </Link>
                )
              })}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function StatusLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
      <span className="text-sm font-bold text-slate-400">{label}</span>
      <span className="text-sm font-black text-white">{value}</span>
    </div>
  )
}
