'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Eye, EyeOff, Loader2, LockKeyhole, ShieldCheck } from 'lucide-react'
import { BrandLogo } from '@/components/navigation/BrandLogo'
import type { AdminLoginSliderSettings, AdminLoginSlide } from '@/lib/admin-login-slider-store'

const fallbackSlider: AdminLoginSliderSettings = {
  enabled: true,
  autoplay: true,
  intervalMs: 6500,
  overlayColor: '#020617',
  overlayOpacity: 0.66,
  updatedAt: '',
  slides: [
    {
      id: 'fallback',
      title: 'MK-eMotors Dornach',
      subtitle: 'Sichere Verwaltung für Ihr E-Mobility-Geschäft',
      desktopImage: '/hero-background.png',
      mobileImage: '/hero-background.png',
      alt: 'MK-eMotors Dornach',
      sortOrder: 1,
      active: true,
      overlayOpacity: 0.68,
      startsAt: '',
      endsAt: '',
    },
  ],
}

export default function AdminLoginPage() {
  const [email, setEmail] = useState('admin@mk-emotors.ch')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [slider, setSlider] = useState<AdminLoginSliderSettings>(fallbackSlider)
  const [current, setCurrent] = useState(0)
  const [imageReady, setImageReady] = useState(false)
  const [touchStart, setTouchStart] = useState<number | null>(null)

  const slides = useMemo(() => activeSlides(slider), [slider])
  const slide = slides[current] || slides[0]

  useEffect(() => {
    fetch('/api/admin/login-slider')
      .then((response) => response.ok ? response.json() : null)
      .then((data) => setSlider(isValidSliderSettings(data) ? data : fallbackSlider))
      .catch(() => setSlider(fallbackSlider))
  }, [])

  useEffect(() => {
    if (!slider.autoplay || slides.length <= 1) return
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) return
    const timer = window.setInterval(() => {
      setCurrent((value) => (value + 1) % slides.length)
      setImageReady(false)
    }, slider.intervalMs)
    return () => window.clearInterval(timer)
  }, [slider.autoplay, slider.intervalMs, slides.length])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') next()
      if (event.key === 'ArrowLeft') previous()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const next = () => {
    setCurrent((value) => (value + 1) % slides.length)
    setImageReady(false)
  }

  const previous = () => {
    setCurrent((value) => (value - 1 + slides.length) % slides.length)
    setImageReady(false)
  }

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, rememberMe }),
        credentials: 'include',
      })

      const data = await response.json()
      if (!response.ok) {
        setError(data.error || 'Anmeldung fehlgeschlagen.')
        setLoading(false)
        return
      }

      setSuccess(true)
      window.setTimeout(() => {
        window.location.href = '/admin/dashboard'
      }, 450)
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Anmeldung fehlgeschlagen.')
      setLoading(false)
    }
  }

  return (
    <main
      className="relative min-h-screen overflow-hidden bg-slate-950 text-white"
      onTouchStart={(event) => setTouchStart(event.touches[0]?.clientX ?? null)}
      onTouchEnd={(event) => {
        if (touchStart == null) return
        const delta = touchStart - (event.changedTouches[0]?.clientX ?? touchStart)
        if (Math.abs(delta) > 48) delta > 0 ? next() : previous()
        setTouchStart(null)
      }}
    >
      <div className="absolute inset-0 bg-slate-950">
        {!imageReady && <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950" />}
        <picture>
          <source media="(max-width: 640px)" srcSet={slide.mobileImage || slide.desktopImage} />
          <img
            key={slide.id}
            src={slide.desktopImage}
            alt={slide.alt}
            className={`h-full w-full object-cover transition-opacity duration-700 ${imageReady ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImageReady(true)}
            onError={() => setImageReady(true)}
            fetchPriority="high"
          />
        </picture>
      </div>
      <div className="absolute inset-0" style={{ backgroundColor: slider.overlayColor, opacity: slide.overlayOpacity ?? slider.overlayOpacity }} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(34,197,94,.22),transparent_32rem),linear-gradient(90deg,rgba(2,6,23,.88),rgba(2,6,23,.52),rgba(2,6,23,.86))]" />

      <div className="relative z-10 grid min-h-screen grid-cols-1 items-center gap-8 px-4 py-8 lg:grid-cols-[1fr_460px] lg:px-12">
        <section className="hidden max-w-3xl lg:block">
          <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-5 text-sm font-black uppercase tracking-[0.38em] text-accent">
            E-Mobility aus Dornach
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="text-6xl font-black leading-[0.95] tracking-tight text-white">
            {slide.title || 'MK-eMotors Dornach'}
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }} className="mt-6 max-w-2xl text-xl leading-8 text-white/72">
            {slide.subtitle || 'Verwalten Sie Produkte, Bestellungen, Kunden, Rechnungen und Einstellungen sicher an einem Ort.'}
          </motion.p>
        </section>

        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mx-auto w-full max-w-md rounded-2xl border border-white/12 bg-slate-950/70 p-6 shadow-2xl shadow-black/45 backdrop-blur-xl sm:p-8"
        >
          <div className="mb-8 text-center">
            <div className="mb-5 flex justify-center">
              <BrandLogo scrolled slogan />
            </div>
            <h2 className="text-2xl font-black">Administrator-Anmeldung</h2>
            <p className="mt-2 text-sm text-slate-400">Willkommen im MK-eMotors Dornach Adminbereich</p>
          </div>

          {error && <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div>}
          {success && <div className="mb-4 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">Login erfolgreich. Weiterleitung...</div>}

          <form onSubmit={handleLogin} className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-200">E-Mail-Adresse</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="h-12 w-full rounded-xl border border-white/10 bg-white/8 px-4 text-white outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
                autoComplete="username"
                disabled={loading}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-200">Passwort</span>
              <span className="flex h-12 overflow-hidden rounded-xl border border-white/10 bg-white/8 transition focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="min-w-0 flex-1 bg-transparent px-4 text-white outline-none"
                  placeholder="Ihr Passwort"
                  autoComplete="current-password"
                  disabled={loading}
                />
                <button type="button" onClick={() => setShowPassword((value) => !value)} className="px-4 text-slate-300 hover:text-white" aria-label="Passwort anzeigen oder verbergen">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </span>
            </label>

            <div className="flex items-center justify-between gap-3 text-sm">
              <label className="flex items-center gap-2 text-slate-300">
                <input type="checkbox" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} className="h-4 w-4 accent-accent" />
                Angemeldet bleiben
              </label>
              <Link href="/admin/login" className="text-slate-400 hover:text-accent">Passwort vergessen</Link>
            </div>

            <button type="submit" disabled={loading || success} className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-accent px-5 font-black text-accent-foreground transition hover:brightness-110 disabled:opacity-60">
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <LockKeyhole className="h-5 w-5" />}
              {loading ? 'Wird angemeldet...' : 'Anmelden'}
            </button>
          </form>

          <div className="mt-6 flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.05] p-4 text-xs leading-5 text-slate-300">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
            Sichere Verwaltung für Produkte, Bestellungen, Kunden, Rechnungen und Einstellungen.
          </div>

          <Link href="/" className="mt-6 block text-center text-sm text-slate-400 hover:text-white">
            Zurück zur Website
          </Link>
        </motion.section>
      </div>

      {slides.length > 1 && (
        <>
          <button onClick={previous} className="absolute left-5 top-1/2 z-20 hidden -translate-y-1/2 rounded-full border border-white/15 bg-black/35 p-3 text-white backdrop-blur hover:bg-black/55 md:block" aria-label="Vorheriges Bild">
            <ChevronLeft size={22} />
          </button>
          <button onClick={next} className="absolute right-5 top-1/2 z-20 hidden -translate-y-1/2 rounded-full border border-white/15 bg-black/35 p-3 text-white backdrop-blur hover:bg-black/55 md:block" aria-label="Nächstes Bild">
            <ChevronRight size={22} />
          </button>
          <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 gap-2">
            {slides.map((item, index) => (
              <button key={item.id} onClick={() => { setCurrent(index); setImageReady(false) }} className={`h-2 rounded-full transition-all ${current === index ? 'w-8 bg-accent' : 'w-2 bg-white/45'}`} aria-label={`Slide ${index + 1}`} />
            ))}
          </div>
        </>
      )}
    </main>
  )
}

function activeSlides(settings: AdminLoginSliderSettings) {
  const now = Date.now()
  const source = Array.isArray(settings?.slides) ? settings.slides : fallbackSlider.slides
  const slides = source
    .filter((slide: AdminLoginSlide) => {
      if (!slide.active) return false
      if (slide.startsAt && new Date(slide.startsAt).getTime() > now) return false
      if (slide.endsAt && new Date(slide.endsAt).getTime() < now) return false
      return Boolean(slide.desktopImage || slide.mobileImage)
    })
    .sort((a, b) => a.sortOrder - b.sortOrder)
  return slides.length > 0 ? slides : fallbackSlider.slides
}

function isValidSliderSettings(value: unknown): value is AdminLoginSliderSettings {
  if (!value || typeof value !== 'object') return false
  const settings = value as Partial<AdminLoginSliderSettings>
  return Array.isArray(settings.slides)
}
