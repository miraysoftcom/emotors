'use client'

import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import Link from 'next/link'
import { Gift, Sparkles, X } from 'lucide-react'

type Campaign = {
  id: string
  name: string
  placements: string[]
  theme: string
  animation: string
  buttonUrl: string
  couponCode?: string
  discountPercent?: number
  countdown: boolean
  dismissMode: 'session' | 'daily' | 'campaign' | 'never'
  trigger: { delaySeconds: number }
  media: { desktopImage?: string; videoUrl?: string; posterUrl?: string }
  colors: { background: string; foreground: string; accent: string; glow: string }
  translations: Record<string, { title: string; subtitle: string; description: string; buttonText: string; secondaryButtonText?: string }>
  endsAt: string
}

export function GlobalSpecialDayCampaignPopup() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    fetch(`/api/campaigns?placement=cinematic_popup&pagePath=${encodeURIComponent(window.location.pathname)}`)
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        const next = ((data?.campaigns || []) as Campaign[]).filter((campaign) => !isDismissed(campaign))
        setCampaigns(next)
        if (next[0]) {
          window.setTimeout(() => {
            setVisible(true)
            record(next[0].id, 'impressions')
          }, Math.max(0, next[0].trigger?.delaySeconds || 0) * 1000)
        }
      })
      .catch(() => undefined)
  }, [])

  useEffect(() => {
    if (!visible) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close()
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [visible])

  const campaign = campaigns[0]
  if (!campaign || !visible) return null

  const t = campaign.translations.de

  function close() {
    if (!campaign) return
    dismiss(campaign)
    record(campaign.id, 'closes')
    setCampaigns((current) => current.slice(1))
    setVisible(false)
  }

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/70 px-4 py-8 backdrop-blur-md" role="dialog" aria-modal="true" aria-label={t.title}>
      <div className={`relative w-full max-w-3xl overflow-hidden rounded-3xl border border-white/15 shadow-2xl ${animationClass(campaign.animation)}`} style={{ background: campaign.colors.background, color: campaign.colors.foreground }}>
        {campaign.media.videoUrl ? (
          <video src={campaign.media.videoUrl} poster={campaign.media.posterUrl} autoPlay muted loop playsInline className="absolute inset-0 h-full w-full object-cover opacity-45" />
        ) : campaign.media.desktopImage ? (
          <img src={campaign.media.desktopImage} alt="" className="absolute inset-0 h-full w-full object-cover opacity-45" />
        ) : null}
        <div className="pointer-events-none absolute inset-0" style={{ background: `radial-gradient(circle at 20% 0%, ${campaign.colors.glow}, transparent 32%), radial-gradient(circle at 80% 10%, ${campaign.colors.accent}, transparent 28%)` }} />
        {effectLayer(campaign.theme)}
        <button onClick={close} className="absolute right-4 top-4 z-10 rounded-full border border-white/20 bg-black/20 p-2 text-white backdrop-blur hover:bg-white/10" aria-label="Kampagne schließen">
          <X className="h-5 w-5" />
        </button>
        <div className="relative grid gap-7 p-8 text-center md:p-12">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl shadow-2xl" style={{ background: campaign.colors.accent, color: campaign.colors.background }}>
            <Sparkles className="h-8 w-8" />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.35em] opacity-75">{campaign.name}</p>
            <h2 className="mt-4 text-4xl font-black md:text-6xl">{t.title}</h2>
            <p className="mt-3 text-xl font-bold opacity-85">{t.subtitle}</p>
            <p className="mx-auto mt-4 max-w-xl leading-7 opacity-80">{t.description}</p>
          </div>
          {campaign.countdown && <Countdown endsAt={campaign.endsAt} accent={campaign.colors.accent} background={campaign.colors.background} />}
          {campaign.couponCode && <div className="mx-auto rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-black uppercase tracking-widest">Code: {campaign.couponCode}</div>}
          <div className="flex flex-wrap justify-center gap-3">
            <Link href={campaign.buttonUrl || '/produkte'} onClick={() => record(campaign.id, 'clicks')} className="rounded-full px-6 py-3 text-sm font-black uppercase tracking-widest" style={{ background: campaign.colors.accent, color: campaign.colors.background }}>
              {t.buttonText || 'Jetzt entdecken'}
            </Link>
            <button onClick={close} className="rounded-full border border-white/25 px-6 py-3 text-sm font-black uppercase tracking-widest hover:bg-white/10">
              {t.secondaryButtonText || 'Später'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function SpecialDayHomepageBanner({ placement = 'hero_banner' }: { placement?: string }) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])

  useEffect(() => {
    fetch(`/api/campaigns?placement=${placement}&pagePath=${encodeURIComponent(window.location.pathname)}`)
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        setCampaigns(data?.campaigns || [])
        if (data?.campaigns?.[0]) record(data.campaigns[0].id, 'impressions')
      })
      .catch(() => undefined)
  }, [placement])

  const campaign = campaigns[0]
  if (!campaign) return null
  const t = campaign.translations.de

  return (
    <section className="px-4 py-5 md:px-8">
      <Link href={campaign.buttonUrl || '/produkte'} onClick={() => record(campaign.id, 'clicks')} className="mx-auto block max-w-7xl overflow-hidden rounded-3xl border border-white/10 p-5 shadow-2xl transition hover:scale-[1.01]" style={{ background: campaign.colors.background, color: campaign.colors.foreground }}>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <span className="grid h-14 w-14 place-items-center rounded-2xl" style={{ background: campaign.colors.accent, color: campaign.colors.background }}><Gift /></span>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.25em] opacity-75">{campaign.name}</p>
              <h2 className="text-2xl font-black">{t.title}</h2>
              <p className="text-sm opacity-75">{t.subtitle}</p>
            </div>
          </div>
          {campaign.countdown && <Countdown compact endsAt={campaign.endsAt} accent={campaign.colors.accent} background={campaign.colors.background} />}
        </div>
      </Link>
    </section>
  )
}

