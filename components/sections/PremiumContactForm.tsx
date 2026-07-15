'use client'

import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import ReCAPTCHA from 'react-google-recaptcha'

interface ContactFormProps {
  recaptchaSiteKey: string
}

const productInterests = [
  'E-Scooter',
  'E-Roller',
  'Kabinenroller',
  'Finanzierung',
  'Ersatzteile',
  'Service',
  'Allgemeine Anfrage',
]

export function PremiumContactForm({ recaptchaSiteKey }: ContactFormProps) {
  const [formData, setFormData] = useState({
    vorname: '',
    nachname: '',
    firma: '',
    email: '',
    telefon: '',
    plz: '',
    ort: '',
    land: 'Schweiz',
    produktinteresse: 'Allgemeine Anfrage',
    purchasedVehicle: '',
    nachricht: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [focusedField, setFocusedField] = useState<string>('')
  const recaptchaRef = useRef<ReCAPTCHA>(null)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [purchasedVehicles, setPurchasedVehicles] = useState<Array<{ label: string; orderNumber: string }>>([])
  const [vehicleLookupLoading, setVehicleLookupLoading] = useState(false)

  // Calculate form progress
  const requiredFields = ['vorname', 'nachname', 'email', 'nachricht']
  const filledRequired = requiredFields.filter((field) => formData[field as keyof typeof formData]).length
  const progress = Math.round((filledRequired / requiredFields.length) * 100)
  const isServiceRequest = ['Service', 'Ersatzteile'].includes(formData.produktinteresse)

  useEffect(() => {
    const email = formData.email.trim()
    if (!isServiceRequest || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setPurchasedVehicles([])
      return
    }

    let active = true
    const timeout = window.setTimeout(() => {
      setVehicleLookupLoading(true)
      fetch(`/api/customer-purchases?email=${encodeURIComponent(email)}`, { cache: 'no-store' })
        .then((response) => response.ok ? response.json() : { vehicles: [] })
        .then((data) => {
          if (!active) return
          setPurchasedVehicles(Array.isArray(data.vehicles) ? data.vehicles : [])
        })
        .catch(() => {
          if (active) setPurchasedVehicles([])
        })
        .finally(() => {
          if (active) setVehicleLookupLoading(false)
        })
    }, 450)

    return () => {
      active = false
      window.clearTimeout(timeout)
    }
  }, [formData.email, isServiceRequest])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.vorname.trim()) newErrors.vorname = 'Vorname erforderlich'
    if (!formData.nachname.trim()) newErrors.nachname = 'Nachname erforderlich'
    if (!formData.email.trim()) newErrors.email = 'E-Mail erforderlich'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Ungültige E-Mail'
    }
    if (!formData.nachricht.trim()) newErrors.nachricht = 'Nachricht erforderlich'
    if (!agreedToTerms) newErrors.terms = 'Zustimmung erforderlich'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)

    try {
      const token = await recaptchaRef.current?.executeAsync()

      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          recaptchaToken: token,
        }),
      })

      if (!response.ok) throw new Error('Fehler beim Senden')

      setSuccess(true)
      setFormData({
        vorname: '',
        nachname: '',
        firma: '',
        email: '',
        telefon: '',
        plz: '',
        ort: '',
        land: 'Schweiz',
        produktinteresse: 'Allgemeine Anfrage',
        purchasedVehicle: '',
        nachricht: '',
      })
      setAgreedToTerms(false)

      setTimeout(() => setSuccess(false), 5000)
    } catch {
      setErrors({ form: 'Fehler beim Senden der Nachricht' })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative"
    >
      {/* Glass Card Background */}
      <div className="absolute inset-0 bg-white/40 dark:bg-white/5 backdrop-blur-xl rounded-3xl border border-accent/35 shadow-[0_0_0_1px_rgba(34,197,94,0.08),0_24px_80px_rgba(34,197,94,0.10)]" />

      <form onSubmit={handleSubmit} className="relative p-8 md:p-12 space-y-6">
        {/* Progress Indicator */}
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-medium text-muted-foreground">Formular-Fortschritt</p>
          <p className="text-xs font-semibold text-accent">{progress}%</p>
        </div>
        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-accent to-accent/70 rounded-full"
          />
        </div>

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-green-500/10 border border-green-500/30 rounded-2xl text-green-600 dark:text-green-400 text-sm font-medium"
          >
            ✓ Nachricht erfolgreich gesendet! Wir werden Sie bald kontaktieren.
          </motion.div>
        )}

        {errors.form && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-600 dark:text-red-400 text-sm font-medium"
          >
            {errors.form}
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Vorname */}
          <div className="relative">
            <input
              type="text"
              name="vorname"
              value={formData.vorname}
              onChange={handleChange}
              onFocus={() => setFocusedField('vorname')}
              onBlur={() => setFocusedField('')}
              placeholder="Vorname"
              className={`w-full px-4 py-3 bg-white/50 dark:bg-white/5 border ${
                errors.vorname
                  ? 'border-red-500/50'
                  : 'border-accent/25 dark:border-accent/30'
              } rounded-xl focus:outline-none focus:border-accent/70 focus:ring-2 focus:ring-accent/30 transition-all placeholder-transparent`}
            />
            <label
              className={`absolute left-4 transition-all pointer-events-none ${
                focusedField === 'vorname' || formData.vorname
                  ? '-top-2 text-xs text-accent'
                  : 'top-3 text-muted-foreground'
              }`}
            >
              Vorname *
            </label>
            {errors.vorname && (
              <p className="text-red-500/80 text-xs mt-1">{errors.vorname}</p>
            )}
          </div>

          {/* Nachname */}
          <div className="relative">
            <input
              type="text"
              name="nachname"
              value={formData.nachname}
              onChange={handleChange}
              onFocus={() => setFocusedField('nachname')}
              onBlur={() => setFocusedField('')}
              placeholder="Nachname"
              className={`w-full px-4 py-3 bg-white/50 dark:bg-white/5 border ${
                errors.nachname
                  ? 'border-red-500/50'
                  : 'border-accent/25 dark:border-accent/30'
              } rounded-xl focus:outline-none focus:border-accent/70 focus:ring-2 focus:ring-accent/30 transition-all placeholder-transparent`}
            />
            <label
              className={`absolute left-4 transition-all pointer-events-none ${
                focusedField === 'nachname' || formData.nachname
                  ? '-top-2 text-xs text-accent'
                  : 'top-3 text-muted-foreground'
              }`}
            >
              Nachname *
            </label>
            {errors.nachname && (
              <p className="text-red-500/80 text-xs mt-1">{errors.nachname}</p>
            )}
          </div>
        </div>

        {/* Firma */}
        <div className="relative">
          <input
            type="text"
            name="firma"
            value={formData.firma}
            onChange={handleChange}
            onFocus={() => setFocusedField('firma')}
            onBlur={() => setFocusedField('')}
            placeholder="Firma"
            className="w-full px-4 py-3 bg-white/50 dark:bg-white/5 border border-accent/25 dark:border-accent/30 rounded-xl focus:outline-none focus:border-accent/70 focus:ring-2 focus:ring-accent/30 transition-all placeholder-transparent"
          />
          <label
            className={`absolute left-4 transition-all pointer-events-none ${
              focusedField === 'firma' || formData.firma
                ? '-top-2 text-xs text-accent'
                : 'top-3 text-muted-foreground'
            }`}
          >
            Firma
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Email */}
          <div className="relative">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField('')}
              placeholder="E-Mail"
              className={`w-full px-4 py-3 bg-white/50 dark:bg-white/5 border ${
                errors.email
                  ? 'border-red-500/50'
                  : 'border-accent/25 dark:border-accent/30'
              } rounded-xl focus:outline-none focus:border-accent/70 focus:ring-2 focus:ring-accent/30 transition-all placeholder-transparent`}
            />
            <label
              className={`absolute left-4 transition-all pointer-events-none ${
                focusedField === 'email' || formData.email
                  ? '-top-2 text-xs text-accent'
                  : 'top-3 text-muted-foreground'
              }`}
            >
              E-Mail *
            </label>
            {errors.email && (
              <p className="text-red-500/80 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          {/* Telefon */}
          <div className="relative">
            <input
              type="tel"
              name="telefon"
              value={formData.telefon}
              onChange={handleChange}
              onFocus={() => setFocusedField('telefon')}
              onBlur={() => setFocusedField('')}
              placeholder="Telefon"
              className="w-full px-4 py-3 bg-white/50 dark:bg-white/5 border border-accent/25 dark:border-accent/30 rounded-xl focus:outline-none focus:border-accent/70 focus:ring-2 focus:ring-accent/30 transition-all placeholder-transparent"
            />
            <label
              className={`absolute left-4 transition-all pointer-events-none ${
                focusedField === 'telefon' || formData.telefon
                  ? '-top-2 text-xs text-accent'
                  : 'top-3 text-muted-foreground'
              }`}
            >
              Telefon
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* PLZ */}
          <div className="relative">
            <input
              type="text"
              name="plz"
              value={formData.plz}
              onChange={handleChange}
              onFocus={() => setFocusedField('plz')}
              onBlur={() => setFocusedField('')}
              placeholder="PLZ"
              className="w-full px-4 py-3 bg-white/50 dark:bg-white/5 border border-accent/25 dark:border-accent/30 rounded-xl focus:outline-none focus:border-accent/70 focus:ring-2 focus:ring-accent/30 transition-all placeholder-transparent"
            />
            <label
              className={`absolute left-4 transition-all pointer-events-none ${
                focusedField === 'plz' || formData.plz
                  ? '-top-2 text-xs text-accent'
                  : 'top-3 text-muted-foreground'
              }`}
            >
              PLZ
            </label>
          </div>

          {/* Ort */}
          <div className="relative">
            <input
              type="text"
              name="ort"
              value={formData.ort}
              onChange={handleChange}
              onFocus={() => setFocusedField('ort')}
              onBlur={() => setFocusedField('')}
              placeholder="Ort"
              className="w-full px-4 py-3 bg-white/50 dark:bg-white/5 border border-accent/25 dark:border-accent/30 rounded-xl focus:outline-none focus:border-accent/70 focus:ring-2 focus:ring-accent/30 transition-all placeholder-transparent"
            />
            <label
              className={`absolute left-4 transition-all pointer-events-none ${
                focusedField === 'ort' || formData.ort
                  ? '-top-2 text-xs text-accent'
                  : 'top-3 text-muted-foreground'
              }`}
            >
              Ort
            </label>
          </div>

          {/* Land */}
          <div className="relative">
            <select
              name="land"
              value={formData.land}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white/50 dark:bg-white/5 border border-accent/25 dark:border-accent/30 rounded-xl focus:outline-none focus:border-accent/70 focus:ring-2 focus:ring-accent/30 transition-all"
            >
              <option>Schweiz</option>
              <option>Deutschland</option>
              <option>Österreich</option>
              <option>Frankreich</option>
              <option>Liechtenstein</option>
            </select>
          </div>
        </div>

        {/* Produktinteresse */}
        <div className="relative">
          <select
            name="produktinteresse"
            value={formData.produktinteresse}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-white/50 dark:bg-white/5 border border-accent/25 dark:border-accent/30 rounded-xl focus:outline-none focus:border-accent/70 focus:ring-2 focus:ring-accent/30 transition-all"
          >
            {productInterests.map((interest) => (
              <option key={interest} value={interest}>
                {interest}
              </option>
            ))}
          </select>
          <label className="absolute left-4 -top-2 text-xs text-accent bg-white dark:bg-background px-1">
            Produktinteresse
          </label>
        </div>

        {isServiceRequest && (
          <div className="relative rounded-2xl border border-accent/25 bg-accent/10 p-4">
            <label className="grid gap-2 text-sm font-bold text-foreground">
              Gekauftes Fahrzeug für diesen Service
              <select
                name="purchasedVehicle"
                value={formData.purchasedVehicle}
                onChange={handleChange}
                className="w-full rounded-xl border border-accent/25 bg-white/70 px-4 py-3 text-foreground transition focus:border-accent/70 focus:outline-none focus:ring-2 focus:ring-accent/30 dark:bg-white/10"
              >
                <option value="">Kein früher gekauftes Fahrzeug auswählen</option>
                {purchasedVehicles.map((vehicle) => (
                  <option key={`${vehicle.orderNumber}-${vehicle.label}`} value={`${vehicle.label} (${vehicle.orderNumber})`}>
                    {vehicle.label} · {vehicle.orderNumber}
                  </option>
                ))}
              </select>
            </label>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              {vehicleLookupLoading
                ? 'Gekaufte Fahrzeuge werden gesucht...'
                : purchasedVehicles.length > 0
                  ? 'Wir übernehmen Modell und Bestellnummer direkt in Ihre Serviceanfrage.'
                  : 'Nach Eingabe Ihrer Kauf-E-Mail erscheinen passende E-Scooter oder E-Motors hier.'}
            </p>
          </div>
        )}

        {/* Nachricht */}
        <div className="relative">
          <textarea
            name="nachricht"
            value={formData.nachricht}
            onChange={handleChange}
            onFocus={() => setFocusedField('nachricht')}
            onBlur={() => setFocusedField('')}
            placeholder="Ihre Nachricht"
            rows={5}
            className={`w-full px-4 py-3 bg-white/50 dark:bg-white/5 border ${
              errors.nachricht
                ? 'border-red-500/50'
                : 'border-accent/25 dark:border-accent/30'
            } rounded-xl focus:outline-none focus:border-accent/70 focus:ring-2 focus:ring-accent/30 transition-all placeholder-transparent resize-none`}
          />
          <label
            className={`absolute left-4 transition-all pointer-events-none ${
              focusedField === 'nachricht' || formData.nachricht
                ? '-top-2 text-xs text-accent'
                : 'top-3 text-muted-foreground'
            }`}
          >
            Nachricht *
          </label>
          {errors.nachricht && (
            <p className="text-red-500/80 text-xs mt-1">{errors.nachricht}</p>
          )}
        </div>

        {/* Datenschutz */}
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="terms"
            checked={agreedToTerms}
            onChange={(e) => {
              setAgreedToTerms(e.target.checked)
              if (errors.terms) {
                setErrors((prev) => {
                  const newErrors = { ...prev }
                  delete newErrors.terms
                  return newErrors
                })
              }
            }}
            className="mt-1 w-5 h-5 accent-accent rounded cursor-pointer"
          />
          <label htmlFor="terms" className="text-sm text-muted-foreground cursor-pointer">
            Ich akzeptiere die{' '}
            <a href="/privacy" className="text-accent hover:underline">
              Datenschutzerklärung
            </a>
            {errors.terms && <span className="text-red-500"> *</span>}
          </label>
        </div>

        {/* reCAPTCHA */}
        {recaptchaSiteKey && (
          <ReCAPTCHA
            ref={recaptchaRef}
            sitekey={recaptchaSiteKey}
            size="invisible"
          />
        )}

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={loading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-4 bg-accent text-accent-foreground font-semibold rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-5 h-5 border-2 border-accent-foreground border-t-transparent rounded-full"
              />
              Wird gesendet...
            </>
          ) : (
            'Nachricht senden'
          )}
        </motion.button>
      </form>
    </motion.div>
  )
}
