'use client'

import { FormEvent, useState } from 'react'
import { Calculator, CalendarClock, CheckCircle2, ShieldCheck, Wrench } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { SplitTitle } from '@/components/common/SplitTitle'

const initialForm = {
  name: '',
  email: '',
  phone: '',
  vehicleType: 'E-Scooter',
  brandModel: '',
  serviceType: 'Reparatur',
  preferredDate: '',
  message: '',
}

export function EstimateAppointmentSection() {
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function submit(event: FormEvent) {
    event.preventDefault()
    setLoading(true)
    setMessage('')
    const response = await fetch('/api/account/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        type: 'estimate',
        email: form.email,
        name: form.name,
        phone: form.phone,
        subject: `Kostenvoranschlag Termin: ${form.vehicleType} ${form.brandModel}`.trim(),
        message: [
          `Fahrzeugtyp: ${form.vehicleType}`,
          `Marke / Modell: ${form.brandModel}`,
          `Leistung: ${form.serviceType}`,
          `Wunschtermin: ${form.preferredDate}`,
          `Telefon: ${form.phone}`,
          '',
          form.message,
        ].join('\n'),
        payload: form,
      }),
    })
    const data = await response.json().catch(() => ({}))
    setLoading(false)
    if (!response.ok) {
      setMessage(data.error || 'Anfrage konnte nicht gesendet werden.')
      return
    }
    setForm(initialForm)
    setMessage('Ihre Anfrage wurde gesendet. Wir bestätigen den Kostenvoranschlag-Termin persönlich.')
  }

  return (
    <section className="bg-background px-4 py-20 md:px-8">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-3xl border border-border bg-card p-6 md:p-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-2 text-xs font-black uppercase tracking-widest text-accent">
            <Calculator className="h-4 w-4" />
            Online Termin
          </div>
          <h2 className="mt-6 text-4xl font-black tracking-tight md:text-5xl">
            <SplitTitle title="Kostenvoranschlag für E-Motors & E-Scooter" />
          </h2>
          <p className="mt-5 text-lg leading-8 text-muted-foreground">
            Reparatur, Diagnose, Akkuprüfung, Schadenabklärung oder Zubehör-Montage: senden Sie uns die wichtigsten Daten online und erhalten Sie einen professionellen Termin zur Einschätzung.
          </p>
          <div className="mt-8 grid gap-3">
            {[
              { icon: Wrench, text: 'Für E-Scooter, E-Mopeds, E-Motorräder und Akkus' },
              { icon: CalendarClock, text: 'Wunschtermin mit persönlicher Bestätigung' },
              { icon: ShieldCheck, text: 'Transparente Einschätzung vor Reparaturfreigabe' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 rounded-2xl border border-border/60 bg-secondary/40 p-4">
                <Icon className="h-5 w-5 text-accent" />
                <span className="text-sm font-bold text-foreground">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={submit} className="rounded-3xl border border-border bg-card p-5 shadow-luxury-md md:p-7">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Name" value={form.name} onChange={(value) => setForm({ ...form, name: value })} required />
            <Field label="E-Mail" type="email" value={form.email} onChange={(value) => setForm({ ...form, email: value })} required />
            <Field label="Telefon" type="tel" value={form.phone} onChange={(value) => setForm({ ...form, phone: value })} required />
            <label className="space-y-2">
              <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Fahrzeugtyp</span>
              <select value={form.vehicleType} onChange={(event) => setForm({ ...form, vehicleType: event.target.value })} className="account-input">
                <option>E-Scooter</option>
                <option>E-Moped</option>
                <option>E-Motorrad</option>
                <option>Kabinenroller</option>
                <option>Akku / Ladegerät</option>
              </select>
            </label>
            <Field label="Marke / Modell" value={form.brandModel} onChange={(value) => setForm({ ...form, brandModel: value })} required />
            <label className="space-y-2">
              <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Leistung</span>
              <select value={form.serviceType} onChange={(event) => setForm({ ...form, serviceType: event.target.value })} className="account-input">
                <option>Reparatur</option>
                <option>Diagnose</option>
                <option>Akku Prüfung</option>
                <option>Unfall / Schaden</option>
                <option>Service / Wartung</option>
                <option>Zubehör Montage</option>
              </select>
            </label>
            <label className="space-y-2 md:col-span-2">
              <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Wunschtermin</span>
              <input type="datetime-local" value={form.preferredDate} onChange={(event) => setForm({ ...form, preferredDate: event.target.value })} className="account-input" required />
            </label>
            <label className="space-y-2 md:col-span-2">
              <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Beschreibung</span>
              <textarea value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} className="account-input min-h-32" placeholder="Fehlerbild, Geräusche, Schaden, gewünschte Arbeiten, Seriennummer..." required />
            </label>
          </div>
          {message && (
            <div className="mt-4 flex items-start gap-3 rounded-2xl border border-accent/30 bg-accent/10 p-4 text-sm font-bold text-accent">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
              {message}
            </div>
          )}
          <Button variant="primary" className="mt-5 w-full" disabled={loading}>
            {loading ? 'Wird gesendet...' : 'Kostenvoranschlag Termin anfragen'}
          </Button>
        </form>
      </div>
    </section>
  )
}

function Field({ label, value, onChange, required = false, type = 'text' }: { label: string; value: string; onChange: (value: string) => void; required?: boolean; type?: string }) {
  return (
    <label className="space-y-2">
      <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">{label}</span>
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} required={required} className="account-input" />
    </label>
  )
}