function Countdown({ endsAt, accent, background, compact = false }: { endsAt: string; accent: string; background: string; compact?: boolean }) {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [])
  const remaining = Math.max(0, new Date(endsAt).getTime() - now)
  const days = Math.floor(remaining / 86400000)
  const hours = Math.floor((remaining % 86400000) / 3600000)
  const minutes = Math.floor((remaining % 3600000) / 60000)
  const seconds = Math.floor((remaining % 60000) / 1000)
  const values = [['Tage', days], ['Std', hours], ['Min', minutes], ['Sek', seconds]]
  return (
    <div className={`grid grid-cols-4 gap-2 ${compact ? 'min-w-[16rem]' : 'mx-auto max-w-md'}`}>
      {values.map(([label, value]) => (
        <div key={label} className="rounded-2xl px-3 py-2 text-center font-black" style={{ background: accent, color: background }}>
          <div className={compact ? 'text-lg' : 'text-3xl'}>{String(value).padStart(2, '0')}</div>
          <div className="text-[10px] uppercase tracking-widest">{label}</div>
        </div>
      ))}
    </div>
  )
}

function animationClass(animation: string) {
  if (animation.includes('zoom')) return 'animate-[campaignZoom_.45s_ease-out]'
  if (animation.includes('slide')) return 'animate-[campaignSlide_.45s_ease-out]'
  return 'animate-[campaignFade_.45s_ease-out]'
}

export function CampaignSnowLayer({ soft = false }: { soft?: boolean }) {
  const frontSnow = {
    backgroundImage: [
      'radial-gradient(circle, rgba(255,255,255,0.96) 0 1.3px, transparent 1.6px)',
      'radial-gradient(circle, rgba(255,255,255,0.76) 0 1px, transparent 1.3px)',
      'radial-gradient(circle, rgba(255,255,255,0.54) 0 1.7px, transparent 2px)',
    ].join(', '),
    backgroundPosition: '0 0, 30px 44px, 78px 18px',
    backgroundSize: '58px 58px, 94px 94px, 136px 136px',
  }

  const backSnow = {
    backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.82) 0 1px, transparent 1.25px)',
    backgroundPosition: '18px 0',
    backgroundSize: '42px 42px',
  }

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className={`absolute inset-x-0 -top-1/2 h-[160%] ${soft ? 'opacity-45' : 'opacity-70'} animate-[campaignSnowFall_15s_linear_infinite]`} style={frontSnow} />
      <div className={`absolute inset-x-0 -top-1/2 h-[160%] ${soft ? 'opacity-25' : 'opacity-40'} animate-[campaignSnowFallSlow_24s_linear_infinite]`} style={backSnow} />
    </div>
  )
}

