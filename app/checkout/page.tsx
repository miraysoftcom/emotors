'use client'

import { useEffect, useMemo, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  BadgeCheck,
  Check,
  ChevronLeft,
  ClipboardCheck,
  CreditCard,
  Landmark,
  Lock,
  MapPin,
  Receipt,
  ShieldCheck,
  Smartphone,
  Truck,
  UserRound,
  WalletCards,
} from 'lucide-react'
import Link from 'next/link'
import { formatMoney } from '@/lib/money'
import { useCartStore } from '@/lib/store/cartStore'
import type { PaymentMethodSettings, ShopSettings } from '@/lib/shop-settings-store'
import { calculateOrderTax } from '@/lib/tax-calculation'
import { useAuthStatus } from '@/lib/use-auth-status'
import type { CustomerAccountRecord } from '@/lib/customer-account-store'
import { CheckoutAnnouncementBanner } from '@/components/announcements/AnnouncementClientSurfaces'
import { LuxuryHeader } from '@/components/navigation/LuxuryHeader'
import { Footer } from '@/components/navigation/Footer'

export const dynamic = 'force-dynamic'

interface CheckoutItem {
  productId: number
  name: string
  price: number
  quantity: number
  image: string
}

type CheckoutAccountPayload = {
  authenticated: boolean
  account: CustomerAccountRecord
}

const fallbackPaymentMethods: PaymentMethodSettings[] = [
  { id: 'stripe', label: 'Kreditkarte (Stripe)', enabled: true, sortOrder: 1, instructions: 'Sichere Kartenzahlung.' },
  { id: 'sumup', label: 'SumUp', enabled: false, sortOrder: 2, instructions: 'Sichere Zahlung über SumUp.' },
  { id: 'paypal', label: 'PayPal', enabled: true, sortOrder: 3, instructions: 'Sichere Zahlung über PayPal.' },
  { id: 'twint', label: 'TWINT', enabled: true, sortOrder: 4, instructions: 'Manuelle TWINT-Zahlung mit Zahlungsprüfung.' },
  { id: 'bank_transfer', label: 'Banküberweisung / IBAN', enabled: true, sortOrder: 5, instructions: 'Überweisung mit Bestellnummer als Referenz.' },
  { id: 'vorauszahlung', label: 'Vorauszahlung', enabled: true, sortOrder: 6, instructions: 'Verarbeitung nach Zahlungseingang.' },
  { id: 'auf_rechnung', label: 'Kauf auf Rechnung', enabled: true, sortOrder: 7, instructions: 'Rechnung mit Zahlungsfrist.' },
]

const steps = [
  { title: 'Kundendaten', description: 'Kontakt', icon: UserRound },
  { title: 'Lieferadresse', description: 'Zustellung', icon: MapPin },
  { title: 'Rechnungsadresse', description: 'Rechnung', icon: Receipt },
  { title: 'Versandart', description: 'Lieferung', icon: Truck },
  { title: 'Zahlungsart', description: 'Zahlung', icon: WalletCards },
  { title: 'Bestellübersicht', description: 'Prüfen', icon: ClipboardCheck },
  { title: 'Abschluss', description: 'Bestätigen', icon: BadgeCheck },
]

function CheckoutContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { items: storedCartItems, clearCart } = useCartStore()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [settings, setSettings] = useState<ShopSettings | null>(null)
  const [error, setError] = useState('')
  const [accountData, setAccountData] = useState<CheckoutAccountPayload | null>(null)
  const [accountNotice, setAccountNotice] = useState('')
  const { sessionLoading, authenticatedUser, isAuthenticated } = useAuthStatus()

  const productFromParams = {
    productId: searchParams.get('productId'),
    title: searchParams.get('title') || 'MK eMotion X',
    price: parseFloat(searchParams.get('price') || '4999'),
    quantity: parseInt(searchParams.get('quantity') || '1'),
  }

  const cartItems: CheckoutItem[] = storedCartItems.length > 0
    ? storedCartItems.map((item) => ({
      productId: Number.parseInt(item.id, 10) || 0,
      name: item.title,
      price: item.price,
      quantity: item.quantity,
      image: item.image || '/images/products/mk-emotion-x.jpg',
    }))
    : [
      {
        productId: Number.parseInt(productFromParams.productId || '1', 10),
        name: productFromParams.title,
        price: productFromParams.price,
        quantity: productFromParams.quantity,
        image: '/images/products/mk-emotion-x.jpg',
      },
    ]

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'CH',
    billingSameAsShipping: true,
    billingAddress: '',
    billingCity: '',
    billingPostalCode: '',
    billingCountry: 'CH',
    shippingMethod: 'standard',
    paymentMethod: 'stripe',
    customerNote: '',
    terms: false,
    privacy: false,
  })

  useEffect(() => {
    fetch('/api/shop/settings')
      .then((res) => res.json())
      .then((data) => {
        setSettings(data)
        const firstMethod = data.payments?.methods?.[0]?.id
        if (firstMethod) setFormData((prev) => ({ ...prev, paymentMethod: firstMethod }))
      })
      .catch(() => setSettings(null))
  }, [])

  useEffect(() => {
    if (sessionLoading || !authenticatedUser?.email) return

    fetch(`/api/account?email=${encodeURIComponent(authenticatedUser.email)}`, { credentials: 'include' })
      .then((res) => res.ok ? res.json() : null)
      .then((data: CheckoutAccountPayload | null) => {
        if (!data?.account) return
        const account = data.account
        const defaultShipping = account.addresses.find((item) => item.isDefaultShipping) || account.addresses[0]
        const defaultBilling = account.addresses.find((item) => item.isDefaultBilling) || defaultShipping

        setAccountData(data)
        setFormData((prev) => ({
          ...prev,
          firstName: account.firstName || prev.firstName,
          lastName: account.lastName || prev.lastName,
          email: account.email || authenticatedUser.email || prev.email,
          phone: account.phone || prev.phone,
          address: defaultShipping ? `${defaultShipping.street} ${defaultShipping.houseNumber || ''}`.trim() : prev.address,
          city: defaultShipping?.city || prev.city,
          postalCode: defaultShipping?.postalCode || prev.postalCode,
          country: defaultShipping?.country || prev.country,
          billingSameAsShipping: !defaultBilling || defaultBilling.id === defaultShipping?.id,
          billingAddress: defaultBilling ? `${defaultBilling.street} ${defaultBilling.houseNumber || ''}`.trim() : prev.billingAddress,
          billingCity: defaultBilling?.city || prev.billingCity,
          billingPostalCode: defaultBilling?.postalCode || prev.billingPostalCode,
          billingCountry: defaultBilling?.country || prev.billingCountry,
        }))
        const hasCustomerBasics = Boolean(account.firstName && account.lastName && (account.email || authenticatedUser.email))
        setAccountNotice(defaultShipping && hasCustomerBasics
          ? 'Ihre Kundendaten und gespeicherte Adresse wurden aus dem Kundenkonto übernommen.'
          : defaultShipping
            ? 'Ihre Adresse wurde übernommen. Bitte ergänzen Sie noch Ihre Kundendaten.'
            : 'Ihre Kundendaten wurden übernommen. Bitte ergänzen Sie noch die Lieferadresse.'
        )
        setCurrentStep(hasCustomerBasics ? (defaultShipping ? 4 : 2) : 1)
      })
      .catch(() => null)
  }, [sessionLoading, authenticatedUser?.email])

  const paymentMethods = settings?.payments.methods?.length ? settings.payments.methods : fallbackPaymentMethods
  const subtotal = useMemo(() => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0), [cartItems])
  const shippingCost = settings && subtotal >= settings.shop.freeShippingFrom ? 0 : settings?.shop.shippingCost ?? 25
  const taxCalculation = useMemo(() => calculateOrderTax({ items: cartItems, shippingCost, settings: (settings as any)?.tax }), [cartItems, shippingCost, settings])
  const totalAmount = taxCalculation.gross
  const includedTax = taxCalculation.tax
  const selectedPayment = paymentMethods.find((method) => method.id === formData.paymentMethod)

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = event.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (event.target as HTMLInputElement).checked : value,
    }))
  }

  const validateCurrentStep = () => {
    if (currentStep === 1 && (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))) {
      return 'Bitte geben Sie vollständige Kundendaten und eine gültige E-Mail-Adresse ein.'
    }
    if (currentStep === 2 && (!formData.address.trim() || !formData.city.trim() || !/^[0-9]{4,5}$/.test(formData.postalCode.trim()))) {
      return 'Bitte geben Sie eine gültige Lieferadresse mit PLZ ein.'
    }
    if (currentStep === 3 && !formData.billingSameAsShipping && (!formData.billingAddress.trim() || !formData.billingCity.trim() || !/^[0-9]{4,5}$/.test(formData.billingPostalCode.trim()))) {
      return 'Bitte geben Sie eine gültige Rechnungsadresse ein.'
    }
    if (currentStep === 7 && (!formData.terms || !formData.privacy)) {
      return 'Bitte akzeptieren Sie AGB und Datenschutzerklärung.'
    }
    return ''
  }

  const validateCheckout = () => {
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      return { step: 1, message: 'Bitte ergänzen Sie Vorname, Nachname und eine gültige E-Mail-Adresse.' }
    }
    if (!formData.address.trim() || !formData.city.trim() || !/^[0-9]{4,5}$/.test(formData.postalCode.trim())) {
      return { step: 2, message: 'Bitte ergänzen Sie Straße, Ort und eine gültige PLZ der Lieferadresse.' }
    }
    if (!formData.billingSameAsShipping && (!formData.billingAddress.trim() || !formData.billingCity.trim() || !/^[0-9]{4,5}$/.test(formData.billingPostalCode.trim()))) {
      return { step: 3, message: 'Bitte ergänzen Sie die Rechnungsadresse oder aktivieren Sie “entspricht der Lieferadresse”.' }
    }
    if (!formData.shippingMethod) {
      return { step: 4, message: 'Bitte wählen Sie eine Versandart aus.' }
    }
    if (!formData.paymentMethod) {
      return { step: 5, message: 'Bitte wählen Sie eine Zahlungsart aus.' }
    }
    if (!formData.terms || !formData.privacy) {
      return { step: 7, message: 'Bitte akzeptieren Sie AGB und Datenschutzerklärung.' }
    }
    return null
  }

  const goToStep = (targetStep: number) => {
    if (targetStep <= currentStep) {
      setError('')
      setCurrentStep(targetStep)
      return
    }
    const validationError = validateCheckout()
    if (validationError && validationError.step < targetStep) {
      setCurrentStep(validationError.step)
      setError(validationError.message)
      return
    }
    setError('')
    setCurrentStep(targetStep)
  }

  const nextStep = () => {
    const validationError = validateCurrentStep()
    if (validationError) {
      setError(validationError)
      return
    }
    setError('')
    setCurrentStep((step) => Math.min(7, step + 1))
  }

  const goToNextRequiredStep = () => {
    if (isAuthenticated && currentStep === 1) {
      const validationError = validateCurrentStep()
      if (validationError) {
        setError(validationError)
        return
      }
      setError('')
      setCurrentStep(formData.address && formData.city && formData.postalCode ? 4 : 2)
      return
    }
    nextStep()
  }

  const handleSubmitOrder = async () => {
    const validationError = validateCheckout()
    if (validationError) {
      setCurrentStep(validationError.step)
      setError(validationError.message)
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/admin/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          totalAmount,
          subtotal,
          shippingCost,
          tax: includedTax,
          items: cartItems,
        }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Bestellung konnte nicht erstellt werden.')

      window.sessionStorage.setItem(
        'lastOrderLookup',
        JSON.stringify({ orderNumber: data.order.orderNumber, email: formData.email })
      )
      clearCart()
      router.push(`/checkout/success?orderNumber=${data.order.orderNumber}`)
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Es ist ein Fehler bei der Bestellung aufgetreten.')
    } finally {
      setLoading(false)
    }
  }

  const PaymentIcon = formData.paymentMethod === 'twint'
    ? Smartphone
    : formData.paymentMethod === 'bank_transfer' || formData.paymentMethod === 'vorauszahlung'
      ? Landmark
      : formData.paymentMethod === 'auf_rechnung'
        ? Receipt
        : CreditCard
  const currentStepMeta = steps[currentStep - 1]
  const progressPercent = Math.round(((currentStep - 1) / (steps.length - 1)) * 100)

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(23,150,118,0.18),transparent_34rem),linear-gradient(180deg,#020617_0%,#07110d_45%,#020617_100%)] pt-32 text-white">
      <div className="mx-auto mb-5 max-w-7xl px-4">
        <Link href="/produkte" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-accent/50 hover:text-white">
          <ChevronLeft size={18} />
          Zurück zum Shop
        </Link>
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 pb-20 lg:grid-cols-[1fr_380px]">
        <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/78 shadow-2xl shadow-black/35 backdrop-blur-xl">
          <CheckoutAnnouncementBanner />

          <div className="border-b border-white/10 bg-[linear-gradient(135deg,rgba(32,214,124,0.12),rgba(15,23,42,0)_42%)] p-5 sm:p-8">
            <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
              <div className="max-w-3xl">
                <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-2 text-xs font-black uppercase tracking-widest text-accent">
                  <ShieldCheck size={15} />
                  SSL geschützte Kasse
                </p>
                <h1 className="text-4xl font-black tracking-tight sm:text-5xl">Kasse</h1>
                <p className="mt-3 text-base leading-relaxed text-slate-300">
                  Sicher bestellen mit Schweizer Zahlungs- und Adressformaten. Ihre Daten werden verschlüsselt übertragen.
                </p>
              </div>
              <div className="min-w-64 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-400">Fortschritt</span>
                  <span className="text-sm font-black text-accent">{progressPercent}%</span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-accent transition-all duration-500" style={{ width: `${progressPercent}%` }} />
                </div>
                <p className="mt-3 text-sm text-slate-300">
                  Schritt <span className="font-black text-white">{currentStep}</span> von {steps.length}: <span className="font-black text-white">{currentStepMeta.title}</span>
                </p>
              </div>
            </div>

            <div className="mt-7 overflow-x-auto pb-1">
              <div className="grid min-w-[56rem] grid-cols-7 gap-2">
                {steps.map((step, index) => {
                  const stepNumber = index + 1
                  const active = currentStep === stepNumber
                  const done = currentStep > stepNumber
                  const Icon = step.icon
                  return (
                    <button
                      key={step.title}
                      type="button"
                  onClick={() => goToStep(stepNumber)}
                      className={`group rounded-2xl border p-3 text-left transition ${
                        active
                          ? 'border-accent bg-accent/15 shadow-lg shadow-accent/10'
                          : done
                            ? 'border-accent/30 bg-accent/10'
                            : 'border-white/10 bg-white/[0.03] hover:border-white/25 hover:bg-white/[0.06]'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl border text-sm font-black ${
                          active
                            ? 'border-accent bg-accent text-accent-foreground'
                            : done
                              ? 'border-accent/40 bg-accent/20 text-accent'
                              : 'border-white/10 bg-slate-950 text-slate-400'
                        }`}>
                          {done ? <Check size={16} /> : <Icon size={16} />}
                        </span>
                        <span className="min-w-0">
                          <span className="block text-[0.68rem] font-black uppercase tracking-widest text-slate-500">{stepNumber}. Schritt</span>
                          <span className={`mt-0.5 block truncate text-sm font-black ${active ? 'text-white' : done ? 'text-slate-100' : 'text-slate-400'}`}>{step.title}</span>
                        </span>
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-8">
            {accountNotice && (
              <div className="mb-6 rounded-2xl border border-accent/30 bg-accent/10 p-4 text-sm font-semibold text-accent">
                {accountNotice}
              </div>
            )}
            {error && <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">{error}</div>}

            <div className="space-y-6">
            {currentStep === 1 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold">Kundendaten</h2>
                {isAuthenticated && accountData?.account && (
                  <div className="rounded-2xl border border-accent/30 bg-accent/10 p-4">
                    <p className="font-bold text-accent">Aus Kundenkonto übernommen</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {formData.firstName} {formData.lastName} · {formData.email}
                      {formData.phone ? ` · ${formData.phone}` : ''}
                    </p>
                  </div>
                )}
                <div className="grid gap-4 sm:grid-cols-2">
                  <input name="firstName" value={formData.firstName} onChange={handleInputChange} readOnly={isAuthenticated} placeholder="Vorname *" className="rounded-lg border border-white/10 bg-slate-900 px-4 py-3 read-only:cursor-not-allowed read-only:opacity-75" />
                  <input name="lastName" value={formData.lastName} onChange={handleInputChange} readOnly={isAuthenticated} placeholder="Nachname *" className="rounded-lg border border-white/10 bg-slate-900 px-4 py-3 read-only:cursor-not-allowed read-only:opacity-75" />
                  <input name="email" type="email" value={formData.email} onChange={handleInputChange} readOnly={isAuthenticated} placeholder="E-Mail *" className="rounded-lg border border-white/10 bg-slate-900 px-4 py-3 read-only:cursor-not-allowed read-only:opacity-75" />
                  <input name="phone" type="tel" value={formData.phone} onChange={handleInputChange} placeholder="Telefon" className="rounded-lg border border-white/10 bg-slate-900 px-4 py-3" />
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold">Lieferadresse</h2>
                <input name="address" value={formData.address} onChange={handleInputChange} placeholder="Strasse und Hausnummer *" className="w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-3" />
                <div className="grid gap-4 sm:grid-cols-[140px_1fr_160px]">
                  <input name="postalCode" value={formData.postalCode} onChange={handleInputChange} placeholder="PLZ *" className="rounded-lg border border-white/10 bg-slate-900 px-4 py-3" />
                  <input name="city" value={formData.city} onChange={handleInputChange} placeholder="Ort *" className="rounded-lg border border-white/10 bg-slate-900 px-4 py-3" />
                  <select name="country" value={formData.country} onChange={handleInputChange} className="rounded-lg border border-white/10 bg-slate-900 px-4 py-3">
                    <option value="CH">Schweiz</option>
                    <option value="DE">Deutschland</option>
                    <option value="AT">Österreich</option>
                  </select>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold">Rechnungsadresse</h2>
                <label className="flex items-center gap-3 rounded-lg border border-white/10 bg-slate-900 p-4">
                  <input type="checkbox" name="billingSameAsShipping" checked={formData.billingSameAsShipping} onChange={handleInputChange} />
                  Rechnungsadresse entspricht der Lieferadresse
                </label>
                {!formData.billingSameAsShipping && (
                  <>
                    <input name="billingAddress" value={formData.billingAddress} onChange={handleInputChange} placeholder="Rechnungsadresse *" className="w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-3" />
                    <div className="grid gap-4 sm:grid-cols-[140px_1fr_160px]">
                      <input name="billingPostalCode" value={formData.billingPostalCode} onChange={handleInputChange} placeholder="PLZ *" className="rounded-lg border border-white/10 bg-slate-900 px-4 py-3" />
                      <input name="billingCity" value={formData.billingCity} onChange={handleInputChange} placeholder="Ort *" className="rounded-lg border border-white/10 bg-slate-900 px-4 py-3" />
                      <select name="billingCountry" value={formData.billingCountry} onChange={handleInputChange} className="rounded-lg border border-white/10 bg-slate-900 px-4 py-3">
                        <option value="CH">Schweiz</option>
                        <option value="DE">Deutschland</option>
                        <option value="AT">Österreich</option>
                      </select>
                    </div>
                  </>
                )}
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold">Versandart</h2>
                <label className="flex items-center justify-between rounded-lg border border-accent bg-accent/10 p-4">
                  <span>
                    <span className="block font-semibold">Standardlieferung Schweiz</span>
                    <span className="text-sm text-slate-400">Spedition oder Paketdienst, abhängig vom Produkt.</span>
                  </span>
                  <span className="font-bold">{shippingCost === 0 ? 'Kostenlos' : formatMoney(shippingCost)}</span>
                  <input type="radio" name="shippingMethod" value="standard" checked={formData.shippingMethod === 'standard'} onChange={handleInputChange} />
                </label>
              </div>
            )}

            {currentStep === 5 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold">Zahlungsart</h2>
                {paymentMethods.map((method) => (
                  <label key={method.id} className={`flex cursor-pointer items-start gap-4 rounded-lg border p-4 transition ${formData.paymentMethod === method.id ? 'border-accent bg-accent/10' : 'border-white/10 bg-slate-900 hover:border-white/25'}`}>
                    <input type="radio" name="paymentMethod" value={method.id} checked={formData.paymentMethod === method.id} onChange={handleInputChange} className="mt-1" />
                    <span>
                      <span className="block font-semibold">{method.label}</span>
                      <span className="text-sm text-slate-400">{method.instructions}</span>
                    </span>
                  </label>
                ))}
              </div>
            )}

            {currentStep === 6 && (
              <div className="space-y-5">
                <h2 className="text-xl font-bold">Bestellübersicht</h2>
                <div className="rounded-lg border border-white/10 bg-slate-900 p-4">
                  <div className="mb-3 flex items-center gap-2 font-semibold"><PaymentIcon size={18} /> {selectedPayment?.label}</div>
                  <p className="text-sm text-slate-400">{selectedPayment?.instructions}</p>
                </div>
                <textarea name="customerNote" value={formData.customerNote} onChange={handleInputChange} placeholder="Bemerkung zur Bestellung" className="h-24 w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-3" />
              </div>
            )}

            {currentStep === 7 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold">Bestellung abschliessen</h2>
                <label className="flex items-start gap-3 rounded-lg border border-white/10 bg-slate-900 p-4 text-sm">
                  <input type="checkbox" name="terms" checked={formData.terms} onChange={handleInputChange} className="mt-1" />
                  <span>
                    Ich akzeptiere die{' '}
                    <Link href="/agb" target="_blank" className="font-semibold text-accent underline-offset-4 hover:underline">
                      AGB
                    </Link>
                    ,{' '}
                    <Link href="/terms" target="_blank" className="font-semibold text-accent underline-offset-4 hover:underline">
                      Widerrufsbedingungen
                    </Link>{' '}
                    und{' '}
                    <Link href="/ratenzahlung" target="_blank" className="font-semibold text-accent underline-offset-4 hover:underline">
                      Zahlungsbedingungen
                    </Link>
                    .
                  </span>
                </label>
                <label className="flex items-start gap-3 rounded-lg border border-white/10 bg-slate-900 p-4 text-sm">
                  <input type="checkbox" name="privacy" checked={formData.privacy} onChange={handleInputChange} className="mt-1" />
                  <span>
                    Ich habe die{' '}
                    <Link href="/datenschutz" target="_blank" className="font-semibold text-accent underline-offset-4 hover:underline">
                      Datenschutzerklärung
                    </Link>{' '}
                    gelesen und akzeptiere die Verarbeitung meiner Daten.
                  </span>
                </label>
              </div>
            )}
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            {currentStep > 1 && (
              <button type="button" onClick={() => setCurrentStep((step) => step - 1)} className="rounded-2xl border border-white/10 px-6 py-3 font-bold text-slate-200 transition hover:bg-white/5">
                Zurück
              </button>
            )}
            {currentStep < 7 ? (
              <button type="button" onClick={goToNextRequiredStep} className="rounded-2xl bg-accent px-7 py-3 font-black text-accent-foreground shadow-lg shadow-accent/20 transition hover:-translate-y-0.5">
                Weiter
              </button>
            ) : (
              <button type="button" disabled={loading} onClick={handleSubmitOrder} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-7 py-3 font-black text-white shadow-lg shadow-emerald-600/20 transition hover:-translate-y-0.5 disabled:opacity-60">
                <Lock size={18} />
                {loading ? 'Wird verarbeitet...' : `Jetzt kaufen - ${formatMoney(totalAmount)}`}
              </button>
            )}
          </div>
          </div>
        </motion.section>

        <aside className="h-fit rounded-xl border border-white/10 bg-white/[0.04] p-5 lg:sticky lg:top-6">
          <h2 className="mb-5 text-xl font-bold">Bestellübersicht</h2>
          <div className="space-y-4 border-b border-white/10 pb-5">
            {cartItems.map((item) => (
              <div key={`${item.productId}-${item.name}`} className="flex justify-between gap-4">
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm text-slate-400">Menge: {item.quantity}</p>
                </div>
                <p className="font-bold">{formatMoney(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 space-y-3 border-b border-white/10 pb-5 text-sm">
            <div className="flex justify-between text-slate-300"><span>Zwischensumme</span><span>{formatMoney(subtotal)}</span></div>
            <div className="flex justify-between text-slate-300"><span>Versand</span><span>{shippingCost === 0 ? 'Kostenlos' : formatMoney(shippingCost)}</span></div>
            {taxCalculation.enabled && (
              taxCalculation.lines.map((line) => (
                <div key={line.rateId} className="flex justify-between text-slate-300">
                  <span>{taxCalculation.priceDisplay === 'inclusive' ? 'inkl.' : 'zzgl.'} MWST {line.percentage}%</span>
                  <span>{formatMoney(line.tax)}</span>
                </div>
              ))
            )}
          </div>
          <div className="mt-5 flex items-center justify-between">
            <span className="text-lg font-bold">Gesamt</span>
            <span className="text-2xl font-black text-accent">{formatMoney(totalAmount)}</span>
          </div>
          <div className="mt-5 flex gap-2 text-xs text-slate-400">
            <Lock size={16} />
            SSL-verschlüsselte Übertragung. Manuelle Zahlarten werden nicht automatisch als bezahlt markiert.
          </div>
        </aside>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <main className="w-full min-h-screen bg-slate-950 text-white">
      <LuxuryHeader />
      <Suspense fallback={<div className="min-h-screen bg-slate-950" />}>
        <CheckoutContent />
      </Suspense>
      <Footer />
    </main>
  )
}
