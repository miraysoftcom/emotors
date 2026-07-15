'use client'

import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, CreditCard, Globe, Lock, Mail, Palette, PanelBottom, Save, Search, Settings, Sparkles, Trash2 } from 'lucide-react'
import type { PaymentMethodId, ShopSettings } from '@/lib/shop-settings-store'
import { HtmlEditor } from '@/components/admin/HtmlEditor'

type Message = { type: 'success' | 'error' | ''; text: string }

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<ShopSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<Message>({ type: '', text: '' })
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [testEmail, setTestEmail] = useState('')
  const [testingSmtp, setTestingSmtp] = useState(false)
  const [cleaning, setCleaning] = useState(false)
  const [cleanupResult, setCleanupResult] = useState<{
    totalSize: string
    cleaned: Array<{ label: string; path: string; existed: boolean; formattedSize: string }>
  } | null>(null)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    setLoading(true)
    const res = await fetch('/api/admin/shop-settings', { credentials: 'include' })
    if (res.status === 401) {
      window.location.href = '/admin/login'
      return
    }
    const data = await res.json()
    setSettings(data.settings)
    setLoading(false)
  }

  const saveSettings = async () => {
    if (!settings) return
    setSaving(true)
    setMessage({ type: '', text: '' })
    const res = await fetch('/api/admin/shop-settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(settings),
    })
    setSaving(false)
    if (!res.ok) {
      setMessage({ type: 'error', text: 'Einstellungen konnten nicht gespeichert werden.' })
      return
    }
    const data = await res.json()
    setSettings(data.settings)
    setMessage({ type: 'success', text: 'Einstellungen erfolgreich gespeichert.' })
  }

  const changePassword = async () => {
    if (!newPassword || newPassword.length < 8) {
      setMessage({ type: 'error', text: 'Passwort muss mindestens 8 Zeichen lang sein.' })
      return
    }
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwörter stimmen nicht überein.' })
      return
    }
    const res = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ action: 'changePassword', newPassword }),
    })
    const data = await res.json()
    setMessage({ type: res.ok ? 'success' : 'error', text: data.message || data.error || 'Passwort konnte nicht geändert werden.' })
    if (res.ok) {
      setNewPassword('')
      setConfirmPassword('')
    }
  }

  const sendSmtpTest = async () => {
    if (!testEmail) {
      setMessage({ type: 'error', text: 'Bitte geben Sie eine Test-E-Mail-Adresse ein.' })
      return
    }
    setTestingSmtp(true)
    setMessage({ type: '', text: '' })
    const res = await fetch('/api/admin/smtp-test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ to: testEmail }),
    })
    const data = await res.json().catch(() => ({}))
    setTestingSmtp(false)
    setMessage({
      type: res.ok ? 'success' : 'error',
      text: data.message || data.error || 'SMTP Test konnte nicht gesendet werden.',
    })
  }

  const cleanupSiteCache = async () => {
    const confirmed = window.confirm(
      'Nur Cache, temporäre Dateien und Dev-Logs werden gelöscht. Produkte, Bestellungen, Kunden, Seiten und Einstellungen bleiben unverändert. Jetzt bereinigen?'
    )
    if (!confirmed) return

    setCleaning(true)
    setCleanupResult(null)
    setMessage({ type: '', text: '' })

    const res = await fetch('/api/admin/maintenance/cleanup', {
      method: 'POST',
      credentials: 'include',
    })
    const data = await res.json().catch(() => ({}))
    setCleaning(false)

    if (!res.ok) {
      setMessage({ type: 'error', text: data.error || 'Bereinigung konnte nicht durchgeführt werden.' })
      return
    }

    setCleanupResult({ totalSize: data.totalSize || '0 B', cleaned: data.cleaned || [] })
    setMessage({ type: 'success', text: data.message || 'Cache wurde bereinigt.' })
  }

  const update = <Section extends keyof ShopSettings>(section: Section, key: keyof ShopSettings[Section], value: unknown) => {
    if (!settings) return
    setSettings({
      ...settings,
      [section]: {
        ...settings[section],
        [key]: value,
      },
    })
  }

  const updateFooter = (key: keyof ShopSettings['footer'], value: unknown) => {
    setSettings({
      ...settings,
      footer: {
        ...settings.footer,
        [key]: value,
      },
    })
  }

  const setPaymentMethodEnabled = (id: PaymentMethodId, enabled: boolean) => {
    if (!settings) return
    setSettings({
      ...settings,
      payments: {
        ...settings.payments,
        methods: settings.payments.methods.map((method) =>
          method.id === id ? { ...method, enabled } : method
        ),
      },
    })
  }

  const isPaymentMethodEnabled = (id: PaymentMethodId) => {
    return Boolean(settings?.payments.methods.find((method) => method.id === id)?.enabled)
  }

  if (loading || !settings) {
    return <div className="p-8 text-muted-foreground">Einstellungen werden geladen...</div>
  }

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Einstellungen</h1>
          <p className="text-muted-foreground">Zentrale Konfiguration für Shop, SEO, Zahlungen, E-Mail und Design.</p>
        </div>
        <button onClick={saveSettings} disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-5 py-3 font-semibold text-accent-foreground disabled:opacity-60">
          <Save className="h-4 w-4" />
          {saving ? 'Speichern...' : 'Alle Einstellungen speichern'}
        </button>
      </motion.div>

      {message.text && (
        <div className={`rounded-lg border p-4 text-sm ${message.type === 'success' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200' : 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-200'}`}>
          {message.text}
        </div>
      )}

      <section className="grid gap-6 xl:grid-cols-2">
        <SettingsCard icon={<Globe />} title="Allgemeine Einstellungen">
          <Field label="Site Name" value={settings.general.siteName} onChange={(value) => update('general', 'siteName', value)} />
          <Field label="Firma" value={settings.general.companyName} onChange={(value) => update('general', 'companyName', value)} />
          <Field label="Adresse" value={settings.general.address} onChange={(value) => update('general', 'address', value)} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Telefon" value={settings.general.phone} onChange={(value) => update('general', 'phone', value)} />
            <Field label="E-Mail" value={settings.general.email} onChange={(value) => update('general', 'email', value)} />
          </div>
          <label className="flex items-center gap-3 rounded-lg border border-border p-3 text-sm">
            <input type="checkbox" checked={settings.general.maintenanceMode} onChange={(event) => update('general', 'maintenanceMode', event.target.checked)} />
            Wartungsmodus aktivieren
          </label>
        </SettingsCard>

        <SettingsCard icon={<Search />} title="SEO-Einstellungen">
          <Field label="Homepage Meta Title" value={settings.seo.metaTitle} onChange={(value) => update('seo', 'metaTitle', value)} />
          <TextArea label="Meta Description" value={settings.seo.metaDescription} onChange={(value) => update('seo', 'metaDescription', value)} />
          <Field label="Canonical URL" value={settings.seo.canonicalUrl} onChange={(value) => update('seo', 'canonicalUrl', value)} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Robots" value={settings.seo.robots} onChange={(value) => update('seo', 'robots', value)} />
            <Field label="OpenGraph Bild" value={settings.seo.openGraphImage} onChange={(value) => update('seo', 'openGraphImage', value)} />
          </div>
        </SettingsCard>

        <SettingsCard icon={<BarChart3 />} title="Analytics & Conversion Tracking">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Google Analytics / GA4 ID"
              value={settings.tracking.googleAnalyticsId}
              placeholder="G-XXXXXXXXXX"
              onChange={(value) => update('tracking', 'googleAnalyticsId', value)}
            />
            <Field
              label="Meta Pixel ID"
              value={settings.tracking.metaPixelId}
              placeholder="123456789012345"
              onChange={(value) => update('tracking', 'metaPixelId', value)}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex items-center gap-3 rounded-lg border border-border p-3 text-sm">
              <input type="checkbox" checked={settings.tracking.enableGoogleAnalytics} onChange={(event) => update('tracking', 'enableGoogleAnalytics', event.target.checked)} />
              Google Analytics aktivieren
            </label>
            <label className="flex items-center gap-3 rounded-lg border border-border p-3 text-sm">
              <input type="checkbox" checked={settings.tracking.enableMetaPixel} onChange={(event) => update('tracking', 'enableMetaPixel', event.target.checked)} />
              Meta Pixel aktivieren
            </label>
            <label className="flex items-center gap-3 rounded-lg border border-border p-3 text-sm sm:col-span-2">
              <input type="checkbox" checked={settings.tracking.anonymizeIp} onChange={(event) => update('tracking', 'anonymizeIp', event.target.checked)} />
              IP-Anonymisierung für Google Analytics verwenden
            </label>
          </div>
          <p className="text-sm text-muted-foreground">
            Wenn die Felder leer sind, werden optional die Environment-Werte <code>NEXT_PUBLIC_GA_ID</code>, <code>NEXT_PUBLIC_GOOGLE_ANALYTICS_ID</code> und <code>NEXT_PUBLIC_META_PIXEL_ID</code> verwendet.
          </p>
        </SettingsCard>

        <SettingsCard icon={<Sparkles />} title="Shop mit AI">
          <label className="flex items-center justify-between gap-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm font-semibold text-emerald-700 dark:text-emerald-200">
            <span>AI Einkaufsassistent anzeigen</span>
            <input type="checkbox" checked={settings.ai.enabled} onChange={(event) => update('ai', 'enabled', event.target.checked)} />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Widget Titel" value={settings.ai.title} placeholder="MK-eMotors AI" onChange={(value) => update('ai', 'title', value)} />
            <Field label="Modell" value={settings.ai.model} placeholder="gpt-4o-mini" onChange={(value) => update('ai', 'model', value)} />
          </div>
          <Field
            label="OpenAI-kompatibler Endpoint"
            value={settings.ai.endpoint}
            placeholder="https://api.openai.com/v1/chat/completions"
            onChange={(value) => update('ai', 'endpoint', value)}
          />
          <div className="grid gap-4 sm:grid-cols-[1fr_10rem]">
            <Field label="AI API Key" type="password" value={settings.ai.apiKey} placeholder="sk-..." onChange={(value) => update('ai', 'apiKey', value)} />
            <NumberField label="Temperatur" value={settings.ai.temperature} onChange={(value) => update('ai', 'temperature', value)} />
          </div>
          <TextArea label="Begrüssung im Widget" value={settings.ai.welcomeMessage} onChange={(value) => update('ai', 'welcomeMessage', value)} />
          <PlainTextArea label="System Prompt" value={settings.ai.systemPrompt} onChange={(value) => update('ai', 'systemPrompt', value)} />
          <PlainTextArea
            label="Schnellvorschläge"
            value={settings.ai.suggestions.join('\n')}
            onChange={(value) => update('ai', 'suggestions', value.split('\n').map((item) => item.trim()).filter(Boolean))}
          />
          <div className="rounded-lg border border-border bg-secondary/40 p-4 text-sm text-muted-foreground">
            API Keys werden nur serverseitig verwendet. Ohne Key bleibt der Assistent aktiv und erzeugt lokale Produktempfehlungen aus dem Shop-Katalog.
          </div>
        </SettingsCard>

        <SettingsCard icon={<Mail />} title="SMTP E-Mail Einstellungen">
          <label className="flex items-center gap-3 rounded-lg border border-border p-3 text-sm">
            <input
              type="checkbox"
              checked={settings.email.smtpEnabled}
              onChange={(event) => update('email', 'smtpEnabled', event.target.checked)}
            />
            SMTP Versand aktivieren
          </label>
          <div className="grid gap-4 sm:grid-cols-[1fr_8rem]">
            <Field label="SMTP Host" value={settings.email.smtpHost} placeholder="smtp.example.ch" onChange={(value) => update('email', 'smtpHost', value)} />
            <NumberField label="Port" value={settings.email.smtpPort} onChange={(value) => update('email', 'smtpPort', value)} />
          </div>
          <label className="flex items-center gap-3 rounded-lg border border-border p-3 text-sm">
            <input
              type="checkbox"
              checked={settings.email.smtpSecure}
              onChange={(event) => update('email', 'smtpSecure', event.target.checked)}
            />
            SSL/TLS direkt verwenden (typisch Port 465)
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="SMTP Benutzer" value={settings.email.smtpUser} onChange={(value) => update('email', 'smtpUser', value)} />
            <Field label="SMTP Passwort" type="password" value={settings.email.smtpPassword} onChange={(value) => update('email', 'smtpPassword', value)} />
            <Field label="Absender E-Mail" value={settings.email.fromEmail} onChange={(value) => update('email', 'fromEmail', value)} />
            <Field label="Absender Name" value={settings.email.fromName} onChange={(value) => update('email', 'fromName', value)} />
            <Field label="Reply-To" value={settings.email.replyTo} onChange={(value) => update('email', 'replyTo', value)} />
            <Field label="Admin Empfänger" value={settings.email.adminRecipient} onChange={(value) => update('email', 'adminRecipient', value)} />
          </div>
          <div className="rounded-lg border border-border bg-secondary/40 p-4">
            <p className="mb-3 text-sm font-semibold">SMTP Testmail senden</p>
            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <input
                type="email"
                value={testEmail}
                onChange={(event) => setTestEmail(event.target.value)}
                placeholder="test@example.ch"
                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm"
              />
              <button
                type="button"
                onClick={sendSmtpTest}
                disabled={testingSmtp}
                className="rounded-lg bg-slate-900 px-4 py-3 font-semibold text-white disabled:opacity-60 dark:bg-white dark:text-slate-950"
              >
                {testingSmtp ? 'Sende...' : 'Test senden'}
              </button>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">Wichtig: Änderungen an SMTP Daten zuerst mit “Alle Einstellungen speichern” speichern, dann Test senden.</p>
          </div>
        </SettingsCard>

        <SettingsCard icon={<Settings />} title="Shop Einstellungen">
          <div className="grid gap-4 sm:grid-cols-2">
            <NumberField label="MwSt. %" value={settings.shop.taxRate} onChange={(value) => update('shop', 'taxRate', value)} />
            <NumberField label="Mindestbestellwert" value={settings.shop.minimumOrderAmount} onChange={(value) => update('shop', 'minimumOrderAmount', value)} />
            <NumberField label="Versandkosten" value={settings.shop.shippingCost} onChange={(value) => update('shop', 'shippingCost', value)} />
            <NumberField label="Gratis Versand ab" value={settings.shop.freeShippingFrom} onChange={(value) => update('shop', 'freeShippingFrom', value)} />
            <NumberField label="Low Stock Grenze" value={settings.shop.lowStockThreshold} onChange={(value) => update('shop', 'lowStockThreshold', value)} />
            <NumberField label="Rückgabefrist Tage" value={settings.shop.returnPeriodDays} onChange={(value) => update('shop', 'returnPeriodDays', value)} />
          </div>
        </SettingsCard>

        <SettingsCard icon={<Lock />} title="Admin Passwort">
          <Field label="Neues Passwort" type="password" value={newPassword} onChange={setNewPassword} />
          <Field label="Passwort bestätigen" type="password" value={confirmPassword} onChange={setConfirmPassword} />
          <button onClick={changePassword} className="rounded-lg bg-slate-900 px-4 py-3 font-semibold text-white dark:bg-white dark:text-slate-950">
            Passwort aktualisieren
          </button>
        </SettingsCard>

        <SettingsCard icon={<Trash2 />} title="Site Cleanup">
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-800 dark:text-amber-100">
            Diese Funktion löscht nur Cache, temporäre Dateien und Dev-Logs. Shop-Daten wie Produkte, Bestellungen, Kunden, Seiten, Rechnungen und Einstellungen werden nicht gelöscht.
          </div>
          <button
            type="button"
            onClick={cleanupSiteCache}
            disabled={cleaning}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-5 py-3 font-bold text-white shadow-lg shadow-red-950/20 hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Trash2 className="h-4 w-4" />
            {cleaning ? 'Bereinigung läuft...' : 'Fazlalık / Cache temizle'}
          </button>
          {cleanupResult && (
            <div className="rounded-lg border border-border bg-secondary/40 p-4 text-sm">
              <p className="mb-3 font-bold text-foreground">Bereinigt: {cleanupResult.totalSize}</p>
              <div className="space-y-2">
                {cleanupResult.cleaned.map((item) => (
                  <div key={item.path} className="flex items-center justify-between gap-4 rounded-md bg-background/70 px-3 py-2">
                    <span>
                      <strong>{item.label}</strong>
                      <span className="ml-2 text-muted-foreground">{item.path}</span>
                    </span>
                    <span className={item.existed ? 'font-bold text-accent' : 'text-muted-foreground'}>
                      {item.existed ? item.formattedSize : 'Nicht vorhanden'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </SettingsCard>
      </section>

      <SettingsCard icon={<CreditCard />} title="Zahlungs-Einstellungen">
        <div className="grid gap-4 md:grid-cols-[16rem_1fr]">
          <label className="block space-y-2 text-sm font-semibold">
            <span>Payment Mode</span>
            <select
              value={settings.payments.mode}
              onChange={(event) => setSettings({ ...settings, payments: { ...settings.payments, mode: event.target.value as 'test' | 'live' } })}
              className="w-full rounded-lg border border-border bg-background px-4 py-3 font-normal"
            >
              <option value="test">Test / Sandbox</option>
              <option value="live">Live / Produktion</option>
            </select>
          </label>
          <div className="rounded-lg border border-border bg-secondary/40 p-4 text-sm text-muted-foreground">
            Aktivieren Sie nur Zahlungsarten, deren Zugangsdaten vollständig hinterlegt sind. Secret Keys werden nur im geschützten Admin-Bereich angezeigt und nicht an den öffentlichen Checkout ausgeliefert.
          </div>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {settings.payments.methods.map((method, index) => (
            <div key={method.id} className="rounded-lg border border-border p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <strong>{method.label}</strong>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={method.enabled}
                    onChange={(event) => {
                      const methods = [...settings.payments.methods]
                      methods[index] = { ...method, enabled: event.target.checked }
                      setSettings({ ...settings, payments: { ...settings.payments, methods } })
                    }}
                  />
                  Aktiv
                </label>
              </div>
              <TextArea
                label="Anleitung"
                value={method.instructions}
                onChange={(value) => {
                  const methods = [...settings.payments.methods]
                  methods[index] = { ...method, instructions: value }
                  setSettings({ ...settings, payments: { ...settings.payments, methods } })
                }}
              />
              <NumberField
                label="Sortierung"
                value={method.sortOrder}
                onChange={(value) => {
                  const methods = [...settings.payments.methods]
                  methods[index] = { ...method, sortOrder: value }
                  setSettings({ ...settings, payments: { ...settings.payments, methods } })
                }}
              />
            </div>
          ))}
        </div>
      </SettingsCard>

      <section className="grid gap-6 xl:grid-cols-3">
        <SettingsCard icon={<CreditCard />} title="SumUp">
          <ProviderToggle
            label="SumUp im Checkout aktivieren"
            checked={isPaymentMethodEnabled('sumup')}
            onChange={(checked) => setPaymentMethodEnabled('sumup', checked)}
          />
          <Field label="Merchant Code" value={settings.payments.sumup.merchantCode} onChange={(value) => setSettings({ ...settings, payments: { ...settings.payments, sumup: { ...settings.payments.sumup, merchantCode: value } } })} />
          <Field label="API Key" type="password" value={settings.payments.sumup.apiKey} onChange={(value) => setSettings({ ...settings, payments: { ...settings.payments, sumup: { ...settings.payments.sumup, apiKey: value } } })} />
          <Field label="Client ID" value={settings.payments.sumup.clientId} onChange={(value) => setSettings({ ...settings, payments: { ...settings.payments, sumup: { ...settings.payments.sumup, clientId: value } } })} />
          <Field label="Client Secret" type="password" value={settings.payments.sumup.clientSecret} onChange={(value) => setSettings({ ...settings, payments: { ...settings.payments, sumup: { ...settings.payments.sumup, clientSecret: value } } })} />
          <Field label="Success URL" value={settings.payments.sumup.checkoutSuccessUrl} placeholder="/checkout/success" onChange={(value) => setSettings({ ...settings, payments: { ...settings.payments, sumup: { ...settings.payments.sumup, checkoutSuccessUrl: value } } })} />
          <Field label="Webhook Secret" type="password" value={settings.payments.sumup.webhookSecret} onChange={(value) => setSettings({ ...settings, payments: { ...settings.payments, sumup: { ...settings.payments.sumup, webhookSecret: value } } })} />
          <TextArea label="Anleitung" value={settings.payments.sumup.instructions} onChange={(value) => setSettings({ ...settings, payments: { ...settings.payments, sumup: { ...settings.payments.sumup, instructions: value } } })} />
        </SettingsCard>

        <SettingsCard icon={<CreditCard />} title="Stripe">
          <ProviderToggle
            label="Stripe / Kreditkarte im Checkout aktivieren"
            checked={isPaymentMethodEnabled('stripe')}
            onChange={(checked) => setPaymentMethodEnabled('stripe', checked)}
          />
          <Field label="Publishable Key" value={settings.payments.stripe.publishableKey} placeholder="pk_test_..." onChange={(value) => setSettings({ ...settings, payments: { ...settings.payments, stripe: { ...settings.payments.stripe, publishableKey: value } } })} />
          <Field label="Secret Key" type="password" value={settings.payments.stripe.secretKey} placeholder="sk_test_..." onChange={(value) => setSettings({ ...settings, payments: { ...settings.payments, stripe: { ...settings.payments.stripe, secretKey: value } } })} />
          <Field label="Webhook Secret" type="password" value={settings.payments.stripe.webhookSecret} placeholder="whsec_..." onChange={(value) => setSettings({ ...settings, payments: { ...settings.payments, stripe: { ...settings.payments.stripe, webhookSecret: value } } })} />
          <Field label="Success URL" value={settings.payments.stripe.successUrl} placeholder="/checkout/success" onChange={(value) => setSettings({ ...settings, payments: { ...settings.payments, stripe: { ...settings.payments.stripe, successUrl: value } } })} />
          <Field label="Cancel URL" value={settings.payments.stripe.cancelUrl} placeholder="/checkout" onChange={(value) => setSettings({ ...settings, payments: { ...settings.payments, stripe: { ...settings.payments.stripe, cancelUrl: value } } })} />
          <TextArea label="Anleitung" value={settings.payments.stripe.instructions} onChange={(value) => setSettings({ ...settings, payments: { ...settings.payments, stripe: { ...settings.payments.stripe, instructions: value } } })} />
        </SettingsCard>

        <SettingsCard icon={<CreditCard />} title="PayPal">
          <ProviderToggle
            label="PayPal im Checkout aktivieren"
            checked={isPaymentMethodEnabled('paypal')}
            onChange={(checked) => setPaymentMethodEnabled('paypal', checked)}
          />
          <Field label="Client ID" value={settings.payments.paypal.clientId} onChange={(value) => setSettings({ ...settings, payments: { ...settings.payments, paypal: { ...settings.payments.paypal, clientId: value } } })} />
          <Field label="Client Secret" type="password" value={settings.payments.paypal.clientSecret} onChange={(value) => setSettings({ ...settings, payments: { ...settings.payments, paypal: { ...settings.payments.paypal, clientSecret: value } } })} />
          <Field label="Merchant E-Mail" value={settings.payments.paypal.merchantEmail} onChange={(value) => setSettings({ ...settings, payments: { ...settings.payments, paypal: { ...settings.payments.paypal, merchantEmail: value } } })} />
          <Field label="Webhook ID" value={settings.payments.paypal.webhookId} onChange={(value) => setSettings({ ...settings, payments: { ...settings.payments, paypal: { ...settings.payments.paypal, webhookId: value } } })} />
          <TextArea label="Anleitung" value={settings.payments.paypal.instructions} onChange={(value) => setSettings({ ...settings, payments: { ...settings.payments, paypal: { ...settings.payments.paypal, instructions: value } } })} />
        </SettingsCard>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <SettingsCard icon={<CreditCard />} title="TWINT">
          <ProviderToggle
            label="TWINT im Checkout aktivieren"
            checked={isPaymentMethodEnabled('twint')}
            onChange={(checked) => setPaymentMethodEnabled('twint', checked)}
          />
          <Field label="Firma" value={settings.payments.twint.companyName} onChange={(value) => setSettings({ ...settings, payments: { ...settings.payments, twint: { ...settings.payments.twint, companyName: value } } })} />
          <Field label="Telefon" value={settings.payments.twint.phone} onChange={(value) => setSettings({ ...settings, payments: { ...settings.payments, twint: { ...settings.payments.twint, phone: value } } })} />
          <Field label="TWINT Merchant UUID" value={settings.payments.twint.merchantUuid} onChange={(value) => setSettings({ ...settings, payments: { ...settings.payments, twint: { ...settings.payments.twint, merchantUuid: value } } })} />
          <Field label="TWINT API Key" type="password" value={settings.payments.twint.apiKey} onChange={(value) => setSettings({ ...settings, payments: { ...settings.payments, twint: { ...settings.payments.twint, apiKey: value } } })} />
          <Field label="Store ID / Terminal ID" value={settings.payments.twint.storeId} onChange={(value) => setSettings({ ...settings, payments: { ...settings.payments, twint: { ...settings.payments.twint, storeId: value } } })} />
          <Field label="Webhook Secret" type="password" value={settings.payments.twint.webhookSecret} onChange={(value) => setSettings({ ...settings, payments: { ...settings.payments, twint: { ...settings.payments.twint, webhookSecret: value } } })} />
          <Field label="QR Bild URL" value={settings.payments.twint.qrImageUrl} onChange={(value) => setSettings({ ...settings, payments: { ...settings.payments, twint: { ...settings.payments.twint, qrImageUrl: value } } })} />
          <TextArea label="Anleitung" value={settings.payments.twint.instructions} onChange={(value) => setSettings({ ...settings, payments: { ...settings.payments, twint: { ...settings.payments.twint, instructions: value } } })} />
        </SettingsCard>

        <SettingsCard icon={<Mail />} title="IBAN / Bank">
          <ProviderToggle
            label="Banküberweisung im Checkout aktivieren"
            checked={isPaymentMethodEnabled('bank_transfer')}
            onChange={(checked) => setPaymentMethodEnabled('bank_transfer', checked)}
          />
          <ProviderToggle
            label="Vorauszahlung im Checkout aktivieren"
            checked={isPaymentMethodEnabled('vorauszahlung')}
            onChange={(checked) => setPaymentMethodEnabled('vorauszahlung', checked)}
          />
          <Field label="Bank" value={settings.payments.bank.bankName} onChange={(value) => setSettings({ ...settings, payments: { ...settings.payments, bank: { ...settings.payments.bank, bankName: value } } })} />
          <Field label="Kontoinhaber" value={settings.payments.bank.accountHolder} onChange={(value) => setSettings({ ...settings, payments: { ...settings.payments, bank: { ...settings.payments.bank, accountHolder: value } } })} />
          <Field label="IBAN" value={settings.payments.bank.iban} onChange={(value) => setSettings({ ...settings, payments: { ...settings.payments, bank: { ...settings.payments.bank, iban: value } } })} />
          <Field label="BIC/SWIFT" value={settings.payments.bank.bic} onChange={(value) => setSettings({ ...settings, payments: { ...settings.payments, bank: { ...settings.payments.bank, bic: value } } })} />
          <TextArea label="Anleitung" value={settings.payments.bank.instructions} onChange={(value) => setSettings({ ...settings, payments: { ...settings.payments, bank: { ...settings.payments.bank, instructions: value } } })} />
        </SettingsCard>

        <SettingsCard icon={<Palette />} title="Kauf auf Rechnung">
          <ProviderToggle
            label="Kauf auf Rechnung im Checkout aktivieren"
            checked={isPaymentMethodEnabled('auf_rechnung')}
            onChange={(checked) => setPaymentMethodEnabled('auf_rechnung', checked)}
          />
          <NumberField label="Minimum" value={settings.payments.invoice.minAmount} onChange={(value) => setSettings({ ...settings, payments: { ...settings.payments, invoice: { ...settings.payments.invoice, minAmount: value } } })} />
          <NumberField label="Maximum" value={settings.payments.invoice.maxAmount} onChange={(value) => setSettings({ ...settings, payments: { ...settings.payments, invoice: { ...settings.payments.invoice, maxAmount: value } } })} />
          <NumberField label="Fälligkeit Tage" value={settings.payments.invoice.dueDays} onChange={(value) => setSettings({ ...settings, payments: { ...settings.payments, invoice: { ...settings.payments.invoice, dueDays: value } } })} />
          <label className="flex items-center gap-3 rounded-lg border border-border p-3 text-sm">
            <input type="checkbox" checked={settings.payments.invoice.manualApproval} onChange={(event) => setSettings({ ...settings, payments: { ...settings.payments, invoice: { ...settings.payments.invoice, manualApproval: event.target.checked } } })} />
            Manuelle Prüfung erforderlich
          </label>
          <label className="flex items-center gap-3 rounded-lg border border-border p-3 text-sm">
            <input type="checkbox" checked={settings.payments.invoice.registeredCustomersOnly} onChange={(event) => setSettings({ ...settings, payments: { ...settings.payments, invoice: { ...settings.payments.invoice, registeredCustomersOnly: event.target.checked } } })} />
            Nur für registrierte Kunden
          </label>
          <TextArea label="Anleitung" value={settings.payments.invoice.instructions} onChange={(value) => setSettings({ ...settings, payments: { ...settings.payments, invoice: { ...settings.payments.invoice, instructions: value } } })} />
        </SettingsCard>
      </section>

      <SettingsCard icon={<PanelBottom />} title="Footer Einstellungen">
        <div className="grid gap-4 lg:grid-cols-2">
          <Field label="Footer Markenname" value={settings.footer.brandTitle} onChange={(value) => updateFooter('brandTitle', value)} />
          <Field label="Logo Text" value={settings.footer.logoText} onChange={(value) => updateFooter('logoText', value)} />
          <div className="lg:col-span-2">
            <TextArea label="Beschreibung" value={settings.footer.brandDescription} onChange={(value) => updateFooter('brandDescription', value)} />
          </div>
          <Field label="Kontakt E-Mail" value={settings.footer.contactEmail} onChange={(value) => updateFooter('contactEmail', value)} />
          <Field label="Telefon" value={settings.footer.contactPhone} onChange={(value) => updateFooter('contactPhone', value)} />
          <Field label="Standort" value={settings.footer.contactLocation} onChange={(value) => updateFooter('contactLocation', value)} />
          <Field label="Copyright Text" value={settings.footer.copyrightText} onChange={(value) => updateFooter('copyrightText', value)} />
          <label className="flex items-center gap-3 rounded-lg border border-border p-3 text-sm">
            <input type="checkbox" checked={settings.footer.showLiveSales} onChange={(event) => updateFooter('showLiveSales', event.target.checked)} />
            Gerade verkauft im Footer anzeigen
          </label>
          <Field label="Gerade verkauft Titel" value={settings.footer.liveSalesTitle} onChange={(value) => updateFooter('liveSalesTitle', value)} />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <PlainTextArea
            label="Footer Spalten"
            value={formatFooterColumns(settings.footer.columns)}
            onChange={(value) => updateFooter('columns', parseFooterColumns(value))}
          />
          <PlainTextArea
            label="Social Links"
            value={formatLinks(settings.footer.socialLinks)}
            onChange={(value) => updateFooter('socialLinks', parseLinks(value))}
          />
        </div>

        <div className="rounded-lg border border-border bg-secondary/40 p-4 text-sm text-muted-foreground">
          <p className="font-semibold text-foreground">Format</p>
          <p>Footer Spalten: <code>Shop: Alle Produkte|/produkte, AGB|/agb</code></p>
          <p>Social Links: <code>Instagram|https://instagram.com/...</code></p>
        </div>
      </SettingsCard>
    </div>
  )
}

function SettingsCard({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 rounded-xl border border-border bg-card p-5">
      <h2 className="flex items-center gap-2 text-xl font-bold">
        <span className="text-accent">{icon}</span>
        {title}
      </h2>
      {children}
    </motion.section>
  )
}

function ProviderToggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className={`flex items-center justify-between gap-4 rounded-lg border p-3 text-sm font-semibold ${checked ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200' : 'border-border bg-secondary/40 text-muted-foreground'}`}>
      <span>{label}</span>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
    </label>
  )
}

function Field({ label, value, onChange, type = 'text', placeholder = '' }: { label: string; value: string; onChange: (value: string) => void; type?: string; placeholder?: string }) {
  return (
    <label className="block space-y-2 text-sm font-semibold">
      <span>{label}</span>
      <input type={type} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} className="w-full rounded-lg border border-border bg-background px-4 py-3 font-normal" />
    </label>
  )
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <Field label={label} value={String(value)} onChange={(next) => onChange(Number(next) || 0)} />
  )
}

function TextArea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <HtmlEditor label={label} value={value} onChange={onChange} minHeightClassName="min-h-32" />
  )
}

function PlainTextArea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block space-y-2 text-sm font-semibold">
      <span>{label}</span>
      <textarea value={value} onChange={(event) => onChange(event.target.value)} className="min-h-24 w-full rounded-lg border border-border bg-background px-4 py-3 font-mono text-sm" />
    </label>
  )
}

function formatFooterColumns(columns: ShopSettings['footer']['columns']) {
  return columns
    .map((column) => `${column.title}: ${formatLinks(column.links)}`)
    .join('\n')
}

function parseFooterColumns(value: string): ShopSettings['footer']['columns'] {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [titlePart, linksPart = ''] = line.split(':')
      return {
        title: titlePart.trim() || 'Footer',
        links: parseLinks(linksPart),
      }
    })
}

function formatLinks(links: Array<{ label: string; href: string }>) {
  return links.map((link) => `${link.label}|${link.href}`).join(', ')
}

function parseLinks(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => {
      const [label = '', href = '#'] = item.split('|')
      return {
        label: label.trim() || 'Link',
        href: href.trim() || '#',
      }
    })
}