export function CampaignFireworksLayer({ soft = false, swissFlags = false }: { soft?: boolean; swissFlags?: boolean }) {
  const bursts = [
    { left: '17%', top: '20%', color: '#fbbf24', glow: '#f59e0b', delay: '0s', size: soft ? 86 : 148 },
    { left: '78%', top: '22%', color: '#fde68a', glow: '#fbbf24', delay: '.72s', size: soft ? 76 : 132 },
    { left: '54%', top: '13%', color: '#fb7185', glow: '#f43f5e', delay: '1.36s', size: soft ? 68 : 116 },
    { left: '31%', top: '48%', color: '#60a5fa', glow: '#38bdf8', delay: '2.08s', size: soft ? 62 : 108 },
    { left: '86%', top: '52%', color: '#f97316', glow: '#fb923c', delay: '2.78s', size: soft ? 66 : 116 },
  ]
  const rockets = [
    { left: '22%', delay: '.1s', height: soft ? 120 : 210, travel: soft ? -115 : -205 },
    { left: '57%', delay: '1.2s', height: soft ? 96 : 180, travel: soft ? -92 : -170 },
    { left: '82%', delay: '2.1s', height: soft ? 106 : 195, travel: soft ? -100 : -186 },
  ]

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 opacity-25 [background-image:radial-gradient(circle,rgba(251,191,36,.85)_1px,transparent_1px)] [background-size:42px_42px] animate-[campaignDrift_18s_linear_infinite]" />
      {rockets.map((rocket, index) => (
        <span
          key={`${rocket.left}-${index}`}
          className="absolute bottom-0 w-[2px] origin-bottom opacity-0 animate-[campaignRocketLaunch_3.2s_ease-out_infinite]"
          style={{
            left: rocket.left,
            height: rocket.height,
            animationDelay: rocket.delay,
            '--rocket-travel': `${rocket.travel}px`,
            background: 'linear-gradient(to top, transparent, rgba(253,230,138,.95), rgba(255,255,255,.95), transparent)',
            boxShadow: '0 0 18px rgba(251,191,36,.9), 0 0 32px rgba(251,113,133,.35)',
          } as CSSProperties}
        />
      ))}
      {bursts.map((burst, index) => (
        <span
          key={`${burst.left}-${burst.top}-${index}`}
          className="absolute rounded-full opacity-0 mix-blend-screen animate-[campaignFireworkBurst_3.2s_ease-out_infinite]"
          style={{
            left: burst.left,
            top: burst.top,
            width: burst.size,
            height: burst.size,
            marginLeft: -burst.size / 2,
            marginTop: -burst.size / 2,
            animationDelay: burst.delay,
            background: [
              `repeating-conic-gradient(from 0deg, transparent 0deg 12deg, ${burst.color} 13deg 15deg, transparent 16deg 30deg)`,
              `radial-gradient(circle, transparent 0 26%, ${burst.color} 27% 29%, transparent 30% 100%)`,
              `radial-gradient(circle, ${burst.color} 0 2px, transparent 2.8px)`,
            ].join(', '),
            maskImage: 'radial-gradient(circle, transparent 0 18%, #000 19% 62%, transparent 63% 100%)',
            WebkitMaskImage: 'radial-gradient(circle, transparent 0 18%, #000 19% 62%, transparent 63% 100%)',
            boxShadow: `0 0 ${soft ? 24 : 44}px ${burst.glow}`,
          }}
        >
          <i className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_18px_rgba(255,255,255,.95)]" />
          <i className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 rounded-full" style={{ background: burst.color, boxShadow: `0 ${burst.size * .26}px 0 ${burst.color}, ${burst.size * .22}px ${burst.size * .13}px 0 ${burst.glow}, ${-burst.size * .22}px ${burst.size * .13}px 0 ${burst.glow}, ${burst.size * .18}px ${-burst.size * .2}px 0 ${burst.color}, ${-burst.size * .18}px ${-burst.size * .2}px 0 ${burst.color}` }} />
        </span>
      ))}
      {swissFlags && bursts.slice(0, 4).map((burst, index) => (
        <span
          key={`swiss-flag-burst-${burst.left}-${index}`}
          className="absolute opacity-0 animate-[campaignSwissFlagPop_3.2s_ease-out_infinite]"
          style={{
            left: burst.left,
            top: burst.top,
            width: burst.size,
            height: burst.size,
            marginLeft: -burst.size / 2,
            marginTop: -burst.size / 2,
            animationDelay: burst.delay,
          }}
        >
          {[0, 1, 2, 3].map((flag) => {
            const positions = [
              { left: '50%', top: '8%', rotate: '-12deg' },
              { left: '82%', top: '42%', rotate: '18deg' },
              { left: '46%', top: '82%', rotate: '10deg' },
              { left: '12%', top: '45%', rotate: '-18deg' },
            ]
            const position = positions[flag]
            return (
              <i
                key={flag}
                className="absolute block rounded-sm bg-[#e30613] shadow-[0_0_14px_rgba(255,255,255,.55)]"
                style={{
                  left: position.left,
                  top: position.top,
                  width: soft ? 14 : 20,
                  height: soft ? 11 : 15,
                  rotate: position.rotate,
                }}
              >
                <b className="absolute left-1/2 top-1/2 z-[1] h-[62%] w-[20%] -translate-x-1/2 -translate-y-1/2 bg-[#ffffff]" />
                <b className="absolute left-1/2 top-1/2 z-[1] h-[20%] w-[62%] -translate-x-1/2 -translate-y-1/2 bg-[#ffffff]" />
              </i>
            )
          })}
          {[0, 1, 2].map((heart) => {
            const positions = [
              { left: '67%', top: '18%', rotate: '12deg' },
              { left: '28%', top: '24%', rotate: '-10deg' },
              { left: '66%', top: '74%', rotate: '18deg' },
            ]
            const position = positions[heart]
            return (
              <i
                key={`heart-${heart}`}
                className="absolute block"
                style={{
                  left: position.left,
                  top: position.top,
                  width: soft ? 14 : 20,
                  height: soft ? 14 : 20,
                  rotate: position.rotate,
                  filter: 'drop-shadow(0 0 10px rgba(239,68,68,.9))',
                }}
              >
                <b className="absolute left-1/2 top-1/2 h-[70%] w-[70%] -translate-x-1/2 -translate-y-1/2 rotate-45 bg-[#ef4444]" />
                <b className="absolute left-[18%] top-[15%] h-[52%] w-[52%] rounded-full bg-[#ef4444]" />
                <b className="absolute left-[50%] top-[15%] h-[52%] w-[52%] rounded-full bg-[#ef4444]" />
              </i>
            )
          })}
        </span>
      ))}
    </div>
  )
}

