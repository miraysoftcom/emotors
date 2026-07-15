'use client'

import { FormEvent, ReactNode, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import {
  Bell,
  CalendarDays,
  ChevronDown,
  CheckCircle2,
  CreditCard,
  Download,
  Eye,
  FileText,
  Gift,
  Headphones,
  Heart,
  Home,
  Images,
  Calculator,
  KeyRound,
  Lock,
  LogOut,
  MapPin,
  MapPinned,
  MessageSquare,
  Moon,
  Package,
  PackageSearch,
  Receipt,
  Repeat2,
  RotateCcw,
  SearchCheck,
  Settings,
  Shield,
  ShieldCheck,
  Scale,
  Star,
  Sun,
  Trash2,
  User,
  Wrench,
  type LucideIcon,
} from 'lucide-react'
import { LuxuryHeader } from '@/components/navigation/LuxuryHeader'
import { Footer } from '@/components/navigation/Footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { useTheme } from '@/components/providers/ThemeProvider'
import { useAuthStatus } from '@/lib/use-auth-status'
import { useFavoritesStore } from '@/lib/store/favoritesStore'
import { mergeAnnouncements } from '@/components/announcements/AnnouncementClientSurfaces'
import { formatMoney } from '@/lib/money'
import { calculateCustomerLoyaltyPoints, LOYALTY_POINTS_PER_CHF, loyaltyPointsToChf } from '@/lib/loyalty-points'
import { OrderSummaryView } from '@/components/orders/OrderSummaryView'
import type { CustomerAccountRecord } from '@/lib/customer-account-store'
import type { InvoiceRecord } from '@/lib/invoice-store'
import type { StoredOrder } from '@/lib/orders-store'

type AccountPayload = {
  authenticated: boolean
  account: CustomerAccountRecord
  orders: StoredOrder[]
  invoices: InvoiceRecord[]
}

type RewardPayment = {
  id: string
  couponCode: string
  title: string
  amount: number
  currency: 'CHF'
  status: 'pending' | 'processing' | 'paid' | 'cancelled'
  selectedMethod: string
  createdAt: string
}

type RewardPaymentMethod = {
  id: string
  label: string
  instructions: string
}

function extractInvoiceDownloadError(text: string) {
  if (!text) return 'Die Rechnung ist derzeit noch nicht verfügbar. Bitte versuchen Sie es später erneut.'
  try {
    const data = JSON.parse(text) as { error?: string; message?: string }
    return data.error || data.message || 'Die Rechnung ist derzeit noch nicht verfügbar. Bitte versuchen Sie es später erneut.'
  } catch {
    return text.includes('<!DOCTYPE') || text.includes('<html')
      ? 'Die Rechnung ist derzeit noch nicht verfügbar. Bitte versuchen Sie es später erneut.'
      : text
  }
}

type Announcement = {
  id: string
  title: string
  excerpt: string
  content: string
  type: string
  priority: string
  accentColor?: string
  buttonText?: string
  buttonUrl?: string
  dismissible: boolean
  isRead?: boolean
}

type ShopProduct = {
  id: number
  title: string
  slug: string
  price: number
  image?: string | null
  images?: string[]
  brand?: string | null
  power_watts?: number | null
  range_km?: number | null
  max_speed?: number | null
  warranty?: string | null
}

type CompareItem = {
  id: string
  title: string
  slug: string
  price: number
  image?: string | null
  brand?: string | null
  power_watts?: number | null
  range_km?: number | null
  max_speed?: number | null
}

type WarrantyLookupResult = {
  productName: string
  serialNumber: string
  vehicleNumber: string
  orderNumber: string
  purchaseDate: string
  warrantyUntil: string
  status: 'active' | 'expired' | 'void' | 'service'
  notes?: string
}

type TotpSetup = {
  secret: string
  otpauthUri: string
  qrDataUrl?: string
  issuer: string
  accountName: string
}

const tabs: Array<{ id: string; label: string; icon: LucideIcon }> = [
  { id: 'overview', label: 'Übersicht', icon: Home },
  { id: 'profile', label: 'Informationen', icon: User },
  { id: 'addresses', label: 'Adressen', icon: MapPin },
  { id: 'orders', label: 'Bestellungen', icon: Package },
  { id: 'tracking', label: 'Sendungsverfolgung', icon: SearchCheck },
  { id: 'invoices', label: 'Rechnungen', icon: Receipt },
  { id: 'wishlist', label: 'Wunschliste', icon: Heart },
  { id: 'compare', label: 'Vergleich', icon: Scale },
  { id: 'reviews', label: 'Bewertungen', icon: Star },
  { id: 'gallery', label: 'Galerie & Video', icon: Images },
  { id: 'testdrives', label: 'Probefahrten', icon: CalendarDays },
  { id: 'estimate', label: 'Kostenvoranschlag', icon: Calculator },
  { id: 'financing', label: 'Finanzierung', icon: CreditCard },
  { id: 'warranty', label: 'Garantie', icon: Shield },
  { id: 'returns', label: 'Retouren', icon: RotateCcw },
  { id: 'service', label: 'Servicepunkte', icon: MapPinned },
  { id: 'parts', label: 'Ersatzteile', icon: PackageSearch },
  { id: 'tradein', label: 'Secondhand / Tausch', icon: Repeat2 },
  { id: 'rewards', label: 'Coupons & Punkte', icon: Gift },
  { id: 'newsletter', label: 'Newsletter', icon: MessageSquare },
  { id: 'messages', label: 'Mitteilungen', icon: Bell },
  { id: 'support', label: 'Support', icon: Headphones },
  { id: 'security', label: 'Sicherheit', icon: ShieldCheck },
  { id: 'settings', label: 'Einstellungen', icon: Settings },
]

const accountNavGroups: Array<{ label: string; items: typeof tabs }> = [
  {
    label: 'Konto',
    items: tabs.filter((tab) => ['overview', 'profile', 'addresses', 'security', 'settings'].includes(tab.id)),
  },
  {
    label: 'Bestellungen',
    items: tabs.filter((tab) => ['orders', 'tracking', 'invoices'].includes(tab.id)),
  },
  {
    label: 'Shop & Vorteile',
    items: tabs.filter((tab) => ['wishlist', 'compare', 'reviews', 'gallery', 'financing', 'rewards', 'newsletter'].includes(tab.id)),
  },
  {
    label: 'After Sales',
    items: tabs.filter((tab) => ['warranty', 'returns', 'service', 'parts', 'tradein', 'estimate', 'testdrives', 'support', 'messages'].includes(tab.id)),
  },
]

const emptyAddress = {
  type: 'shipping',
  firstName: '',
  lastName: '',
  company: '',
  street: '',
  houseNumber: '',
  addressLine2: '',
  postalCode: '',
  city: '',
  canton: '',
  country: 'CH',
  phone: '',
  isDefaultShipping: true,
  isDefaultBilling: false,
}

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [lookupEmail, setLookupEmail] = useState('')
  const [accountData, setAccountData] = useState<AccountPayload | null>(null)
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [orderNumber, setOrderNumber] = useState('')
  const [orderEmail, setOrderEmail] = useState('')
  const [trackedOrder, setTrackedOrder] = useState<StoredOrder | null>(null)
  const [addressForm, setAddressForm] = useState(emptyAddress)
  const [testDriveForm, setTestDriveForm] = useState({
    date: '',
    productName: '',
    message: '',
  })
  const [supportForm, setSupportForm] = useState({
    subject: '',
    category: 'Allgemeine Anfrage',
    message: '',
  })
  const [products, setProducts] = useState<ShopProduct[]>([])
  const [rewardPayments, setRewardPayments] = useState<RewardPayment[]>([])
  const [rewardPaymentMethods, setRewardPaymentMethods] = useState<RewardPaymentMethod[]>([])
  const [selectedRewardMethods, setSelectedRewardMethods] = useState<Record<string, string>>({})
  const [compareItems, setCompareItems] = useState<CompareItem[]>([])
  const [requestForm, setRequestForm] = useState({
    product: '',
    orderNumber: '',
    serialNumber: '',
    subject: '',
    message: '',
    phone: '',
  })
  const [tradeInForm, setTradeInForm] = useState({
    requestType: 'eintausch',
    vehicleType: 'E-Scooter',
    brandModel: '',
    year: '',
    mileage: '',
    batteryHealth: '',
    condition: 'gut',
    desiredProduct: '',
    expectedPrice: '',
    accessories: '',
    hasDocuments: true,
    pickupZip: '',
    phone: '',
    message: '',
  })
  const [estimateForm, setEstimateForm] = useState({
    vehicleType: 'E-Scooter',
    brandModel: '',
    serviceType: 'Reparatur',
    urgency: 'Normal',
    preferredDate: '',
    location: 'Dornach',
    budget: '',
    phone: '',
    message: '',
  })
  const [warrantyLookup, setWarrantyLookup] = useState({
    serialNumber: '',
    loading: false,
    error: '',
    result: null as WarrantyLookupResult | null,
  })
  const [reviewForm, setReviewForm] = useState({
    productId: '',
    rating: 5,
    title: '',
    comment: '',
  })
  const [financingAmount, setFinancingAmount] = useState(3190)
  const [financingMonths, setFinancingMonths] = useState(12)
  const [totpSetup, setTotpSetup] = useState<TotpSetup | null>(null)
  const [totpCode, setTotpCode] = useState('')
  const [totpDisableCode, setTotpDisableCode] = useState('')
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([])
  const appliedAccountThemeRef = useRef('')
  const { sessionLoading, authenticatedUser, isAuthenticated, logout } = useAuthStatus()
  const { resolvedTheme, setTheme } = useTheme()
  const { items: favoriteItems, removeFavorite } = useFavoritesStore()

  const effectiveEmail = authenticatedUser?.email || lookupEmail

  useEffect(() => {
    if (sessionLoading) return
    if (authenticatedUser?.email) {
      setLookupEmail(authenticatedUser.email)
      loadAccount(authenticatedUser.email)
      return
    }
    setAccountData(null)
    setAnnouncements([])
    setTrackedOrder(null)
  }, [sessionLoading, authenticatedUser?.email])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('tab') === 'rewards') {
      setActiveTab('rewards')
    }
  }, [])

  useEffect(() => {
    const accountTheme = accountData?.account.theme
    const accountKey = accountData?.account.email || effectiveEmail || ''
    const themeKey = `${accountKey}:${accountTheme || ''}`
    if (accountTheme && appliedAccountThemeRef.current !== themeKey) {
      appliedAccountThemeRef.current = themeKey
      if (accountTheme !== resolvedTheme) setTheme(accountData.account.theme)
    }
  }, [accountData?.account.email, accountData?.account.theme, effectiveEmail, resolvedTheme, setTheme])

  useEffect(() => {
    if (!effectiveEmail) return
    loadAnnouncements(effectiveEmail)
    loadRewardPayments(effectiveEmail)
  }, [effectiveEmail])

  useEffect(() => {
    if (!effectiveEmail) return

    const refreshOrders = () => {
      if (document.visibilityState === 'hidden') return
      loadAccount(effectiveEmail, { silent: true })
      if (trackedOrder && orderNumber && orderEmail) {
        verifyOrder(undefined, { silent: true })
      }
    }

    const interval = window.setInterval(refreshOrders, 8000)
    window.addEventListener('focus', refreshOrders)
    document.addEventListener('visibilitychange', refreshOrders)

    return () => {
      window.clearInterval(interval)
      window.removeEventListener('focus', refreshOrders)
      document.removeEventListener('visibilitychange', refreshOrders)
    }
  }, [effectiveEmail, trackedOrder?.id, orderNumber, orderEmail])

  useEffect(() => {
    loadProducts()
    syncCompareItems()
    const sync = () => syncCompareItems()
    window.addEventListener('storage', sync)
    window.addEventListener('mk-compare-products-changed', sync)
    return () => {
      window.removeEventListener('storage', sync)
      window.removeEventListener('mk-compare-products-changed', sync)
    }
  }, [])

  const stats = useMemo(() => {
    const orders = accountData?.orders || []
    const totalSpend = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0)
    return {
      open: orders.filter((order) => !['Zugestellt', 'Storniert', 'Rückerstattet'].includes(order.status)).length,
      done: orders.filter((order) => order.status === 'Zugestellt').length,
      totalSpend,
      loyaltyPoints: calculateCustomerLoyaltyPoints(totalSpend, orders.length),
      latestOrder: orders[0],
      latestInvoice: accountData?.invoices?.[0],
    }
  }, [accountData])

  const purchasedReviewProducts = useMemo(() => {
    const productIds = new Set(
      (accountData?.orders || [])
        .filter((order) => !['Storniert', 'Rückerstattet'].includes(order.status))
        .flatMap((order) => order.items || [])
        .map((item) => Number(item.productId))
        .filter((id) => Number.isFinite(id))
    )
    return products.filter((product) => productIds.has(Number(product.id)))
  }, [accountData?.orders, products])

  const unreadCount = announcements.filter((item) => !item.isRead).length
  const customerName = [accountData?.account.firstName, accountData?.account.lastName].filter(Boolean).join(' ') || authenticatedUser?.name || 'Kunde'

  async function loadAccount(email = effectiveEmail, options: { silent?: boolean } = {}) {
    if (!email) return
    if (!options.silent) {
      setLoading(true)
      setMessage('')
    }
    const response = await fetch(`/api/account?email=${encodeURIComponent(email)}`, { credentials: 'include', cache: 'no-store' })
    const data = await response.json()
    if (!options.silent) setLoading(false)
    if (!response.ok) {
      if (!options.silent) setMessage(data.error || 'Kontodaten konnten nicht geladen werden.')
      return
    }
    setAccountData(data)
    if (!options.silent) {
      setAddressForm((current) => ({
        ...current,
        firstName: data.account.firstName || '',
        lastName: data.account.lastName || '',
        phone: data.account.phone || '',
      }))
    }
  }

  async function loadAnnouncements(email: string) {
    const [dashboardResponse, messagesResponse] = await Promise.all([
      fetch(`/api/announcements?placement=customer_dashboard&email=${encodeURIComponent(email)}`, { credentials: 'include' }),
      fetch(`/api/announcements?placement=customer_messages&email=${encodeURIComponent(email)}`, { credentials: 'include' }),
    ])
    const dashboardData = dashboardResponse.ok ? await dashboardResponse.json() : { announcements: [] }
    const messagesData = messagesResponse.ok ? await messagesResponse.json() : { announcements: [] }
    setAnnouncements(mergeAnnouncements(dashboardData.announcements || [], messagesData.announcements || []) as Announcement[])
  }

  async function loadProducts() {
    const response = await fetch('/api/products?limit=24', { credentials: 'include' })
    const data = response.ok ? await response.json() : { data: [] }
    setProducts(data.data || [])
  }

  async function loadRewardPayments(email = effectiveEmail) {
    if (!email) return
    const response = await fetch(`/api/account/reward-payments?email=${encodeURIComponent(email)}`, { credentials: 'include', cache: 'no-store' })
    if (!response.ok) return
    const data = await response.json()
    setRewardPayments(data.payments || [])
    setRewardPaymentMethods(data.methods || [])
  }

  async function selectRewardPaymentMethod(paymentId: string) {
    const methodId = selectedRewardMethods[paymentId]
    if (!methodId) {
      setMessage('Bitte wählen Sie eine Zahlungsart aus.')
      return
    }
    setLoading(true)
    setMessage('')
    const response = await fetch('/api/account/reward-payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ paymentId, methodId }),
    })
    const data = await response.json()
    setLoading(false)
    if (!response.ok) {
      setMessage(data.error || 'Zahlungsart konnte nicht vorbereitet werden.')
      return
    }
    setMessage(data.message || 'Zahlungsart wurde vorbereitet.')
    await loadRewardPayments()
  }

  function syncCompareItems() {
    try {
      const raw = window.localStorage.getItem('mk-compare-products')
      setCompareItems(raw ? JSON.parse(raw) : [])
    } catch {
      setCompareItems([])
    }
  }

  function removeCompareItem(id: string) {
    const next = compareItems.filter((item) => item.id !== id)
    setCompareItems(next)
    window.localStorage.setItem('mk-compare-products', JSON.stringify(next))
    window.dispatchEvent(new Event('mk-compare-products-changed'))
  }

  async function saveAccount(partial: Record<string, unknown>) {
    if (!effectiveEmail) return
    setLoading(true)
    const response = await fetch(`/api/account?email=${encodeURIComponent(effectiveEmail)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(partial),
    })
    const data = await response.json()
    setLoading(false)
    if (!response.ok) {
      setMessage(data.error || 'Änderungen konnten nicht gespeichert werden.')
      return
    }
    setAccountData((current) => current ? { ...current, account: data.account } : current)
    setMessage('Änderungen gespeichert.')
  }

  async function saveAddress(event: FormEvent) {
    event.preventDefault()
    await saveAccount({ action: 'address', address: addressForm })
  }

  async function deleteAddress(id: number) {
    await saveAccount({ action: 'delete-address', id })
  }

  async function verifyOrder(event?: FormEvent, options: { silent?: boolean } = {}) {
    event?.preventDefault()
    if (!options.silent) {
      setLoading(true)
      setTrackedOrder(null)
      setMessage('')
    }
    const response = await fetch('/api/orders/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderNumber, email: orderEmail }),
    })
    const data = await response.json()
    if (!options.silent) setLoading(false)
    if (!response.ok) {
      if (!options.silent) setMessage(data.error || 'Keine passende Bestellung gefunden.')
      return
    }
    setTrackedOrder(data.order)
  }

  async function markAnnouncement(id: string, action: 'read' | 'dismiss' = 'read') {
    if (!effectiveEmail) return
    await fetch('/api/announcements/read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ id, email: effectiveEmail, action }),
    })
    if (action === 'dismiss') {
      setAnnouncements((current) => current.filter((item) => item.id !== id))
    } else {
      setAnnouncements((current) => current.map((item) => item.id === id ? { ...item, isRead: true } : item))
    }
  }

  async function submitTestDrive(event: FormEvent) {
    event.preventDefault()
    setLoading(true)
    setMessage('')
    const response = await fetch('/api/requests/test-drive', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: customerName,
        email: effectiveEmail,
        phone: accountData?.account.phone,
        date: testDriveForm.date,
        productName: testDriveForm.productName,
        message: testDriveForm.message,
      }),
    })
    const data = await response.json()
    setLoading(false)
    if (!response.ok) {
      setMessage(data.error || 'Probefahrt-Anfrage konnte nicht gesendet werden.')
      return
    }
    setTestDriveForm({ date: '', productName: '', message: '' })
    setMessage('Probefahrt-Anfrage wurde erfolgreich gesendet.')
  }

  async function submitSupportTicket(event: FormEvent) {
    event.preventDefault()
    setLoading(true)
    setMessage('')
    const [firstName = '', ...lastNameParts] = customerName === 'Kunde' ? ['', ''] : customerName.split(/\s+/)
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        vorname: accountData?.account.firstName || firstName || 'Kunde',
        nachname: accountData?.account.lastName || lastNameParts.join(' ') || 'MK-eMotors',
        email: effectiveEmail,
        telefon: accountData?.account.phone || '',
        produktinteresse: supportForm.category,
        nachricht: `${supportForm.subject}\n\n${supportForm.message}`,
      }),
    })
    const data = await response.json()
    setLoading(false)
    if (!response.ok) {
      setMessage(data.error || 'Support-Ticket konnte nicht gesendet werden.')
      return
    }
    setSupportForm({ subject: '', category: 'Allgemeine Anfrage', message: '' })
    setMessage('Support-Ticket wurde erfolgreich erstellt.')
  }

  async function submitCustomerRequest(event: FormEvent, type: 'warranty' | 'service' | 'return' | 'trade_in' | 'coupon' | 'newsletter') {
    event.preventDefault()
    setLoading(true)
    setMessage('')
    const response = await fetch('/api/account/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        type,
        email: effectiveEmail,
        name: customerName,
        phone: requestForm.phone || accountData?.account.phone,
        subject: requestForm.subject || requestForm.product || type,
        message: requestForm.message,
        payload: {
          product: requestForm.product,
          orderNumber: requestForm.orderNumber,
          serialNumber: requestForm.serialNumber,
        },
      }),
    })
    const data = await response.json()
    setLoading(false)
    if (!response.ok) {
      setMessage(data.error || 'Anfrage konnte nicht gesendet werden.')
      return
    }
    setRequestForm({ product: '', orderNumber: '', serialNumber: '', subject: '', message: '', phone: '' })
    setMessage(data.message || 'Anfrage wurde erfolgreich gesendet.')
  }

  async function submitTradeInRequest(event: FormEvent) {
    event.preventDefault()
    setLoading(true)
    setMessage('')
    const response = await fetch('/api/account/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        type: 'trade_in',
        email: effectiveEmail,
        name: customerName,
        phone: tradeInForm.phone || accountData?.account.phone,
        subject: `Secondhand / Tausch: ${tradeInForm.brandModel || tradeInForm.vehicleType}`,
        message: [
          `Art: ${tradeInForm.requestType}`,
          `Fahrzeug: ${tradeInForm.vehicleType} - ${tradeInForm.brandModel}`,
          `Baujahr: ${tradeInForm.year || '-'}`,
          `Kilometer: ${tradeInForm.mileage || '-'}`,
          `Batterie: ${tradeInForm.batteryHealth || '-'}`,
          `Zustand: ${tradeInForm.condition}`,
          `Wunschmodell: ${tradeInForm.desiredProduct || '-'}`,
          `Preisvorstellung: ${tradeInForm.expectedPrice || '-'}`,
          `Zubehör: ${tradeInForm.accessories || '-'}`,
          `Dokumente vorhanden: ${tradeInForm.hasDocuments ? 'Ja' : 'Nein'}`,
          `PLZ Abholung/Besichtigung: ${tradeInForm.pickupZip || '-'}`,
          '',
          tradeInForm.message,
        ].join('\n'),
        payload: tradeInForm,
      }),
    })
    const data = await response.json()
    setLoading(false)
    if (!response.ok) {
      setMessage(data.error || 'Secondhand / Tausch Anfrage konnte nicht gesendet werden.')
      return
    }
    setTradeInForm({
      requestType: 'eintausch',
      vehicleType: 'E-Scooter',
      brandModel: '',
      year: '',
      mileage: '',
      batteryHealth: '',
      condition: 'gut',
      desiredProduct: '',
      expectedPrice: '',
      accessories: '',
      hasDocuments: true,
      pickupZip: '',
      phone: '',
      message: '',
    })
    setMessage(data.message || 'Secondhand / Tausch Anfrage wurde erfolgreich gesendet.')
  }

  async function submitEstimateRequest(event: FormEvent) {
    event.preventDefault()
    setLoading(true)
    setMessage('')
    const response = await fetch('/api/account/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        type: 'estimate',
        email: effectiveEmail,
        name: customerName,
        phone: estimateForm.phone || accountData?.account.phone,
        subject: `Kostenvoranschlag Termin: ${estimateForm.vehicleType} ${estimateForm.brandModel || ''}`.trim(),
        message: [
          `Fahrzeugtyp: ${estimateForm.vehicleType}`,
          `Marke / Modell: ${estimateForm.brandModel || '-'}`,
          `Leistung: ${estimateForm.serviceType}`,
          `Dringlichkeit: ${estimateForm.urgency}`,
          `Wunschtermin: ${estimateForm.preferredDate || '-'}`,
          `Standort: ${estimateForm.location}`,
          `Budgetrahmen: ${estimateForm.budget || '-'}`,
          `Telefon: ${estimateForm.phone || accountData?.account.phone || '-'}`,
          '',
          estimateForm.message,
        ].join('\n'),
        payload: estimateForm,
      }),
    })
    const data = await response.json()
    setLoading(false)
    if (!response.ok) {
      setMessage(data.error || 'Kostenvoranschlag-Termin konnte nicht gesendet werden.')
      return
    }
    setEstimateForm({
      vehicleType: 'E-Scooter',
      brandModel: '',
      serviceType: 'Reparatur',
      urgency: 'Normal',
      preferredDate: '',
      location: 'Dornach',
      budget: '',
      phone: '',
      message: '',
    })
    setMessage(data.message || 'Kostenvoranschlag-Termin wurde erfolgreich angefragt.')
  }

  async function lookupWarranty(event: FormEvent) {
    event.preventDefault()
    const serialNumber = warrantyLookup.serialNumber.trim()
    if (!serialNumber) return
    setWarrantyLookup((current) => ({ ...current, loading: true, error: '', result: null }))
    const response = await fetch(`/api/warranty/lookup?serial=${encodeURIComponent(serialNumber)}`, { credentials: 'include' })
    const data = await response.json()
    if (!response.ok) {
      setWarrantyLookup((current) => ({
        ...current,
        loading: false,
        error: data.error || 'Keine Garantie gefunden.',
        result: null,
      }))
      return
    }
    setWarrantyLookup((current) => ({
      ...current,
      loading: false,
      error: '',
      result: data.warranty,
    }))
  }

  async function submitReview(event: FormEvent) {
    event.preventDefault()
    setLoading(true)
    setMessage('')
    const formData = new FormData()
    formData.append('productId', reviewForm.productId)
    formData.append('customerName', customerName)
    formData.append('rating', String(reviewForm.rating))
    formData.append('title', reviewForm.title)
    formData.append('comment', reviewForm.comment)
    const response = await fetch('/api/reviews', { method: 'POST', body: formData, credentials: 'include' })
    const data = await response.json()
    setLoading(false)
    if (!response.ok) {
      setMessage(data.error || 'Bewertung konnte nicht gesendet werden.')
      return
    }
    setReviewForm({ productId: '', rating: 5, title: '', comment: '' })
    setMessage(data.message || 'Bewertung wurde zur Prüfung gesendet.')
  }

  async function startTotpSetup() {
    if (!isAuthenticated) {
      setMessage('Bitte melden Sie sich zuerst an, um Google Authenticator einzurichten.')
      return
    }
    setLoading(true)
    setMessage('')
    const response = await fetch('/api/account/totp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ action: 'setup' }),
    })
    const data = await response.json()
    setLoading(false)
    if (!response.ok) {
      setMessage(data.error || 'Google Authenticator Setup konnte nicht gestartet werden.')
      return
    }
    setTotpSetup(data.setup)
    setMessage('Google Authenticator Setup vorbereitet.')
    if (effectiveEmail) loadAccount(effectiveEmail)
  }

  async function verifyTotpSetup(event: FormEvent) {
    event.preventDefault()
    if (!isAuthenticated) {
      setMessage('Bitte melden Sie sich erneut an, um Google Authenticator zu bestätigen.')
      return
    }
    setLoading(true)
    setMessage('')
    const response = await fetch('/api/account/totp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ action: 'verify', code: totpCode }),
    })
    const data = await response.json()
    setLoading(false)
    if (!response.ok) {
      setMessage(data.error || 'Google Authenticator Code ist ungültig.')
      return
    }
    setTotpCode('')
    setTotpSetup(null)
    setRecoveryCodes(data.recoveryCodes || [])
    setMessage(data.message || 'Google Authenticator wurde aktiviert.')
    if (effectiveEmail) loadAccount(effectiveEmail)
  }

  async function disableTotp(event: FormEvent) {
    event.preventDefault()
    if (!isAuthenticated) {
      setMessage('Bitte melden Sie sich erneut an, um Google Authenticator zu deaktivieren.')
      return
    }
    setLoading(true)
    setMessage('')
    const response = await fetch('/api/account/totp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ action: 'disable', code: totpDisableCode }),
    })
    const data = await response.json()
    setLoading(false)
    if (!response.ok) {
      setMessage(data.error || 'Google Authenticator konnte nicht deaktiviert werden.')
      return
    }
    setTotpDisableCode('')
    setRecoveryCodes([])
    setMessage(data.message || 'Google Authenticator wurde deaktiviert.')
    if (effectiveEmail) loadAccount(effectiveEmail)
  }

  async function downloadInvoice(invoice: InvoiceRecord) {
    const order = accountData?.orders.find((item) => item.orderNumber === invoice.orderNumber)
    const email = order?.email || effectiveEmail
    if (!email) return
    setMessage('')
    try {
      const response = await fetch(`/api/orders/invoice?orderNumber=${encodeURIComponent(invoice.orderNumber)}&email=${encodeURIComponent(email)}`, {
        credentials: 'include',
        cache: 'no-store',
      })
      const contentType = response.headers.get('content-type') || ''
      if (!response.ok || !contentType.toLowerCase().includes('application/pdf')) {
        const text = await response.text().catch(() => '')
        setMessage(extractInvoiceDownloadError(text))
        return
      }
      const blob = await response.blob()
      if (blob.size < 100) {
        setMessage('Die PDF-Datei konnte nicht korrekt erstellt werden. Bitte versuchen Sie es erneut.')
        return
      }
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `Rechnung-${invoice.invoiceNumber || invoice.orderNumber}.pdf`
      link.click()
      window.URL.revokeObjectURL(url)
    } catch {
      setMessage('Die Rechnung konnte nicht heruntergeladen werden. Bitte versuchen Sie es erneut.')
    }
  }

  function viewInvoice(invoice: InvoiceRecord) {
    const order = accountData?.orders.find((item) => item.orderNumber === invoice.orderNumber)
    const email = order?.email || effectiveEmail
    if (!email) return
    window.open(`/api/orders/invoice?orderNumber=${encodeURIComponent(invoice.orderNumber)}&email=${encodeURIComponent(email)}&format=html`, '_blank', 'noopener,noreferrer')
  }

  const messageIsError = /\b(konnte|bitte|fehler|ungültig|keine|nicht|failed)\b/i.test(message)

  return (
    <main className="w-full bg-background text-foreground">
      <LuxuryHeader />
      <div className="account-shell relative overflow-hidden pt-28 pb-20">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/70 to-transparent" />
        <div className="pointer-events-none absolute -right-32 top-28 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-32 top-96 h-80 w-80 rounded-full bg-orange-400/10 blur-3xl" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AccountAnnouncementMarquee items={announcements} onAction={markAnnouncement} />

          <section className="account-premium-border account-surface mb-8 p-5 md:p-8">
            <div className="relative grid gap-7 lg:grid-cols-[1fr_auto] lg:items-end">
              <div className="min-w-0">
                <div className="mb-5 inline-flex items-center gap-3 rounded-full border border-accent/30 bg-accent/10 px-4 py-2">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-accent" />
                  <span className="account-kicker">MK-eMotors Dornach</span>
                </div>
                <h1 className="text-5xl font-black tracking-[-0.04em] text-white md:text-7xl">
                  Meinkonto
                </h1>
                <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300 md:text-lg">
                  Ihr persönliches Mobility Cockpit für Bestellungen, Rechnungen, Garantie, Probefahrten, Service und exklusive Kundenvorteile.
                </p>
                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <HeroMetric label="Status" value={isAuthenticated ? 'Verbunden' : 'Gast'} tone={isAuthenticated ? 'accent' : 'muted'} />
                  <HeroMetric label="Offene Orders" value={String(stats.open)} />
                  <HeroMetric label="Treuepunkte" value={String(stats.loyaltyPoints)} tone="accent" />
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-start gap-3 lg:justify-end">
                <button
                  type="button"
                  onClick={() => setActiveTab('messages')}
                  className="relative inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-white shadow-xl shadow-black/20 transition hover:border-accent/50 hover:bg-accent/10"
                  aria-label="Mitteilungen öffnen"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-accent px-1 text-xs font-black text-accent-foreground">
                      {unreadCount}
                    </span>
                  )}
                </button>
                {sessionLoading && (
                  <span className="h-12 w-32 animate-pulse rounded-2xl bg-secondary" aria-label="Anmeldestatus wird geladen" />
                )}
                {!sessionLoading && !isAuthenticated && (
                  <Link href="/sign-in" className="rounded-2xl border border-accent/60 bg-accent/10 px-5 py-3 text-sm font-black uppercase tracking-widest text-accent shadow-xl shadow-accent/10 transition hover:bg-accent hover:text-accent-foreground">
                    Anmelden
                  </Link>
                )}
                {!sessionLoading && isAuthenticated && (
                  <button
                    type="button"
                    onClick={() => logout('/')}
                    className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-3 text-sm font-black uppercase tracking-widest text-white transition hover:border-red-400/40 hover:bg-red-500/10"
                  >
                    <LogOut className="h-4 w-4" />
                    Abmelden
                  </button>
                )}
              </div>
            </div>
          </section>

          {!sessionLoading && !isAuthenticated && (
            <section className="account-surface mb-6 p-5">
              <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
                <div>
                  <p className="font-black">Bestellungen ohne Login abrufen</p>
                  <p className="mt-1 text-sm text-muted-foreground">Geben Sie die E-Mail-Adresse Ihrer Bestellung ein.</p>
                </div>
                <form onSubmit={(event) => { event.preventDefault(); loadAccount(lookupEmail) }} className="flex w-full gap-2 lg:w-auto">
                  <input
                    type="email"
                    value={lookupEmail}
                    onChange={(event) => setLookupEmail(event.target.value)}
                    placeholder="name@example.ch"
                    className="min-w-0 flex-1 rounded-2xl border border-border bg-input px-4 py-3 text-foreground outline-none focus:border-accent lg:w-80"
                    required
                  />
                  <Button variant="primary" disabled={loading}>Laden</Button>
                </form>
              </div>
            </section>
          )}

          {message && (
            <div className={`mb-6 overflow-hidden rounded-3xl border p-5 shadow-xl ${
              messageIsError
                ? 'border-destructive/40 bg-destructive/10 shadow-destructive/10'
                : 'border-accent/40 bg-[linear-gradient(135deg,rgba(38,216,114,0.18),rgba(38,216,114,0.05))] shadow-accent/10'
            }`}>
              <div className="flex items-start gap-4">
                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl shadow-lg ${
                  messageIsError
                    ? 'bg-destructive text-destructive-foreground shadow-destructive/20'
                    : 'bg-accent text-accent-foreground shadow-accent/25'
                }`}>
                  <CheckCircle2 className="h-5 w-5" />
                </span>
                <div>
                  <p className={`text-sm font-black uppercase tracking-[0.2em] ${messageIsError ? 'text-destructive' : 'text-accent'}`}>
                    {messageIsError ? 'Hinweis erforderlich' : 'Erfolgreich gesendet'}
                  </p>
                  <p className="mt-1 text-base font-bold text-foreground">{message}</p>
                </div>
              </div>
            </div>
          )}

          <div className="grid gap-8 lg:grid-cols-[18rem_1fr]">
            <aside className="account-premium-border account-surface h-fit p-4 lg:sticky lg:top-24">
              <div className="mb-4 rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.09] to-white/[0.035] p-4">
                <div className="flex items-center gap-3">
                  <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-accent text-2xl font-black text-accent-foreground shadow-xl shadow-accent/25">
                    {customerName.slice(0, 1).toUpperCase()}
                    <span className={`absolute -right-1 -top-1 h-4 w-4 rounded-full border-2 border-[#07110c] ${isAuthenticated ? 'bg-accent' : 'bg-slate-500'}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-lg font-black text-white">{customerName}</p>
                    <p className="truncate text-xs font-semibold text-slate-400">{effectiveEmail || 'Nicht verbunden'}</p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <MiniMetric label="Orders" value={accountData?.orders.length || 0} />
                  <MiniMetric label="Ausgegeben" value={formatMoney(stats.totalSpend || 0, 'CHF')} />
                </div>
              </div>
              <nav className="grid gap-2">
                {accountNavGroups.map((group) => {
                  const groupActive = group.items.some((item) => item.id === activeTab)
                  return (
                    <details key={group.label} open={groupActive} className="rounded-2xl border border-white/10 bg-white/[0.035]">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-black text-white">
                        <span>{group.label}</span>
                        <ChevronDown className="h-4 w-4 text-slate-400" />
                      </summary>
                      <div className="grid gap-1 border-t border-white/10 p-2">
                        {group.items.map(({ id, label, icon: Icon }) => (
                          <button
                            key={id}
                            onClick={() => setActiveTab(id)}
                            className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-bold transition ${
                              activeTab === id ? 'bg-accent text-accent-foreground shadow-lg shadow-accent/20' : 'text-slate-400 hover:bg-white/[0.06] hover:text-white'
                            }`}
                          >
                            <span className="flex min-w-0 items-center gap-3">
                              <Icon className="h-4 w-4 shrink-0" />
                              <span className="truncate">{label}</span>
                            </span>
                            {id === 'messages' && unreadCount > 0 && (
                              <span className="rounded-full bg-black/40 px-2 py-0.5 text-xs text-accent">{unreadCount}</span>
                            )}
                          </button>
                        ))}
                      </div>
                    </details>
                  )
                })}
              </nav>
            </aside>

            <div className="min-w-0 space-y-6">
              {activeTab === 'overview' && (
                <>
                  <div className="grid gap-4 md:grid-cols-4">
                    <StatCard label="Aktive Bestellungen" value={stats.open} />
                    <StatCard label="Abgeschlossen" value={stats.done} />
                    <StatCard label="Rechnungen" value={accountData?.invoices.length || 0} />
                    <StatCard label="Ausgegeben" value={formatMoney(stats.totalSpend || 0, 'CHF')} />
                  </div>
                  <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    <QuickTile icon={User} title="Informationen" text="Persönliche Daten verwalten" onClick={() => setActiveTab('profile')} />
                    <QuickTile icon={MapPin} title="Adressen" text={`${accountData?.account.addresses.length || 0} Adresse(n) gespeichert`} onClick={() => setActiveTab('addresses')} />
                    <QuickTile icon={Package} title="Bestellungen" text={`${accountData?.orders.length || 0} Bestellung(en)`} onClick={() => setActiveTab('orders')} />
                    <QuickTile icon={Receipt} title="Rechnungen" text={`${accountData?.invoices.length || 0} Rechnung(en)`} onClick={() => setActiveTab('invoices')} />
                    <QuickTile icon={Heart} title="Favoriten" text={`${favoriteItems.length} gespeicherte Modelle`} onClick={() => setActiveTab('wishlist')} />
                    <QuickTile icon={Scale} title="Vergleich" text={`${compareItems.length} Produkt(e) im Vergleich`} onClick={() => setActiveTab('compare')} />
                    <QuickTile icon={Calculator} title="Kostenvoranschlag" text="Online Termin für E-Motors & E-Scooter" onClick={() => setActiveTab('estimate')} />
                    <QuickTile icon={Shield} title="Garantie" text="Service- und Garantiefälle starten" onClick={() => setActiveTab('warranty')} />
                    <QuickTile icon={Gift} title="Coupons" text="Gutscheine und Treuepunkte" onClick={() => setActiveTab('rewards')} />
                    <QuickTile icon={MessageSquare} title="Mitteilungen" text={`${unreadCount} ungelesen`} onClick={() => setActiveTab('messages')} />
                  </section>
                </>
              )}

              {activeTab === 'orders' && (
                <Panel title="Meine Bestellungen">
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-black uppercase tracking-widest text-accent">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-accent" />
                    Live aktualisiert
                  </div>
                  {(accountData?.orders.length || 0) === 0 ? (
                    <EmptyState icon={Package} title="Keine Bestellungen gefunden" text="Melden Sie sich an oder laden Sie Bestellungen über Ihre E-Mail-Adresse." />
                  ) : accountData?.orders.map((order) => (
                    <div key={order.id} className="rounded-2xl border border-border/60 bg-secondary/40 p-4">
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="font-mono text-sm text-muted-foreground">{order.orderNumber}</p>
                          <h3 className="mt-1 text-xl font-black">{formatMoney(order.totalAmount, order.currency)}</h3>
                          <p className="text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleDateString('de-CH')} · {order.items?.length || 0} Produkte</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <span className="rounded-full bg-accent/15 px-3 py-1 text-xs font-black text-accent">Bestellstatus: {order.status}</span>
                          <span className="rounded-full bg-secondary px-3 py-1 text-xs font-bold text-foreground">Zahlungsstatus: {order.paymentStatus}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </Panel>
              )}

              {activeTab === 'tracking' && (
                <Panel title="Bestellung verfolgen">
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-black uppercase tracking-widest text-accent">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-accent" />
                    Live-Tracking aktiv
                  </div>
                  <form onSubmit={verifyOrder} className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
                    <input value={orderNumber} onChange={(event) => setOrderNumber(event.target.value)} placeholder="Bestellnummer" className="account-input" required />
                    <input type="email" value={orderEmail} onChange={(event) => setOrderEmail(event.target.value)} placeholder="E-Mail-Adresse" className="account-input" required />
                    <Button variant="primary" disabled={loading}><SearchCheck className="mr-2 h-4 w-4" />Prüfen</Button>
                  </form>
                  {trackedOrder && <div className="mt-6"><OrderSummaryView order={trackedOrder} email={orderEmail} /></div>}
                </Panel>
              )}

              {activeTab === 'invoices' && (
                <Panel title="Meine Rechnungen">
                  {(accountData?.invoices.length || 0) === 0 ? (
                    <EmptyState icon={FileText} title="Keine Rechnungen verfügbar" text="Rechnungen erscheinen hier, sobald sie zu Ihren Bestellungen erstellt wurden." />
                  ) : accountData?.invoices.map((invoice) => (
                    <div key={invoice.id} className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-secondary/40 p-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="font-black">{invoice.invoiceNumber}</p>
                        <p className="text-sm text-muted-foreground">Bestellung {invoice.orderNumber} · Fällig {new Date(invoice.dueDate).toLocaleDateString('de-CH')}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="font-black">{formatMoney(invoice.amount, invoice.currency)}</span>
                        <Button variant="outline" size="sm" onClick={() => viewInvoice(invoice)}><Eye className="mr-2 h-4 w-4" />Ansehen</Button>
                        <Button variant="outline" size="sm" onClick={() => downloadInvoice(invoice)}><Download className="mr-2 h-4 w-4" />PDF</Button>
                      </div>
                    </div>
                  ))}
                </Panel>
              )}

              {activeTab === 'addresses' && (
                <Panel title="Meine Adressen">
                  <form onSubmit={saveAddress} className="grid gap-3 md:grid-cols-2">
                    <AccountInput label="Vorname" value={addressForm.firstName} onChange={(value) => setAddressForm({ ...addressForm, firstName: value })} required />
                    <AccountInput label="Nachname" value={addressForm.lastName} onChange={(value) => setAddressForm({ ...addressForm, lastName: value })} required />
                    <AccountInput label="Straße" value={addressForm.street} onChange={(value) => setAddressForm({ ...addressForm, street: value })} required />
                    <AccountInput label="Hausnummer" value={addressForm.houseNumber} onChange={(value) => setAddressForm({ ...addressForm, houseNumber: value })} />
                    <AccountInput label="PLZ" value={addressForm.postalCode} onChange={(value) => setAddressForm({ ...addressForm, postalCode: value })} required />
                    <AccountInput label="Ort" value={addressForm.city} onChange={(value) => setAddressForm({ ...addressForm, city: value })} required />
                    <AccountInput label="Telefon" value={addressForm.phone} onChange={(value) => setAddressForm({ ...addressForm, phone: value })} />
                    <Button variant="primary" className="md:col-span-2" disabled={loading}>Adresse speichern</Button>
                  </form>
                  <div className="mt-6 grid gap-3 md:grid-cols-2">
                    {accountData?.account.addresses.map((address) => (
                      <div key={address.id} className="rounded-2xl border border-border/60 bg-secondary/40 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-black">{address.firstName} {address.lastName}</p>
                            <p className="text-sm text-muted-foreground">{address.street} {address.houseNumber}</p>
                            <p className="text-sm text-muted-foreground">{address.postalCode} {address.city}, {address.country}</p>
                          </div>
                          <button onClick={() => deleteAddress(address.id)} className="rounded-xl border border-red-400/30 p-2 text-red-300 hover:bg-red-500/10" aria-label="Adresse löschen">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </Panel>
              )}

              {activeTab === 'profile' && accountData && <ProfilePanel account={accountData.account} loading={loading} onSave={saveAccount} />}
              {activeTab === 'messages' && <AnnouncementList items={announcements} onAction={markAnnouncement} />}
              {activeTab === 'wishlist' && <WishlistPanel items={favoriteItems} onRemove={removeFavorite} />}
              {activeTab === 'compare' && <ComparePanel items={compareItems} onRemove={removeCompareItem} />}
              {activeTab === 'reviews' && (
                <ReviewPanel
                  products={purchasedReviewProducts}
                  form={reviewForm}
                  loading={loading}
                  onChange={(field, value) => setReviewForm((current) => ({ ...current, [field]: value }))}
                  onSubmit={submitReview}
                />
              )}
              {activeTab === 'gallery' && <GalleryPanel products={products} />}
              {activeTab === 'testdrives' && (
                <TestDrivePanel
                  form={testDriveForm}
                  loading={loading}
                  accountReady={Boolean(effectiveEmail && accountData?.account.phone)}
                  onChange={(field, value) => setTestDriveForm((current) => ({ ...current, [field]: value }))}
                  onSubmit={submitTestDrive}
                />
              )}
              {activeTab === 'financing' && (
                <FinancingPanel
                  amount={financingAmount}
                  months={financingMonths}
                  onAmount={setFinancingAmount}
                  onMonths={setFinancingMonths}
                />
              )}
              {activeTab === 'warranty' && (
                <CustomerRequestPanel
                  icon={Shield}
                  title="Garantie & Serviceantrag"
                  description="Garantieprüfung, Werkstatttermin oder technische Diagnose direkt aus dem Kundenkonto starten."
                  type="warranty"
                  form={requestForm}
                  loading={loading}
                  products={products}
                  warrantyLookup={warrantyLookup}
                  onChange={(field, value) => setRequestForm((current) => ({ ...current, [field]: value }))}
                  onLookupChange={(value) => setWarrantyLookup((current) => ({ ...current, serialNumber: value }))}
                  onLookup={lookupWarranty}
                  onSubmit={submitCustomerRequest}
                />
              )}
              {activeTab === 'returns' && (
                <CustomerRequestPanel
                  icon={RotateCcw}
                  title="Rückgabe / Retoure"
                  description="Retouren, Storno- oder Rückerstattungsanfragen mit Bestellnummer erfassen."
                  type="return"
                  form={requestForm}
                  loading={loading}
                  products={products}
                  onChange={(field, value) => setRequestForm((current) => ({ ...current, [field]: value }))}
                  onSubmit={submitCustomerRequest}
                />
              )}
              {activeTab === 'service' && (
                <ServiceMapPanel
                  onWarranty={() => setActiveTab('warranty')}
                  onService={(event) => submitCustomerRequest(event, 'service')}
                  form={requestForm}
                  loading={loading}
                  onChange={(field, value) => setRequestForm((current) => ({ ...current, [field]: value }))}
                />
              )}
              {activeTab === 'estimate' && (
                <EstimatePanel
                  form={estimateForm}
                  loading={loading}
                  accountReady={Boolean(effectiveEmail)}
                  onChange={(field, value) => setEstimateForm((current) => ({ ...current, [field]: value }))}
                  onSubmit={submitEstimateRequest}
                />
              )}
              {activeTab === 'parts' && <PartsPanel products={products} />}
              {activeTab === 'tradein' && (
                <TradeInPanel
                  form={tradeInForm}
                  loading={loading}
                  products={products}
                  onChange={(field, value) => setTradeInForm((current) => ({ ...current, [field]: value }))}
                  onSubmit={submitTradeInRequest}
                />
              )}
              {activeTab === 'rewards' && (
                <RewardsPanel
                  loading={loading}
                  form={requestForm}
                  orderCount={accountData?.orders.length || 0}
                  totalSpend={stats.totalSpend}
                  payments={rewardPayments}
                  paymentMethods={rewardPaymentMethods}
                  selectedMethods={selectedRewardMethods}
                  onChange={(field, value) => setRequestForm((current) => ({ ...current, [field]: value }))}
                  onMethodChange={(paymentId, methodId) => setSelectedRewardMethods((current) => ({ ...current, [paymentId]: methodId }))}
                  onPreparePayment={selectRewardPaymentMethod}
                  onSubmit={(event) => submitCustomerRequest(event, 'coupon')}
                />
              )}
              {activeTab === 'newsletter' && (
                <NewsletterPanel
                  loading={loading}
                  email={effectiveEmail}
                  onSubmit={(event) => submitCustomerRequest(event, 'newsletter')}
                  onChange={(value) => setRequestForm((current) => ({ ...current, subject: 'Newsletter Anmeldung', message: value }))}
                />
              )}
              {activeTab === 'support' && (
                <SupportPanel
                  form={supportForm}
                  loading={loading}
                  accountReady={Boolean(effectiveEmail)}
                  onChange={(field, value) => setSupportForm((current) => ({ ...current, [field]: value }))}
                  onSubmit={submitSupportTicket}
                />
              )}

              {activeTab === 'security' && (
                <Panel title="Sicherheit">
                  <div className="space-y-5">
                    <div className="grid gap-4 md:grid-cols-2">
                      <InfoTile title="Anmeldestatus" value={isAuthenticated ? 'Aktiv' : 'Gastzugriff'} detail="Geschützte Kontodaten erfordern Anmeldung." />
                      <InfoTile title="Passwort" value="Sicher verwaltet" detail="Die Anmeldung läuft über Better Auth." />
                    </div>
                    <GoogleAuthenticatorPanel
                      enabled={Boolean(accountData?.account.security?.twoFactorEnabled)}
                      enabledAt={accountData?.account.security?.twoFactorEnabledAt || ''}
                      lastVerifiedAt={accountData?.account.security?.twoFactorLastVerifiedAt || ''}
                      setup={totpSetup}
                      code={totpCode}
                      disableCode={totpDisableCode}
                      recoveryCodes={recoveryCodes}
                      loading={loading}
                      authenticated={isAuthenticated}
                      onStart={startTotpSetup}
                      onCodeChange={setTotpCode}
                      onDisableCodeChange={setTotpDisableCode}
                      onVerify={verifyTotpSetup}
                      onDisable={disableTotp}
                    />
                    {isAuthenticated && (
                      <Button variant="outline" onClick={() => logout('/')}><Lock className="mr-2 h-4 w-4" />Sicher abmelden</Button>
                    )}
                  </div>
                </Panel>
              )}

              {activeTab === 'settings' && (
                <Panel title="Einstellungen">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Button variant={resolvedTheme === 'dunkel' ? 'primary' : 'outline'} onClick={() => { setTheme('dunkel'); saveAccount({ theme: 'dunkel' }) }}>
                      <Moon className="mr-2 h-4 w-4" />
                      Dunkel
                    </Button>
                    <Button variant={resolvedTheme === 'hell' ? 'primary' : 'outline'} onClick={() => { setTheme('hell'); saveAccount({ theme: 'hell' }) }}>
                      <Sun className="mr-2 h-4 w-4" />
                      Hell
                    </Button>
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground">Die Auswahl wird lokal, per Cookie und im Kundenkonto gespeichert.</p>
                </Panel>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="account-premium-border account-surface-soft p-5 transition hover:-translate-y-0.5 hover:bg-white/[0.07]">
      <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-black tracking-tight text-white">{value}</p>
    </div>
  )
}

function QuickTile({ icon: Icon, title, text, onClick }: { icon: LucideIcon; title: string; text: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group min-h-40 rounded-3xl border border-white/10 bg-white/[0.045] p-5 text-left shadow-xl shadow-black/10 transition hover:-translate-y-1 hover:border-accent/50 hover:bg-white/[0.075]"
    >
      <div className="flex items-start justify-between gap-4">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-accent/25 bg-accent/10 text-accent shadow-lg shadow-accent/10 transition group-hover:bg-accent group-hover:text-accent-foreground">
          <Icon className="h-7 w-7" />
        </span>
        <span className="mt-1 h-2 w-2 rounded-full bg-accent/60 opacity-0 transition group-hover:opacity-100" />
      </div>
      <p className="mt-5 font-black uppercase tracking-[0.12em] text-white">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-400">{text}</p>
    </button>
  )
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card className="account-premium-border account-surface border-white/10 text-white">
      <CardHeader className="border-white/10">
        <div>
          <p className="account-kicker mb-2">Customer Cockpit</p>
          <CardTitle className="text-2xl font-black tracking-tight text-white md:text-3xl">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

function InfoTile({ title, value, detail }: { title: string; value: string; detail?: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">{title}</p>
      <p className="mt-2 font-black text-white">{value}</p>
      {detail && <p className="mt-1 text-sm leading-5 text-slate-400">{detail}</p>}
    </div>
  )
}

function HeroMetric({ label, value, tone = 'muted' }: { label: string; value: string; tone?: 'accent' | 'muted' }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3 shadow-lg shadow-black/10">
      <p className="text-[0.65rem] font-black uppercase tracking-[0.22em] text-slate-500">{label}</p>
      <p className={`mt-1 text-lg font-black ${tone === 'accent' ? 'text-accent' : 'text-white'}`}>{value}</p>
    </div>
  )
}

function MiniMetric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2">
      <p className="text-[0.65rem] font-black uppercase tracking-widest text-slate-500">{label}</p>
      <p className="mt-1 truncate text-sm font-black text-white">{value}</p>
    </div>
  )
}

function GoogleAuthenticatorPanel({
  enabled,
  enabledAt,
  lastVerifiedAt,
  setup,
  code,
  disableCode,
  recoveryCodes,
  loading,
  authenticated,
  onStart,
  onCodeChange,
  onDisableCodeChange,
  onVerify,
  onDisable,
}: {
  enabled: boolean
  enabledAt: string
  lastVerifiedAt: string
  setup: TotpSetup | null
  code: string
  disableCode: string
  recoveryCodes: string[]
  loading: boolean
  authenticated: boolean
  onStart: () => void
  onCodeChange: (value: string) => void
  onDisableCodeChange: (value: string) => void
  onVerify: (event: FormEvent) => void
  onDisable: (event: FormEvent) => void
}) {
  return (
    <section className="rounded-3xl border border-border/60 bg-secondary/40 p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <KeyRound className="h-10 w-10 text-accent" />
            <div>
              <h3 className="text-xl font-black">Google Authenticator</h3>
              <p className="text-sm text-muted-foreground">TOTP kompatibel: 6-stelliger Code, SHA1, 30 Sekunden.</p>
            </div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <InfoTile title="Status" value={enabled ? 'Aktiv' : 'Nicht aktiv'} detail={enabledAt ? `Aktiviert am ${formatDate(enabledAt)}` : 'Zusätzlicher Schutz noch nicht aktiviert.'} />
            <InfoTile title="Letzte Prüfung" value={lastVerifiedAt ? formatDate(lastVerifiedAt) : '-'} detail="Google Authenticator kompatibler TOTP-Code." />
          </div>
        </div>
        {!enabled && !setup && (
          <Button variant="primary" disabled={loading || !authenticated} onClick={onStart}>
            Google Authenticator aktivieren
          </Button>
        )}
      </div>

      {!authenticated && (
        <div className="mt-4 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-600 dark:text-amber-200">
          <p className="font-bold">Bitte melden Sie sich an, um Google Authenticator einzurichten.</p>
          <Link href="/sign-in" className="mt-3 inline-flex rounded-xl border border-amber-400/40 px-4 py-2 text-xs font-black uppercase tracking-widest transition hover:bg-amber-400/10">
            Anmelden
          </Link>
        </div>
      )}

      {setup && (
        <form onSubmit={onVerify} className="mt-5 space-y-4 rounded-3xl border border-accent/30 bg-accent/10 p-5">
          <div>
            <p className="font-black">1. QR-Code mit Google Authenticator scannen</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Öffnen Sie Google Authenticator, wählen Sie “QR-Code scannen” und scannen Sie diesen Code.
            </p>
          </div>
          <div className="grid gap-4 lg:grid-cols-[auto_1fr]">
            <div className="rounded-3xl border border-border/60 bg-white p-4 shadow-sm">
              {setup.qrDataUrl ? (
                <img
                  src={setup.qrDataUrl}
                  alt="Google Authenticator QR-Code"
                  className="aspect-square w-56 max-w-full"
                />
              ) : (
                <div className="grid aspect-square w-56 max-w-full place-items-center text-center text-sm font-bold text-neutral-500">
                  QR-Code konnte nicht geladen werden.
                </div>
              )}
            </div>
            <div className="grid gap-3">
              <InfoTile title="Konto" value={setup.accountName} detail={setup.issuer} />
              <div className="rounded-2xl border border-border/60 bg-card/90 p-4">
                <p className="text-sm text-muted-foreground">Manueller Secret Key</p>
                <p className="mt-2 break-all font-mono text-lg font-black tracking-widest">{setup.secret}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Falls das Scannen nicht möglich ist, kann dieser Key in Google Authenticator manuell eingegeben werden.
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-border/60 bg-card/90 p-4">
            <p className="text-sm text-muted-foreground">otpauth URI</p>
            <p className="mt-2 break-all font-mono text-xs">{setup.otpauthUri}</p>
          </div>
          <label className="block space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">2. 6-stelligen Code eingeben</span>
            <input
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              value={code}
              onChange={(event) => onCodeChange(event.target.value.replace(/\D/g, '').slice(0, 6))}
              className="account-input"
              placeholder="123456"
              required
            />
          </label>
          <Button variant="primary" disabled={loading || code.length !== 6}>Code prüfen und aktivieren</Button>
        </form>
      )}

      {recoveryCodes.length > 0 && (
        <div className="mt-5 rounded-3xl border border-border/60 bg-card/90 p-5">
          <p className="font-black">Recovery Codes</p>
          <p className="mt-1 text-sm text-muted-foreground">Diese Codes sicher aufbewahren. Sie werden nur einmal angezeigt.</p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {recoveryCodes.map((item) => (
              <code key={item} className="rounded-xl border border-border/60 bg-secondary/60 px-3 py-2 font-mono text-sm">{item}</code>
            ))}
          </div>
        </div>
      )}

      {enabled && (
        <form onSubmit={onDisable} className="mt-5 rounded-3xl border border-red-400/30 bg-red-500/10 p-5">
          <p className="font-black text-red-300">Google Authenticator deaktivieren</p>
          <p className="mt-1 text-sm text-muted-foreground">Zur Sicherheit muss ein aktueller 6-stelliger Code eingegeben werden.</p>
          <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
            <input
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              value={disableCode}
              onChange={(event) => onDisableCodeChange(event.target.value.replace(/\D/g, '').slice(0, 6))}
              className="account-input"
              placeholder="123456"
              required
            />
            <Button variant="outline" disabled={loading || disableCode.length !== 6}>Deaktivieren</Button>
          </div>
        </form>
      )}
    </section>
  )
}

function EmptyState({ icon: Icon, title, text }: { icon: LucideIcon; title: string; text: string }) {
  return (
    <div className="py-12 text-center">
      <Icon className="mx-auto mb-4 h-14 w-14 text-muted-foreground" />
      <p className="font-black">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{text}</p>
    </div>
  )
}

function AccountAnnouncementMarquee({ items, onAction }: { items: Announcement[]; onAction: (id: string, action?: 'read' | 'dismiss') => void }) {
  if (items.length === 0) return null

  const visible = items.slice(0, 6)
  const marqueeText = visible.map((item) => `${item.priority.toUpperCase()}: ${item.title}`).join('   •   ')

  return (
    <section className="mb-5 overflow-hidden rounded-3xl border border-accent/30 bg-accent/10 shadow-xl shadow-shadow/10" aria-label="Aktuelle Mitteilungen">
      <div className="flex flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between">
        <button
          type="button"
          onClick={() => onAction(visible[0].id, 'read')}
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
        >
          <Bell className="h-5 w-5 shrink-0 text-accent" />
          <div className="min-w-0 overflow-hidden">
            <div className="account-announcement-marquee whitespace-nowrap text-sm font-black uppercase tracking-widest text-accent">
              <span className="inline-block pr-12">{marqueeText}</span>
              <span className="inline-block pr-12" aria-hidden="true">{marqueeText}</span>
            </div>
          </div>
        </button>
        <div className="flex shrink-0 items-center gap-2">
          {visible[0]?.buttonUrl && (
            <Link href={visible[0].buttonUrl} className="rounded-full border border-accent/50 px-4 py-2 text-xs font-black uppercase tracking-widest text-accent hover:bg-accent/10">
              {visible[0].buttonText || 'Öffnen'}
            </Link>
          )}
          <button
            type="button"
            onClick={() => onAction(visible[0].id, 'dismiss')}
            className="rounded-full border border-border/60 px-4 py-2 text-xs font-black uppercase tracking-widest text-muted-foreground hover:bg-secondary"
          >
            Ausblenden
          </button>
        </div>
      </div>
    </section>
  )
}

function AccountInput({ label, value, onChange, required = false }: { label: string; value: string; onChange: (value: string) => void; required?: boolean }) {
  return (
    <label className="space-y-2">
      <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={label} className="account-input" required={required} />
    </label>
  )
}

function ProfilePanel({ account, loading, onSave }: { account: CustomerAccountRecord; loading: boolean; onSave: (data: Record<string, unknown>) => void }) {
  const [form, setForm] = useState({
    firstName: account.firstName || '',
    lastName: account.lastName || '',
    company: account.company || '',
    phone: account.phone || '',
    preferredLanguage: account.preferredLanguage,
  })
  return (
    <Panel title="Persönliche Daten">
      <form
        onSubmit={(event) => {
          event.preventDefault()
          onSave(form)
        }}
        className="grid gap-3 md:grid-cols-2"
      >
        <AccountInput label="Vorname" value={form.firstName} onChange={(value) => setForm({ ...form, firstName: value })} />
        <AccountInput label="Nachname" value={form.lastName} onChange={(value) => setForm({ ...form, lastName: value })} />
        <AccountInput label="Firma" value={form.company} onChange={(value) => setForm({ ...form, company: value })} />
        <AccountInput label="Telefon" value={form.phone} onChange={(value) => setForm({ ...form, phone: value })} />
        <select value={form.preferredLanguage} onChange={(event) => setForm({ ...form, preferredLanguage: event.target.value as 'de' | 'en' | 'tr' })} className="account-input">
          <option value="de">Deutsch</option>
          <option value="en">English</option>
          <option value="tr">Türkçe</option>
        </select>
        <Button variant="primary" className="md:col-span-2" disabled={loading}>Speichern</Button>
      </form>
    </Panel>
  )
}

function AnnouncementList({ items, onAction, compact = false }: { items: Announcement[]; onAction: (id: string, action?: 'read' | 'dismiss') => void; compact?: boolean }) {
  if (items.length === 0) {
    return (
      <Panel title="Mitteilungen">
        <EmptyState icon={Bell} title="Keine Mitteilungen" text="Aktuelle Hinweise erscheinen hier automatisch." />
      </Panel>
    )
  }

  return (
    <Panel title={compact ? 'Aktuelle Mitteilungen' : 'Mitteilungen'}>
      <div className="space-y-3">
        {items.map((item) => (
          <article key={item.id} className="rounded-2xl border border-border/60 bg-secondary/40 p-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full px-3 py-1 text-xs font-black text-accent-foreground" style={{ backgroundColor: item.accentColor || '#26D872' }}>{item.priority}</span>
                  {!item.isRead && <span className="rounded-full bg-accent/15 px-3 py-1 text-xs font-black text-accent">Neu</span>}
                </div>
                <h3 className="mt-3 text-lg font-black">{item.title}</h3>
                {item.excerpt ? (
                  <p className="mt-2 text-sm text-muted-foreground">{item.excerpt}</p>
                ) : (
                  <div
                    className="managed-page-content mt-2 text-sm text-muted-foreground"
                    dangerouslySetInnerHTML={{ __html: item.content }}
                  />
                )}
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                {item.buttonUrl && (
                  <Link href={item.buttonUrl} className="rounded-xl border border-accent/50 px-3 py-2 text-xs font-black uppercase tracking-widest text-accent hover:bg-accent/10">
                    {item.buttonText || 'Öffnen'}
                  </Link>
                )}
                {!item.isRead && (
                  <button onClick={() => onAction(item.id, 'read')} className="rounded-xl border border-border/60 px-3 py-2 text-xs font-black uppercase tracking-widest text-foreground hover:bg-secondary">
                    Gelesen
                  </button>
                )}
                {item.dismissible && (
                  <button onClick={() => onAction(item.id, 'dismiss')} className="rounded-xl border border-border/60 px-3 py-2 text-xs font-black uppercase tracking-widest text-foreground hover:bg-secondary">
                    Ausblenden
                  </button>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </Panel>
  )
}

function TestDrivePanel({
  form,
  loading,
  accountReady,
  onChange,
  onSubmit,
}: {
  form: { date: string; productName: string; message: string }
  loading: boolean
  accountReady: boolean
  onChange: (field: 'date' | 'productName' | 'message', value: string) => void
  onSubmit: (event: FormEvent) => void
}) {
  return (
    <Panel title="Probefahrten">
      <div className="grid gap-5 lg:grid-cols-[1fr_0.8fr]">
        <form onSubmit={onSubmit} className="space-y-4 rounded-3xl border border-border/60 bg-secondary/40 p-5">
          <div>
            <p className="font-black">Probefahrt anfragen</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Wir prüfen Ihren Termin und bestätigen die Probefahrt persönlich.
            </p>
          </div>
          {!accountReady && (
            <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-600 dark:text-amber-200">
              Für eine Probefahrt benötigen wir E-Mail und Telefonnummer im Kundenprofil.
            </div>
          )}
          <AccountInput label="Wunschmodell" value={form.productName} onChange={(value) => onChange('productName', value)} />
          <label className="space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Wunschtermin</span>
            <input type="datetime-local" value={form.date} onChange={(event) => onChange('date', event.target.value)} className="account-input" required />
          </label>
          <label className="space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Nachricht</span>
            <textarea value={form.message} onChange={(event) => onChange('message', event.target.value)} className="account-input min-h-32" placeholder="Führerausweis, gewünschtes Modell, Fragen..." />
          </label>
          <Button variant="primary" disabled={loading || !accountReady}>Probefahrt senden</Button>
        </form>
        <div className="rounded-3xl border border-border/60 bg-secondary/40 p-5">
          <CalendarDays className="h-12 w-12 text-accent" />
          <h3 className="mt-4 text-xl font-black">Ablauf</h3>
          <div className="mt-4 space-y-3 text-sm text-muted-foreground">
            <p><strong className="text-foreground">1.</strong> Anfrage senden</p>
            <p><strong className="text-foreground">2.</strong> MK-eMotors bestätigt den Termin</p>
            <p><strong className="text-foreground">3.</strong> Probefahrt in Dornach durchführen</p>
          </div>
        </div>
      </div>
    </Panel>
  )
}

function EstimatePanel({
  form,
  loading,
  accountReady,
  onChange,
  onSubmit,
}: {
  form: {
    vehicleType: string
    brandModel: string
    serviceType: string
    urgency: string
    preferredDate: string
    location: string
    budget: string
    phone: string
    message: string
  }
  loading: boolean
  accountReady: boolean
  onChange: (field: keyof typeof form, value: string) => void
  onSubmit: (event: FormEvent) => void
}) {
  return (
    <Panel title="Online Kostenvoranschlag Termin">
      <div className="grid gap-5 xl:grid-cols-[1fr_0.75fr]">
        <form onSubmit={onSubmit} className="space-y-4 rounded-3xl border border-border/60 bg-secondary/40 p-5">
          <div>
            <p className="font-black">Kostenvoranschlag für E-Motors & E-Scooter</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Beschreiben Sie Ihr Fahrzeug und den gewünschten Service. Wir bestätigen den Termin persönlich und bereiten die Einschätzung vor.
            </p>
          </div>
          {!accountReady && (
            <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-600 dark:text-amber-200">
              Bitte melden Sie sich an oder laden Sie Ihr Kundenkonto, damit wir den Termin zuordnen können.
            </div>
          )}
          <div className="grid gap-3 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Fahrzeugtyp</span>
              <select value={form.vehicleType} onChange={(event) => onChange('vehicleType', event.target.value)} className="account-input">
                <option>E-Scooter</option>
                <option>E-Moped</option>
                <option>E-Motorrad</option>
                <option>Kabinenroller</option>
                <option>Akku / Ladegerät</option>
                <option>Zubehör / Ersatzteil</option>
              </select>
            </label>
            <AccountInput label="Marke / Modell" value={form.brandModel} onChange={(value) => onChange('brandModel', value)} required />
            <label className="space-y-2">
              <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Leistung</span>
              <select value={form.serviceType} onChange={(event) => onChange('serviceType', event.target.value)} className="account-input">
                <option>Reparatur</option>
                <option>Diagnose</option>
                <option>Unfall / Schaden</option>
                <option>Akku Prüfung</option>
                <option>Umbau / Zubehör Montage</option>
                <option>Service / Wartung</option>
                <option>Vor-Kauf Prüfung</option>
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Dringlichkeit</span>
              <select value={form.urgency} onChange={(event) => onChange('urgency', event.target.value)} className="account-input">
                <option>Normal</option>
                <option>Diese Woche</option>
                <option>Dringend</option>
                <option>Nur Beratung</option>
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Wunschtermin</span>
              <input type="datetime-local" value={form.preferredDate} onChange={(event) => onChange('preferredDate', event.target.value)} className="account-input" required />
            </label>
            <label className="space-y-2">
              <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Standort</span>
              <select value={form.location} onChange={(event) => onChange('location', event.target.value)} className="account-input">
                <option>Dornach</option>
                <option>Basel Abholpunkt</option>
                <option>Mobile Besichtigung anfragen</option>
                <option>Online Vorabklärung</option>
              </select>
            </label>
            <AccountInput label="Budgetrahmen optional" value={form.budget} onChange={(value) => onChange('budget', value)} />
            <AccountInput label="Telefon" value={form.phone} onChange={(value) => onChange('phone', value)} />
          </div>
          <textarea value={form.message} onChange={(event) => onChange('message', event.target.value)} className="account-input min-h-36" placeholder="Was soll geprüft werden? Fehlerbild, Geräusche, Fotos vorhanden, Seriennummer, bisherige Reparaturen..." required />
          <Button variant="primary" disabled={loading || !accountReady}>Termin anfragen</Button>
        </form>

        <div className="rounded-3xl border border-border/60 bg-secondary/40 p-5">
          <Calculator className="h-12 w-12 text-accent" />
          <h3 className="mt-4 text-xl font-black">Professioneller Ablauf</h3>
          <div className="mt-4 space-y-3 text-sm text-muted-foreground">
            <p><strong className="text-foreground">1.</strong> Online Termin und Fahrzeugdaten senden</p>
            <p><strong className="text-foreground">2.</strong> Vorprüfung durch MK-eMotors Team</p>
            <p><strong className="text-foreground">3.</strong> Besichtigung, Diagnose oder Kostenschätzung</p>
            <p><strong className="text-foreground">4.</strong> Transparenter Kostenvoranschlag mit nächstem Schritt</p>
          </div>
          <div className="mt-5 rounded-2xl border border-accent/30 bg-accent/10 p-4 text-sm text-muted-foreground">
            Geeignet für E-Scooter, E-Mopeds, E-Motorräder, Akkus, Ladegeräte, Zubehör und Ersatzteile.
          </div>
        </div>
      </div>
    </Panel>
  )
}

function SupportPanel({
  form,
  loading,
  accountReady,
  onChange,
  onSubmit,
}: {
  form: { subject: string; category: string; message: string }
  loading: boolean
  accountReady: boolean
  onChange: (field: 'subject' | 'category' | 'message', value: string) => void
  onSubmit: (event: FormEvent) => void
}) {
  return (
    <Panel title="Support">
      <div className="grid gap-5 xl:grid-cols-[1fr_0.9fr]">
        <form onSubmit={onSubmit} className="space-y-4 rounded-3xl border border-border/60 bg-secondary/40 p-5">
          <div>
            <p className="font-black">Ticket erstellen</p>
            <p className="mt-1 text-sm text-muted-foreground">Ihre Anfrage wird als Support-Ticket an MK-eMotors gesendet.</p>
          </div>
          {!accountReady && (
            <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-600 dark:text-amber-200">
              Bitte melden Sie sich an oder laden Sie Ihr Kundenkonto, damit wir Sie erreichen können.
            </div>
          )}
          <AccountInput label="Betreff" value={form.subject} onChange={(value) => onChange('subject', value)} required />
          <label className="space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Kategorie</span>
            <select value={form.category} onChange={(event) => onChange('category', event.target.value)} className="account-input">
              <option>Allgemeine Anfrage</option>
              <option>Bestellung</option>
              <option>Rechnung</option>
              <option>Lieferung</option>
              <option>Garantie / Service</option>
              <option>Finanzierung</option>
            </select>
          </label>
          <label className="space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Nachricht</span>
            <textarea value={form.message} onChange={(event) => onChange('message', event.target.value)} className="account-input min-h-36" required />
          </label>
          <Button variant="primary" disabled={loading || !accountReady}>Ticket senden</Button>
        </form>
        <div className="grid gap-4">
          <div className="rounded-3xl border border-border/60 bg-secondary/40 p-5">
            <Headphones className="h-10 w-10 text-accent" />
            <h3 className="mt-4 text-lg font-black">Schnellkontakt</h3>
            <div className="mt-4 grid gap-3 text-sm">
              <a href="tel:+41617015050" className="rounded-2xl border border-border/60 px-4 py-3 font-bold hover:bg-secondary">+41 61 701 50 50</a>
              <a href="mailto:info@mk-emotorsdornach.ch" className="rounded-2xl border border-border/60 px-4 py-3 font-bold hover:bg-secondary">info@mk-emotorsdornach.ch</a>
              <Link href="/contact" className="rounded-2xl border border-accent/50 px-4 py-3 font-bold text-accent hover:bg-accent/10">Kontaktseite öffnen</Link>
            </div>
          </div>
          <div className="rounded-3xl border border-border/60 bg-secondary/40 p-5">
            <MessageSquare className="h-10 w-10 text-accent" />
            <h3 className="mt-4 text-lg font-black">Ticket-Status</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Neue Tickets werden direkt an das Team übermittelt. Antworten erhalten Sie per E-Mail oder Telefon.
            </p>
          </div>
        </div>
      </div>
    </Panel>
  )
}

function WishlistPanel({ items, onRemove }: { items: Array<{ id: string; title: string; price: number; image?: string | null; handle?: string }>; onRemove: (id: string) => void }) {
  return (
    <Panel title="Favoriten / Wunschliste">
      {items.length === 0 ? (
        <EmptyState icon={Heart} title="Keine Favoriten gespeichert" text="Markieren Sie Produkte im Shop mit dem Herz, damit sie hier erscheinen." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <article key={item.id} className="overflow-hidden rounded-3xl border border-border/60 bg-secondary/40">
              <Link href={`/produkte/${item.handle || item.id}`} className="block">
                <div className="aspect-[4/3] bg-secondary">
                  {item.image ? <img src={item.image} alt={item.title} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Kein Bild</div>}
                </div>
                <div className="p-4">
                  <h3 className="line-clamp-2 font-black">{item.title}</h3>
                  <p className="mt-2 text-lg font-black text-accent">{formatMoney(item.price, 'CHF')}</p>
                </div>
              </Link>
              <div className="border-t border-border/60 p-3">
                <button onClick={() => onRemove(item.id)} className="w-full rounded-2xl border border-border/60 px-4 py-2 text-sm font-black hover:bg-secondary">
                  Entfernen
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </Panel>
  )
}

function ComparePanel({ items, onRemove }: { items: CompareItem[]; onRemove: (id: string) => void }) {
  const rows = [
    ['Preis', (item: CompareItem) => formatMoney(item.price || 0, 'CHF')],
    ['Marke', (item: CompareItem) => item.brand || 'MK-eMotors'],
    ['Leistung', (item: CompareItem) => item.power_watts ? `${item.power_watts} W` : 'Nach Modell'],
    ['Reichweite', (item: CompareItem) => item.range_km ? `${item.range_km} km` : 'Nach Modell'],
    ['Speed', (item: CompareItem) => item.max_speed ? `${item.max_speed} km/h` : 'Nach Modell'],
  ] as const

  return (
    <Panel title="Produktvergleich">
      {items.length === 0 ? (
        <div className="rounded-3xl border border-border/60 bg-secondary/40 p-8 text-center">
          <Scale className="mx-auto h-14 w-14 text-accent" />
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">Nutzen Sie das Waage-Symbol auf Produktkarten, um bis zu vier Modelle zu vergleichen.</p>
          <Link href="/produkte" className="mt-6 inline-flex rounded-2xl bg-accent px-6 py-3 text-sm font-black uppercase tracking-widest text-accent-foreground">
            Zum Shop
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {items.map((item) => (
              <article key={item.id} className="rounded-3xl border border-border/60 bg-secondary/40 p-4">
                <Link href={`/produkte/${item.slug}`} className="block">
                  <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-secondary">
                    {item.image ? <img src={item.image} alt={item.title} className="h-full w-full object-cover" /> : null}
                  </div>
                  <h3 className="mt-3 line-clamp-2 font-black">{item.title}</h3>
                </Link>
                <button onClick={() => onRemove(item.id)} className="mt-3 text-sm font-bold text-muted-foreground hover:text-foreground">Aus Vergleich entfernen</button>
              </article>
            ))}
          </div>
          <div className="overflow-x-auto rounded-3xl border border-border/60">
            <table className="w-full min-w-[42rem] text-left text-sm">
              <tbody>
                {rows.map(([label, render]) => (
                  <tr key={label} className="border-b border-border/60 last:border-0">
                    <th className="bg-secondary/60 p-4 font-black">{label}</th>
                    {items.map((item) => <td key={`${label}-${item.id}`} className="p-4">{render(item)}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Panel>
  )
}

function ReviewPanel({
  products,
  form,
  loading,
  onChange,
  onSubmit,
}: {
  products: ShopProduct[]
  form: { productId: string; rating: number; title: string; comment: string }
  loading: boolean
  onChange: (field: 'productId' | 'rating' | 'title' | 'comment', value: string | number) => void
  onSubmit: (event: FormEvent) => void
}) {
  const hasPurchasedProducts = products.length > 0

  return (
    <Panel title="Bewertungen & Erfahrungen">
      {!hasPurchasedProducts && (
        <div className="mb-4 rounded-3xl border border-border/60 bg-secondary/40 p-5 text-sm font-semibold text-muted-foreground">
          Bewertungen können nur für Produkte geschrieben werden, die in Ihren Bestellungen vorhanden sind.
        </div>
      )}
      <form onSubmit={onSubmit} className="grid gap-4 rounded-3xl border border-border/60 bg-secondary/40 p-5">
        <select value={form.productId} onChange={(event) => onChange('productId', event.target.value)} className="account-input" required disabled={!hasPurchasedProducts}>
          <option value="">Produkt auswählen</option>
          {products.map((product) => <option key={product.id} value={product.id}>{product.title}</option>)}
        </select>
        <label className="space-y-2">
          <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Bewertung</span>
          <input type="range" min="1" max="5" value={form.rating} onChange={(event) => onChange('rating', Number(event.target.value))} className="w-full accent-[var(--color-accent)]" />
          <span className="flex gap-1 text-warning">{Array.from({ length: 5 }).map((_, index) => <Star key={index} className={`h-5 w-5 ${index < form.rating ? 'fill-warning' : 'text-muted-foreground/40'}`} />)}</span>
        </label>
        <AccountInput label="Titel" value={form.title} onChange={(value) => onChange('title', value)} required />
        <label className="space-y-2">
          <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Erfahrung</span>
          <textarea value={form.comment} onChange={(event) => onChange('comment', event.target.value)} className="account-input min-h-36" required />
        </label>
        <Button variant="primary" disabled={loading || !hasPurchasedProducts}>Bewertung senden</Button>
      </form>
    </Panel>
  )
}

function GalleryPanel({ products }: { products: ShopProduct[] }) {
  const mediaProducts = products.filter((product) => product.image || (product.images?.length || 0) > 0).slice(0, 9)
  return (
    <Panel title="Galerie & Video">
      <div className="grid gap-4 md:grid-cols-3">
        {mediaProducts.map((product) => (
          <Link key={product.id} href={`/produkte/${product.slug}`} className="group overflow-hidden rounded-3xl border border-border/60 bg-secondary/40">
            <div className="aspect-video bg-secondary">
              <img src={(product.images?.[0] || product.image || '')} alt={product.title} className="h-full w-full object-cover transition group-hover:scale-105" />
            </div>
            <div className="p-4">
              <p className="font-black">{product.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">Bilder, Details und Produktvideo öffnen</p>
            </div>
          </Link>
        ))}
      </div>
    </Panel>
  )
}

function FinancingPanel({ amount, months, onAmount, onMonths }: { amount: number; months: number; onAmount: (value: number) => void; onMonths: (value: number) => void }) {
  const interest = 0.079
  const monthly = Math.max(0, (amount * (1 + interest)) / months)
  return (
    <Panel title="Finanzierung & Ratenrechner">
      <div className="grid gap-5 lg:grid-cols-[1fr_0.8fr]">
        <div className="space-y-4 rounded-3xl border border-border/60 bg-secondary/40 p-5">
          <AccountInput label="Betrag CHF" value={String(amount)} onChange={(value) => onAmount(Number(value) || 0)} />
          <label className="space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Laufzeit</span>
            <select value={months} onChange={(event) => onMonths(Number(event.target.value))} className="account-input">
              <option value={6}>6 Monate</option>
              <option value={12}>12 Monate</option>
              <option value={24}>24 Monate</option>
              <option value={36}>36 Monate</option>
            </select>
          </label>
        </div>
        <div className="rounded-3xl border border-accent/30 bg-accent/10 p-5">
          <CreditCard className="h-12 w-12 text-accent" />
          <p className="mt-4 text-sm text-muted-foreground">Unverbindliche Monatsrate</p>
          <p className="mt-2 text-4xl font-black">{formatMoney(monthly, 'CHF')}</p>
          <p className="mt-3 text-sm text-muted-foreground">Die finale Prüfung erfolgt durch MK-eMotors und den Zahlungsanbieter.</p>
        </div>
      </div>
    </Panel>
  )
}

type TradeInFormState = {
  requestType: string
  vehicleType: string
  brandModel: string
  year: string
  mileage: string
  batteryHealth: string
  condition: string
  desiredProduct: string
  expectedPrice: string
  accessories: string
  hasDocuments: boolean
  pickupZip: string
  phone: string
  message: string
}

function TradeInPanel({
  form,
  loading,
  products,
  onChange,
  onSubmit,
}: {
  form: TradeInFormState
  loading: boolean
  products: ShopProduct[]
  onChange: (field: keyof TradeInFormState, value: string | boolean) => void
  onSubmit: (event: FormEvent) => void
}) {
  const conditionLabels: Record<string, string> = {
    sehr_gut: 'Sehr gut',
    gut: 'Gut',
    gebraucht: 'Gebraucht',
    reparatur: 'Reparatur nötig',
  }
  const requestLabels: Record<string, string> = {
    eintausch: 'Eintausch gegen neues Modell',
    direktankauf: 'Direktankauf anfragen',
    kommission: 'Verkauf in Kommission',
  }

  return (
    <Panel title="Secondhand / Tausch">
      <div className="grid gap-5 xl:grid-cols-[0.82fr_1.18fr]">
        <section className="space-y-4 rounded-3xl border border-accent/30 bg-accent/10 p-5">
          <Repeat2 className="h-12 w-12 text-accent" />
          <div>
            <h3 className="text-2xl font-black">MK Secondhand Check</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Professionelle Bewertung für E-Scooter, E-Bikes und E-Motorräder. Wir prüfen Zustand, Akku, Dokumente und erstellen ein realistisches Angebot.
            </p>
          </div>
          <div className="grid gap-3">
            {[
              ['1', 'Fahrzeugdaten erfassen', 'Modell, Baujahr, Kilometer und Akkuangaben.'],
              ['2', 'Vorprüfung durch MK-eMotors', 'Wir prüfen Marktwert, Zustand und Wiederverkauf.'],
              ['3', 'Angebot oder Tauschvorschlag', 'Direktankauf, Kommission oder Verrechnung mit neuem Modell.'],
            ].map(([step, title, text]) => (
              <div key={step} className="grid grid-cols-[2.5rem_1fr] gap-3 rounded-2xl border border-border/60 bg-card/80 p-4">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-accent text-sm font-black text-accent-foreground">{step}</span>
                <span>
                  <span className="block font-black">{title}</span>
                  <span className="text-sm text-muted-foreground">{text}</span>
                </span>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-border/60 bg-card/80 p-4">
            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Aktuelle Auswahl</p>
            <p className="mt-2 font-black">{requestLabels[form.requestType] || form.requestType}</p>
            <p className="text-sm text-muted-foreground">{form.brandModel || form.vehicleType} · {conditionLabels[form.condition] || form.condition}</p>
          </div>
        </section>

        <form onSubmit={onSubmit} className="grid gap-4 rounded-3xl border border-border/60 bg-secondary/40 p-5">
          <div className="grid gap-3 md:grid-cols-3">
            {Object.entries(requestLabels).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => onChange('requestType', value)}
                className={`rounded-2xl border px-4 py-3 text-left text-sm font-black transition ${form.requestType === value ? 'border-accent bg-accent text-accent-foreground' : 'border-border/60 bg-card/70 text-foreground hover:border-accent/50'}`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Fahrzeugtyp</span>
              <select value={form.vehicleType} onChange={(event) => onChange('vehicleType', event.target.value)} className="account-input">
                <option>E-Scooter</option>
                <option>E-Bike</option>
                <option>E-Motorrad</option>
                <option>Akku / Zubehör</option>
              </select>
            </label>
            <AccountInput label="Marke / Modell" value={form.brandModel} onChange={(value) => onChange('brandModel', value)} required />
            <AccountInput label="Baujahr" value={form.year} onChange={(value) => onChange('year', value)} />
            <AccountInput label="Kilometerstand" value={form.mileage} onChange={(value) => onChange('mileage', value)} />
            <AccountInput label="Akku-Zustand / Reichweite" value={form.batteryHealth} onChange={(value) => onChange('batteryHealth', value)} />
            <AccountInput label="Preisvorstellung CHF" value={form.expectedPrice} onChange={(value) => onChange('expectedPrice', value)} />
          </div>

          <div className="grid gap-3 md:grid-cols-4">
            {Object.entries(conditionLabels).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => onChange('condition', value)}
                className={`rounded-2xl border px-4 py-3 text-sm font-black transition ${form.condition === value ? 'border-accent bg-accent/20 text-accent' : 'border-border/60 bg-card/70 text-muted-foreground hover:text-foreground'}`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Wunschmodell für Tausch</span>
              <select value={form.desiredProduct} onChange={(event) => onChange('desiredProduct', event.target.value)} className="account-input">
                <option value="">Noch offen</option>
                {products.map((product) => <option key={product.id} value={product.title}>{product.title}</option>)}
              </select>
            </label>
            <AccountInput label="PLZ für Besichtigung / Abholung" value={form.pickupZip} onChange={(value) => onChange('pickupZip', value)} />
            <AccountInput label="Telefon" value={form.phone} onChange={(value) => onChange('phone', value)} />
            <AccountInput label="Zubehör / Ladegerät / Schlüssel" value={form.accessories} onChange={(value) => onChange('accessories', value)} />
          </div>

          <label className="flex items-start gap-3 rounded-2xl border border-border/60 bg-card/70 p-4 text-sm">
            <input
              type="checkbox"
              checked={form.hasDocuments}
              onChange={(event) => onChange('hasDocuments', event.target.checked)}
              className="mt-1"
            />
            <span>
              <span className="block font-black">Kaufbeleg / Fahrzeugpapiere vorhanden</span>
              <span className="text-muted-foreground">Hilft bei Garantieprüfung, Herkunftsnachweis und schneller Bewertung.</span>
            </span>
          </label>

          <label className="space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Bemerkungen</span>
            <textarea
              value={form.message}
              onChange={(event) => onChange('message', event.target.value)}
              className="account-input min-h-36"
              placeholder="Schäden, Umbauten, Servicehistorie, gewünschter Ablauf..."
              required
            />
          </label>

          <Button variant="primary" disabled={loading}>
            Secondhand / Tausch Anfrage senden
          </Button>
        </form>
      </div>
    </Panel>
  )
}

type RequestFormState = { product: string; orderNumber: string; serialNumber: string; subject: string; message: string; phone: string }

function CustomerRequestPanel({
  icon: Icon,
  title,
  description,
  type,
  form,
  loading,
  products,
  warrantyLookup,
  onChange,
  onLookupChange,
  onLookup,
  onSubmit,
}: {
  icon: LucideIcon
  title: string
  description: string
  type: 'warranty' | 'service' | 'return' | 'trade_in' | 'coupon' | 'newsletter'
  form: RequestFormState
  loading: boolean
  products: ShopProduct[]
  warrantyLookup?: {
    serialNumber: string
    loading: boolean
    error: string
    result: WarrantyLookupResult | null
  }
  onChange: (field: keyof RequestFormState, value: string) => void
  onLookupChange?: (value: string) => void
  onLookup?: (event: FormEvent) => void
  onSubmit: (event: FormEvent, type: 'warranty' | 'service' | 'return' | 'trade_in' | 'coupon' | 'newsletter') => void
}) {
  return (
    <Panel title={title}>
      <div className="space-y-5">
        {type === 'warranty' && warrantyLookup && onLookup && onLookupChange && (
          <section className="rounded-3xl border border-accent/30 bg-accent/10 p-5">
            <div className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
              <div>
                <ShieldCheck className="h-12 w-12 text-accent" />
                <h3 className="mt-4 text-xl font-black">Garantie automatisch prüfen</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Seriennummer / Fahrzeugnummer eingeben und sofort sehen, bis wann die Garantie läuft.
                </p>
              </div>
              <div className="space-y-3">
                <form onSubmit={onLookup} className="grid gap-3 md:grid-cols-[1fr_auto]">
                  <input
                    value={warrantyLookup.serialNumber}
                    onChange={(event) => onLookupChange(event.target.value)}
                    className="account-input"
                    placeholder="SERIENNUMMER / FAHRZEUGNUMMER"
                    required
                  />
                  <Button variant="primary" disabled={warrantyLookup.loading}>
                    {warrantyLookup.loading ? 'Prüfen...' : 'Garantie prüfen'}
                  </Button>
                </form>
                {warrantyLookup.error && (
                  <div className="rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-sm font-bold text-red-300">
                    {warrantyLookup.error}
                  </div>
                )}
                {warrantyLookup.result && (
                  <div className="rounded-2xl border border-border/60 bg-card/90 p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Produkt</p>
                        <p className="font-black">{warrantyLookup.result.productName}</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          SN: {warrantyLookup.result.serialNumber || '-'} · Fahrzeug: {warrantyLookup.result.vehicleNumber || '-'}
                        </p>
                      </div>
                      <WarrantyStatusBadge status={warrantyLookup.result.status} />
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <InfoTile title="Kaufdatum" value={formatDate(warrantyLookup.result.purchaseDate)} />
                      <InfoTile title="Garantie bis" value={formatDate(warrantyLookup.result.warrantyUntil)} />
                      <InfoTile title="Bestellung" value={warrantyLookup.result.orderNumber || '-'} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        <form onSubmit={(event) => onSubmit(event, type)} className="grid gap-5 lg:grid-cols-[0.8fr_1fr]">
        <div className="rounded-3xl border border-border/60 bg-secondary/40 p-5">
          <Icon className="h-12 w-12 text-accent" />
          <p className="mt-4 font-black">{title}</p>
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="grid gap-3">
          <select value={form.product} onChange={(event) => onChange('product', event.target.value)} className="account-input">
            <option value="">Produkt auswählen</option>
            {products.map((product) => <option key={product.id} value={product.title}>{product.title}</option>)}
          </select>
          <AccountInput label="Bestellnummer" value={form.orderNumber} onChange={(value) => onChange('orderNumber', value)} />
          <AccountInput label="Seriennummer / Fahrzeugnummer" value={form.serialNumber} onChange={(value) => onChange('serialNumber', value)} />
          <AccountInput label="Telefon" value={form.phone} onChange={(value) => onChange('phone', value)} />
          <AccountInput label="Betreff" value={form.subject} onChange={(value) => onChange('subject', value)} required />
          <textarea value={form.message} onChange={(event) => onChange('message', event.target.value)} className="account-input min-h-36" placeholder="Beschreiben Sie Ihr Anliegen..." required />
          <Button variant="primary" disabled={loading}>Anfrage senden</Button>
        </div>
        </form>
      </div>
    </Panel>
  )
}

function WarrantyStatusBadge({ status }: { status: WarrantyLookupResult['status'] }) {
  const labels = {
    active: 'Garantie aktiv',
    expired: 'Garantie abgelaufen',
    void: 'Garantie ungültig',
    service: 'Im Service',
  }
  const tone = status === 'active'
    ? 'border-accent/30 bg-accent/10 text-accent'
    : status === 'service'
      ? 'border-amber-400/30 bg-amber-400/10 text-amber-500 dark:text-amber-200'
      : 'border-red-400/30 bg-red-500/10 text-red-300'
  return (
    <span className={`rounded-full border px-4 py-2 text-xs font-black uppercase tracking-widest ${tone}`}>
      {labels[status]}
    </span>
  )
}

function formatDate(value: string) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('de-CH')
}

function ServiceMapPanel({
  form,
  loading,
  onChange,
  onWarranty,
  onService,
}: {
  form: RequestFormState
  loading: boolean
  onChange: (field: keyof RequestFormState, value: string) => void
  onWarranty: () => void
  onService: (event: FormEvent) => void
}) {
  const points = [
    { name: 'MK-eMotors Dornach', address: 'Hauptstrasse 10, 4143 Dornach', type: 'Showroom & Service' },
    { name: 'Basel Abholpunkt', address: 'Aeschenvorstadt, 4051 Basel', type: 'Abholung nach Termin' },
    { name: 'Nordwestschweiz Mobile Service', address: 'Basel-Land / Solothurn', type: 'Mobiler Service' },
  ]
  return (
    <Panel title="Bayi / Servis noktaları">
      <div className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
        <div className="grid gap-3">
          {points.map((point) => (
            <div key={point.name} className="rounded-3xl border border-border/60 bg-secondary/40 p-5">
              <MapPinned className="h-8 w-8 text-accent" />
              <p className="mt-3 font-black">{point.name}</p>
              <p className="text-sm text-muted-foreground">{point.address}</p>
              <p className="mt-2 text-xs font-black uppercase tracking-widest text-accent">{point.type}</p>
            </div>
          ))}
          <Button variant="outline" onClick={onWarranty}><Wrench className="mr-2 h-4 w-4" />Garantie / Service starten</Button>
        </div>
        <form onSubmit={onService} className="space-y-3 rounded-3xl border border-border/60 bg-secondary/40 p-5">
          <p className="font-black">Servicetermin anfragen</p>
          <AccountInput label="Telefon" value={form.phone} onChange={(value) => onChange('phone', value)} />
          <AccountInput label="Betreff" value={form.subject} onChange={(value) => onChange('subject', value)} required />
          <textarea value={form.message} onChange={(event) => onChange('message', event.target.value)} className="account-input min-h-32" required />
          <Button variant="primary" disabled={loading}>Termin senden</Button>
        </form>
      </div>
    </Panel>
  )
}

function PartsPanel({ products }: { products: ShopProduct[] }) {
  return (
    <Panel title="Yedek parça & aksesuar">
      <div className="grid gap-4 md:grid-cols-3">
        {['Akkus & Ladegeräte', 'Reifen & Bremsen', 'Helme & Zubehör'].map((title) => (
          <Link key={title} href={`/produkte?search=${encodeURIComponent(title)}`} className="rounded-3xl border border-border/60 bg-secondary/40 p-5 hover:border-accent/50">
            <PackageSearch className="h-10 w-10 text-accent" />
            <p className="mt-4 font-black">{title}</p>
            <p className="mt-2 text-sm text-muted-foreground">Kompatible Artikel im Shop suchen</p>
          </Link>
        ))}
      </div>
      <div className="mt-5 rounded-3xl border border-border/60 bg-secondary/40 p-5">
        <p className="font-black">Aktuelle Modelle</p>
        <p className="mt-2 text-sm text-muted-foreground">{products.length} Shop-Produkt(e) verfügbar. Zubehör wird über Admin-Produkte und Kategorien gepflegt.</p>
      </div>
    </Panel>
  )
}

function RewardsPanel({
  loading,
  form,
  orderCount,
  totalSpend,
  payments,
  paymentMethods,
  selectedMethods,
  onChange,
  onMethodChange,
  onPreparePayment,
  onSubmit,
}: {
  loading: boolean
  form: RequestFormState
  orderCount: number
  totalSpend: number
  payments: RewardPayment[]
  paymentMethods: RewardPaymentMethod[]
  selectedMethods: Record<string, string>
  onChange: (field: keyof RequestFormState, value: string) => void
  onMethodChange: (paymentId: string, methodId: string) => void
  onPreparePayment: (paymentId: string) => void
  onSubmit: (event: FormEvent) => void
}) {
  const points = calculateCustomerLoyaltyPoints(totalSpend, orderCount)
  const pointsValue = loyaltyPointsToChf(points)
  const openPayments = payments.filter((payment) => payment.status === 'pending' || payment.status === 'processing')
  return (
    <Panel title="Coupons, Geschenkkarten & Treuepunkte">
      {openPayments.length > 0 && (
        <div className="mb-5 space-y-4">
          {openPayments.map((payment) => {
            const selectedMethod = paymentMethods.find((method) => method.id === (selectedMethods[payment.id] || payment.selectedMethod))
            return (
              <div key={payment.id} className="rounded-3xl border border-accent/40 bg-accent/10 p-5">
                <div className="grid gap-5 lg:grid-cols-[1fr_0.8fr]">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-accent">Bitte Zahlung ausführen</p>
                    <h3 className="mt-2 text-2xl font-black">{payment.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Nach Zahlungseingang wird Ihr Gutschein <span className="font-black text-foreground">{payment.couponCode}</span> aktiviert.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <span className="rounded-full bg-background px-4 py-2 text-sm font-black">{formatMoney(payment.amount, payment.currency)}</span>
                      <span className="rounded-full bg-background px-4 py-2 text-sm font-bold">
                        {payment.status === 'processing'
                          ? 'Zahlung gewählt - Prüfung ausstehend'
                          : payment.status === 'paid'
                            ? 'Bezahlt'
                            : 'Zahlung offen'}
                      </span>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                    <label className="space-y-2 text-sm font-bold">
                      <span>Zahlungsart wählen</span>
                      <select
                        value={selectedMethods[payment.id] || payment.selectedMethod || ''}
                        onChange={(event) => onMethodChange(payment.id, event.target.value)}
                        className="account-input"
                      >
                        <option value="">Bitte wählen</option>
                        {paymentMethods.map((method) => (
                          <option key={method.id} value={method.id}>{method.label}</option>
                        ))}
                      </select>
                    </label>
                    {selectedMethod?.instructions && (
                      <div className="mt-3 rounded-2xl border border-border/60 bg-secondary/60 p-3 text-sm text-muted-foreground">
                        <p className="font-black text-foreground">{selectedMethod.label}</p>
                        <p className="mt-1">{selectedMethod.instructions.replace(/<[^>]*>/g, ' ')}</p>
                      </div>
                    )}
                    <Button
                      type="button"
                      variant="primary"
                      className="mt-4 w-full"
                      disabled={loading || !(selectedMethods[payment.id] || payment.selectedMethod)}
                      onClick={() => onPreparePayment(payment.id)}
                    >
                      Zahlungsart bestätigen
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[0.8fr_1fr]">
        <div className="rounded-3xl border border-accent/30 bg-accent/10 p-5">
          <Gift className="h-12 w-12 text-accent" />
          <p className="mt-4 text-sm text-muted-foreground">Aktuelle Treuepunkte</p>
          <p className="mt-2 text-4xl font-black">{points}</p>
          <p className="mt-3 text-sm text-muted-foreground">
            {LOYALTY_POINTS_PER_CHF} Punkte = CHF 1. Aktueller Gegenwert: <span className="font-black text-foreground">{formatMoney(pointsValue, 'CHF')}</span>
          </p>
          <p className="mt-2 text-xs text-muted-foreground">Punkte werden aus Bestellungen und Umsatz berechnet.</p>
        </div>
        <form onSubmit={onSubmit} className="space-y-3 rounded-3xl border border-border/60 bg-secondary/40 p-5">
          <p className="font-black">Coupon / Geschenkkarte anfragen</p>
          <p className="text-sm text-muted-foreground">Geben Sie einen vorhandenen Code oder Ihren Wunschbetrag ein. Die Anfrage wird im Admin Panel unter Coupons geprüft.</p>
          <AccountInput label="Code oder Wunschbetrag" value={form.subject} onChange={(value) => onChange('subject', value)} required />
          <textarea value={form.message} onChange={(event) => onChange('message', event.target.value)} className="account-input min-h-28" placeholder="Optionaler Hinweis..." />
          <Button variant="primary" disabled={loading}>Anfrage senden</Button>
        </form>
      </div>
    </Panel>
  )
}

function NewsletterPanel({ loading, email, onChange, onSubmit }: { loading: boolean; email: string; onChange: (value: string) => void; onSubmit: (event: FormEvent) => void }) {
  return (
    <Panel title="Newsletter">
      <form onSubmit={onSubmit} className="rounded-3xl border border-border/60 bg-secondary/40 p-5">
        <MessageSquare className="h-12 w-12 text-accent" />
        <p className="mt-4 font-black">Posta bülteni aboneliği</p>
        <p className="mt-2 text-sm text-muted-foreground">Kampanyalar, servis hatırlatmaları, yeni ürünler ve özel müşteri avantajları için abone olun.</p>
        <input value={email || ''} readOnly className="account-input mt-4" aria-label="Newsletter E-Mail" />
        <textarea onChange={(event) => onChange(event.target.value)} className="account-input mt-3 min-h-24" placeholder="İlgi alanlarınız: e-scooter, e-moto, aksesuar, servis..." />
        <Button variant="primary" className="mt-4" disabled={loading || !email}>Newsletter speichern</Button>
      </form>
    </Panel>
  )
}

function ActionPanel({ icon: Icon, title, text, href, button }: { icon: LucideIcon; title: string; text: string; href: string; button: string }) {
  return (
    <Panel title={title}>
      <div className="rounded-3xl border border-border/60 bg-secondary/40 p-8 text-center">
        <Icon className="mx-auto h-14 w-14 text-accent" />
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">{text}</p>
        <Link href={href} className="mt-6 inline-flex rounded-2xl bg-accent px-6 py-3 text-sm font-black uppercase tracking-widest text-accent-foreground">
          {button}
        </Link>
      </div>
    </Panel>
  )
}
