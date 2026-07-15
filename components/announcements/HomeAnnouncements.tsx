import Link from 'next/link'
import { Bell, Megaphone } from 'lucide-react'
import { getPublicAnnouncements } from '@/lib/announcements-store'

function AnnouncementButton({ href, children }: { href?: string; children: string }) {
  if (!href) return null
  return (
    <Link href={href} className="inline-flex rounded-full border border-current px-4 py-2 text-xs font-black uppercase tracking-widest transition hover:bg-white/10">
      {children}
    </Link>
  )
}

function AnnouncementHtml({ html, className }: { html: string; className: string }) {
  return <div className={className} dangerouslySetInnerHTML={{ __html: html }} />
}

export function HomeAnnouncementTop() {
  const items = getPublicAnnouncements({ placement: 'homepage_top', authenticated: false }).slice(0, 1)
  if (items.length === 0) return null
  const item = items[0]

  return (
    <section className="border-b border-white/10 bg-slate-950 text-white" aria-label="Ankündigung">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Bell className="h-4 w-4 shrink-0 text-accent" />
          <p className="font-semibold">{item.excerpt || item.title}</p>
        </div>
        <AnnouncementButton href={item.buttonUrl}>{item.buttonText || 'Mehr erfahren'}</AnnouncementButton>
      </div>
    </section>
  )
}

export function HomeAnnouncementBanner() {
  const items = getPublicAnnouncements({ placement: 'homepage_banner', authenticated: false }).slice(0, 3)
  if (items.length === 0) return null

  return (
    <section className="bg-slate-950 px-4 py-10 text-white md:px-8" aria-label="Aktuelle Hinweise">
      <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-3">
        {items.map((item) => (
          <article key={item.id} className="rounded-3xl border border-white/10 bg-white/[0.05] p-5 shadow-xl shadow-black/20">
            <span className="inline-flex rounded-full px-3 py-1 text-xs font-black text-slate-950" style={{ backgroundColor: item.accentColor || '#26D872' }}>
              {item.priority}
            </span>
            <h2 className="mt-4 text-2xl font-black">{item.title}</h2>
            {item.excerpt ? (
              <p className="mt-3 text-sm text-slate-300">{item.excerpt}</p>
            ) : (
              <AnnouncementHtml html={item.content} className="managed-page-content mt-3 text-sm text-slate-300" />
            )}
            <div className="mt-5 text-accent">
              <AnnouncementButton href={item.buttonUrl}>{item.buttonText || 'Ansehen'}</AnnouncementButton>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export function HomeAnnouncementMarquee() {
  const items = getPublicAnnouncements({ placement: 'homepage_marquee', authenticated: false }).slice(0, 8)
  if (items.length === 0) return null
  const text = items.map((item) => item.title).join('   •   ')

  return (
    <section className="overflow-hidden border-y border-white/10 bg-accent py-3 text-slate-950" aria-label="Laufende Mitteilungen">
      <div className="homepage-announcement-marquee flex min-w-full items-center gap-6 whitespace-nowrap text-sm font-black uppercase tracking-widest">
        <span className="inline-flex items-center gap-3 px-6">
          <Megaphone className="h-4 w-4" />
          {text}
        </span>
        <span className="inline-flex items-center gap-3 px-6" aria-hidden="true">
          <Megaphone className="h-4 w-4" />
          {text}
        </span>
      </div>
    </section>
  )
}