export function CampaignEasterLayer({ soft = false }: { soft?: boolean }) {
  const eggs = [
    { left: '14%', bottom: '9%', color: '#f9a8d4', stripe: '#fde68a', delay: '0s', size: soft ? 34 : 52 },
    { left: '77%', bottom: '13%', color: '#93c5fd', stripe: '#bbf7d0', delay: '.7s', size: soft ? 30 : 46 },
    { left: '88%', bottom: '8%', color: '#fde68a', stripe: '#fca5a5', delay: '1.25s', size: soft ? 27 : 42 },
    { left: '23%', bottom: '20%', color: '#bbf7d0', stripe: '#c4b5fd', delay: '1.8s', size: soft ? 25 : 38 },
  ]
  const bunnySize = soft ? 94 : 148

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0 opacity-55"
        style={{
          background: [
            'radial-gradient(circle at 16% 22%, rgba(255,255,255,.55), transparent 16%)',
            'radial-gradient(circle at 84% 12%, rgba(253,224,71,.28), transparent 18%)',
            'linear-gradient(to top, rgba(187,247,208,.24), transparent 35%)',
          ].join(', '),
        }}
      />
      <div className="absolute bottom-0 left-0 right-0 h-20 opacity-55" style={{ background: 'linear-gradient(to top, rgba(74,222,128,.28), transparent)' }} />
      {eggs.map((egg, index) => (
        <span
          key={`${egg.left}-${index}`}
          className="absolute rounded-[50%_50%_44%_44%] shadow-2xl animate-[campaignEggFloat_4.2s_ease-in-out_infinite]"
          style={{
            left: egg.left,
            bottom: egg.bottom,
            width: egg.size,
            height: egg.size * 1.32,
            animationDelay: egg.delay,
            background: [
              `linear-gradient(145deg, rgba(255,255,255,.68), transparent 30%)`,
              `repeating-linear-gradient(165deg, transparent 0 10px, ${egg.stripe} 11px 15px, transparent 16px 25px)`,
              `radial-gradient(circle at 34% 24%, rgba(255,255,255,.72), transparent 18%)`,
              `linear-gradient(150deg, ${egg.color}, rgba(255,255,255,.78))`,
            ].join(', '),
            boxShadow: '0 16px 34px rgba(0,0,0,.22), inset -8px -10px 18px rgba(0,0,0,.12), inset 7px 8px 15px rgba(255,255,255,.42)',
          }}
        />
      ))}
      <div
        className="absolute bottom-5 animate-[campaignBunnyHop_5s_ease-in-out_infinite]"
        style={{
          right: soft ? '6%' : '9%',
          width: bunnySize,
          height: bunnySize * .9,
          filter: 'drop-shadow(0 18px 24px rgba(0,0,0,.26))',
        }}
      >
        <span
          className="absolute left-[18%] top-[28%] h-[62%] w-[68%] rounded-[55%_48%_50%_46%]"
          style={{
            background: 'radial-gradient(circle at 32% 20%, #ffffff, #f3efe7 42%, #d6cec1 100%)',
            boxShadow: 'inset -14px -13px 20px rgba(104,88,73,.24), inset 10px 9px 18px rgba(255,255,255,.72)',
          }}
        />
        <span className="absolute left-[5%] top-[42%] h-[24%] w-[24%] rounded-full bg-white shadow-[inset_-5px_-5px_10px_rgba(104,88,73,.2)]" />
        <span
          className="absolute left-[56%] top-[12%] h-[42%] w-[36%] rounded-full"
          style={{
            background: 'radial-gradient(circle at 35% 26%, #ffffff, #efe9dd 58%, #d1c6b8 100%)',
            boxShadow: 'inset -9px -8px 16px rgba(104,88,73,.22)',
          }}
        />
        <span
          className="absolute left-[64%] top-[-31%] h-[55%] w-[15%] origin-bottom rotate-[-11deg] rounded-full animate-[campaignBunnyEar_3.4s_ease-in-out_infinite]"
          style={{
            background: 'linear-gradient(90deg, #f8f2e8, #ffffff 52%, #d8cfc2)',
            boxShadow: 'inset 3px 0 0 rgba(251,207,232,.7)',
          }}
        />
        <span
          className="absolute left-[78%] top-[-27%] h-[50%] w-[14%] origin-bottom rotate-[13deg] rounded-full animate-[campaignBunnyEar_3.8s_ease-in-out_infinite]"
          style={{
            background: 'linear-gradient(90deg, #f6eee2, #ffffff 54%, #d6cbbd)',
            boxShadow: 'inset 3px 0 0 rgba(251,207,232,.62)',
          }}
        />
        <span className="absolute left-[82%] top-[31%] h-[5%] w-[5%] rounded-full bg-[#211815]" />
        <span className="absolute left-[92%] top-[46%] h-[3%] w-[6%] rounded-full bg-[#e9a7b2]" />
        <span className="absolute left-[55%] top-[78%] h-[13%] w-[28%] rounded-full bg-[#d8cfc2] opacity-80" />
      </div>
    </div>
  )
}

export function CampaignSchoolLayer({ soft = false }: { soft?: boolean }) {
  const cards = [
    { left: '9%', top: '18%', rotate: '-10deg', delay: '0s', color: '#facc15', label: 'ABC' },
    { left: '78%', top: '16%', rotate: '9deg', delay: '.8s', color: '#38bdf8', label: '123' },
    { left: '14%', bottom: '14%', rotate: '7deg', delay: '1.35s', color: '#86efac', label: 'A+' },
  ]
  const size = soft ? 42 : 62

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0 opacity-35"
        style={{
          backgroundImage: [
            'linear-gradient(rgba(255,255,255,.18) 1px, transparent 1px)',
            'linear-gradient(90deg, rgba(255,255,255,.14) 1px, transparent 1px)',
            'radial-gradient(circle at 82% 24%, rgba(250,204,21,.32), transparent 18%)',
            'radial-gradient(circle at 15% 78%, rgba(56,189,248,.28), transparent 16%)',
          ].join(', '),
          backgroundSize: '30px 30px, 30px 30px, 100% 100%, 100% 100%',
        }}
      />
      {cards.map((card, index) => (
        <span
          key={`${card.label}-${index}`}
          className="absolute grid place-items-center rounded-xl border border-white/40 bg-white/90 font-black text-slate-900 shadow-2xl animate-[campaignSchoolFloat_5s_ease-in-out_infinite]"
          style={{
            left: card.left,
            top: card.top,
            bottom: card.bottom,
            width: size,
            height: size * .78,
            rotate: card.rotate,
            animationDelay: card.delay,
            boxShadow: `0 14px 30px rgba(0,0,0,.18), inset 0 -5px 12px ${card.color}66`,
          }}
        >
          <span className={soft ? 'text-xs' : 'text-sm'}>{card.label}</span>
        </span>
      ))}
      <span
        className="absolute right-[12%] bottom-[12%] rounded-md shadow-2xl animate-[campaignPencilSlide_5.4s_ease-in-out_infinite]"
        style={{
          width: soft ? 88 : 136,
          height: soft ? 12 : 18,
          rotate: '-24deg',
          background: 'linear-gradient(90deg, #f59e0b 0 72%, #fef3c7 72% 82%, #111827 82% 88%, #fca5a5 88% 100%)',
          boxShadow: '0 12px 24px rgba(0,0,0,.22), inset 0 3px 5px rgba(255,255,255,.35)',
        }}
      />
      <span
        className="absolute left-[42%] bottom-[7%] rounded-lg border border-white/35 bg-white/75 shadow-2xl animate-[campaignSchoolFloat_6s_ease-in-out_infinite]"
        style={{
          width: soft ? 96 : 150,
          height: soft ? 18 : 26,
          rotate: '8deg',
          backgroundImage: 'repeating-linear-gradient(90deg, transparent 0 12px, rgba(15,23,42,.45) 13px 14px)',
        }}
      />
      <span
        className="absolute left-[58%] top-[39%] rounded-[1.2rem_1.2rem_.6rem_.6rem] bg-[#2563eb] shadow-2xl animate-[campaignBackpackBob_5.8s_ease-in-out_infinite]"
        style={{
          width: soft ? 44 : 68,
          height: soft ? 54 : 84,
          boxShadow: '0 18px 34px rgba(0,0,0,.23), inset -8px -10px 16px rgba(0,0,0,.18), inset 8px 8px 16px rgba(255,255,255,.18)',
        }}
      >
        <i className="absolute left-1/2 top-[18%] h-[20%] w-[52%] -translate-x-1/2 rounded-full border-2 border-white/50 border-b-0" />
        <i className="absolute bottom-[16%] left-1/2 h-[22%] w-[58%] -translate-x-1/2 rounded-lg bg-white/20" />
      </span>
    </div>
  )
}

export function CampaignSwissLayer({ soft = false }: { soft?: boolean }) {
  const mountainHeight = soft ? 92 : 150

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0 opacity-70"
        style={{
          background: [
            'radial-gradient(circle at 18% 16%, rgba(255,255,255,.55), transparent 13%)',
            'radial-gradient(circle at 80% 18%, rgba(255,255,255,.38), transparent 14%)',
            'linear-gradient(to bottom, rgba(176,0,32,.2), transparent 42%)',
          ].join(', '),
        }}
      />
      <div className="absolute left-4 top-4 z-[2] rounded-2xl border border-white/35 bg-[#e30613] shadow-2xl animate-[campaignSwissFlagWave_4.8s_ease-in-out_infinite]" style={{ width: soft ? 58 : 92, height: soft ? 44 : 68 }}>
        <span className="absolute left-1/2 top-1/2 z-[1] h-[58%] w-[18%] -translate-x-1/2 -translate-y-1/2 bg-[#ffffff]" />
        <span className="absolute left-1/2 top-1/2 z-[1] h-[18%] w-[58%] -translate-x-1/2 -translate-y-1/2 bg-[#ffffff]" />
      </div>
      <div
        className="absolute left-1/2 top-[9%] grid -translate-x-1/2 place-items-center rounded-full border border-white/45 bg-white/15 shadow-2xl backdrop-blur-md animate-[campaignSwissFlagWave_5.4s_ease-in-out_infinite]"
        style={{
          width: soft ? 64 : 96,
          height: soft ? 64 : 96,
          boxShadow: '0 18px 38px rgba(0,0,0,.32), 0 0 34px rgba(255,255,255,.24)',
        }}
      >
        <span className="relative block rounded-lg bg-[#e30613] shadow-[inset_0_0_18px_rgba(0,0,0,.18)]" style={{ width: soft ? 42 : 64, height: soft ? 42 : 64 }}>
          <i className="absolute left-1/2 top-1/2 h-[62%] w-[20%] -translate-x-1/2 -translate-y-1/2 bg-white" />
          <i className="absolute left-1/2 top-1/2 h-[20%] w-[62%] -translate-x-1/2 -translate-y-1/2 bg-white" />
        </span>
      </div>
      <div className="absolute right-[8%] top-[14%] text-right font-black leading-none text-white/90 drop-shadow-[0_8px_16px_rgba(0,0,0,.45)] animate-[campaignSchoolFloat_5.6s_ease-in-out_infinite]">
        <div className={soft ? 'text-[10px] tracking-[0.22em]' : 'text-xs tracking-[0.32em]'}>BUNDESFEIER</div>
        <div className={soft ? 'text-3xl' : 'text-5xl'}>1291</div>
      </div>
      <div className="absolute inset-x-0 bottom-0 opacity-95" style={{ height: mountainHeight }}>
        <div
          className="absolute inset-x-0 bottom-0 h-full animate-[campaignAlpsGlow_6s_ease-in-out_infinite]"
          style={{
            clipPath: 'polygon(0 100%, 0 72%, 9% 58%, 16% 72%, 26% 34%, 37% 70%, 48% 20%, 62% 75%, 74% 42%, 86% 76%, 100% 54%, 100% 100%)',
            background: 'linear-gradient(to top, #1f2937, #475569 48%, #e5e7eb 100%)',
            boxShadow: 'inset 0 22px 28px rgba(255,255,255,.18)',
          }}
        />
        <div
          className="absolute inset-x-0 bottom-0 h-[72%] opacity-85"
          style={{
            clipPath: 'polygon(0 100%, 0 76%, 12% 55%, 20% 75%, 32% 47%, 43% 78%, 55% 36%, 68% 80%, 79% 54%, 90% 79%, 100% 61%, 100% 100%)',
            background: 'linear-gradient(to top, #064e3b, #166534 60%, rgba(255,255,255,.72) 100%)',
          }}
        />
      </div>
      <div className="absolute inset-x-0 bottom-0 h-12 opacity-80" style={{ background: 'linear-gradient(to top, rgba(176,0,32,.58), transparent)' }} />
      <CampaignFireworksLayer soft={soft} swissFlags />
    </div>
  )
}

function effectLayer(theme: string) {
  if (theme === 'christmas') {
    return <CampaignSnowLayer />
  }
  if (theme === 'new-year' || theme === 'silvester') {
    return <CampaignFireworksLayer />
  }
  if (theme === 'easter') {
    return <CampaignEasterLayer />
  }
  if (theme === 'school') {
    return <CampaignSchoolLayer />
  }
  if (theme === 'swiss') {
    return <CampaignSwissLayer />
  }
  if (['black-friday'].includes(theme)) {
    return <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:radial-gradient(circle,#fff_1px,transparent_1px)] [background-size:28px_28px] animate-[campaignDrift_12s_linear_infinite]" />
  }
  return null
}

function dismissKey(campaign: Campaign) {
  const today = new Date().toISOString().slice(0, 10)
  if (campaign.dismissMode === 'daily') return `campaign:${campaign.id}:${today}`
  if (campaign.dismissMode === 'campaign') return `campaign:${campaign.id}:all`
  return `campaign:${campaign.id}:session`
}

function isDismissed(campaign: Campaign) {
  if (campaign.dismissMode === 'never') return false
  const key = dismissKey(campaign)
  const store = campaign.dismissMode === 'session' ? window.sessionStorage : window.localStorage
  return store.getItem(key) === 'closed'
}

function dismiss(campaign: Campaign) {
  if (campaign.dismissMode === 'never') return
  const key = dismissKey(campaign)
  const store = campaign.dismissMode === 'session' ? window.sessionStorage : window.localStorage
  store.setItem(key, 'closed')
}

function record(id: string, type: 'impressions' | 'clicks' | 'closes') {
  fetch('/api/campaigns', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, type }),
  }).catch(() => undefined)
}
