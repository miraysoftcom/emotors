'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import { CalendarClock, CheckCircle2, Loader2, Mail, MessageSquareReply, Search, Wrench, type LucideIcon } from 'lucide-react'
import type { CustomerRequestRecord, CustomerRequestType } from '@/lib/customer-request-store'
import { HtmlEditor } from '@/components/admin/HtmlEditor'

const typeLabels: Record<CustomerRequestType | 'all', string> = {
  all: 'Alle',
  warranty: 'Garantie',
  service: 'Service',
  return: 'Rückgabe',
  trade_in: 'Secondhand / Tausch',
  estimate: 'Kostenvoranschlag',
  coupon: 'Coupon',
  newsletter: 'Newsletter',
  review: 'Bewertung',
}

const statusLabels: Record<CustomerRequestRecord['status'], string> = {
  new: 'Neu',
  in_review: 'In Bearbeitung',
  done: 'Erledigt',
}

export default function AdminCustomerRequestsPage() {
  const [requests, setRequests] = useState<CustomerRequestRecord[]>([])
  const [selected, setSelected] = useState<CustomerRequestRecord | null>(null)
  const [type, setType] = useState<CustomerRequestType | 'all'>('estimate')
  const [query, setQuery] = useState('')
  const [reply, setReply] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadRequests()
  }, [type])

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return requests
    return requests.filter((item) => [
      item.subject,
      item.email,
      item.name,
      item.phone,
      item.message,
      JSON.stringify(item.payload || {}),
    ].some((value) => String(value || '').toLowerCase().includes(normalized)))
  }, [requests, query])

  const stats = useMemo(() => ({
    total: requests.length,
    open: requests.filter((item) => item.status !== 'done').length,
    estimates: requests.filter((item) => item.type === 'estimate').length,
  }), [requests])

  async function loadRequests() {
    setLoading(true)
    const params = new URLSearchParams()
    if (type !== 'all') params.set('type', type)
    const response = await fetch(`/api/admin/customer-requests?${params}`, { credentials: 'include', cache: 'no-store' })
    if (response.status === 401) {
      window.location.href = '/admin/login'
      return
    }
    const data = await response.json()
    const next = data.requests || []
    setRequests(next)
    setSelected((current) => current ? next.find((item: CustomerRequestRecord) => item.id === current.id) || null : next[0] || null)
    setLoading(false)
  }

  async function updateStatus(request: CustomerRequestRecord, status: CustomerRequestRecord['status']) {
    const response = await fetch('/api/admin/customer-requests', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ id: request.id, status }),
    })
    if (response.ok) await loadRequests()
  }

  async function sendReply(event: FormEvent) {
    event.preventDefault()
    if (!selected || !reply.trim()) return
    setSending(true)
    setMessage('')
    const response = await fetch('/api/admin/customer-requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ id: selected.id, message: reply }),
    })
    const data = await response.json().catch(() => ({}))
    setSending(false)
    if (!response.ok) {
      setMessage(data.error || 'Antwort konnte nicht gesendet werden.')
      return
    }
    setReply('')
    setMessage(data.message || 'Antwort wurde gespeichert.')
    await loadRequests()
  }

  return (
    <main className="px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[92rem]">
        <section className="admin-gradient-border admin-surface mb-6 p-6 md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="admin-kicker">Service Center</p>
              <h1 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">
                Kostenvoranschlag <span className="text-accent">& Kundenanfragen</span>
              </h1>
              <p className="mt-3 max-w-3xl text-slate-300">
                Termine aus Meinkonto und von der Startseite zentral prüfen, beantworten und bearbeiten.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <Stat label="Gesamt" value={stats.total} />
              <Stat label="Offen" value={stats.open} />
              <Stat label="Kostenvoranschläge" value={stats.estimates} />
            </div>
          </div>
        </section>

        {message && (
          <div className="mb-6 rounded-3xl border border-accent/30 bg-accent/10 p-4 text-sm font-bold text-accent">
            {message}
          </div>
        )}

        <section className="mb-6 grid gap-4 lg:grid-cols-[1fr_auto_auto]">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Name, E-Mail, Betreff, Modell oder Nachricht suchen..."
              className="admin-input pl-12"
            />
          </div>
          <select value={type} onChange={(event) => setType(event.target.value as CustomerRequestType | 'all')} className="admin-input lg:w-72">
            {Object.entries(typeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
          <button onClick={loadRequests} className="rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-3 text-sm font-black hover:bg-white/[0.08]">
            Aktualisieren
          </button>
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="admin-surface p-3">
            {loading ? (
              <div className="grid min-h-80 place-items-center text-slate-400"><Loader2 className="h-7 w-7 animate-spin text-accent" /></div>
            ) : filtered.length === 0 ? (
              <div className="grid min-h-80 place-items-center text-center text-slate-400">Keine Anfragen gefunden.</div>
            ) : (
              <div className="grid gap-3">
                {filtered.map((request) => (
                  <button
                    key={request.id}
                    type="button"
                    onClick={() => setSelected(request)}
                    className={`rounded-3xl border p-4 text-left transition hover:border-accent/50 ${
                      selected?.id === request.id ? 'border-accent/60 bg-accent/10' : 'border-white/10 bg-white/[0.035]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-black text-white">{request.subject}</p>
                        <p className="mt-1 text-sm text-slate-400">{request.name || 'Kunde'} · {request.email}</p>
                      </div>
                      <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-black ${request.status === 'new' ? 'bg-accent text-black' : 'bg-white/10 text-slate-300'}`}>
                        {statusLabels[request.status]}
                      </span>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500">
                      <span>{typeLabels[request.type]}</span>
                      <span>{new Date(request.createdAt).toLocaleString('de-CH')}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <RequestDetail
            request={selected}
            reply={reply}
            sending={sending}
            onReplyChange={setReply}
            onSubmitReply={sendReply}
            onStatusChange={updateStatus}
          />
        </section>
      </div>
    </main>
  )
}

function RequestDetail({
  request,
  reply,
  sending,
  onReplyChange,
  onSubmitReply,
  onStatusChange,
}: {
  request: CustomerRequestRecord | null
  reply: string
  sending: boolean
  onReplyChange: (value: string) => void
  onSubmitReply: (event: FormEvent) => void
  onStatusChange: (request: CustomerRequestRecord, status: CustomerRequestRecord['status']) => void
}) {
  if (!request) {
    return <div className="admin-surface grid min-h-96 place-items-center p-8 text-center text-slate-400">Wählen Sie links eine Anfrage aus.</div>
  }

  const payloadEntries = Object.entries(request.payload || {}).filter(([, value]) => value !== '' && value !== null && value !== undefined)

  return (
    <article className="admin-surface p-6">
      <div className="flex flex-col gap-4 border-b border-white/10 pb-5 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="admin-kicker">{typeLabels[request.type]}</p>
          <h2 className="mt-2 text-3xl font-black">{request.subject}</h2>
          <p className="mt-2 text-slate-400">{new Date(request.createdAt).toLocaleString('de-CH')}</p>
        </div>
        <select value={request.status} onChange={(event) => onStatusChange(request, event.target.value as CustomerRequestRecord['status'])} className="admin-input md:w-52">
          {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Info icon={Mail} label="E-Mail" value={request.email} href={`mailto:${request.email}`} />
        <Info icon={CalendarClock} label="Telefon" value={request.phone || '-'} href={request.phone ? `tel:${request.phone}` : undefined} />
        <Info icon={Wrench} label="Status" value={statusLabels[request.status]} />
      </div>

      {payloadEntries.length > 0 && (
        <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.035] p-5">
          <h3 className="mb-4 text-lg font-black">Termin- und Fahrzeugdetails</h3>
          <div className="grid gap-3 md:grid-cols-2">
            {payloadEntries.map(([key, value]) => (
              <div key={key} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs font-black uppercase tracking-widest text-slate-500">{formatKey(key)}</p>
                <p className="mt-1 break-words font-bold text-white">{String(value)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {request.message && (
        <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.035] p-5">
          <h3 className="mb-3 text-lg font-black">Nachricht</h3>
          <p className="whitespace-pre-wrap leading-7 text-slate-300">{request.message}</p>
        </div>
      )}

      <form onSubmit={onSubmitReply} className="mt-6 rounded-3xl border border-accent/20 bg-accent/5 p-5">
        <h3 className="mb-3 flex items-center gap-2 text-lg font-black"><MessageSquareReply className="h-5 w-5 text-accent" /> Antwort schreiben</h3>
        <HtmlEditor
          label="Antwort als HTML"
          value={reply}
          onChange={onReplyChange}
          minHeightClassName="min-h-40"
          required
        />
        <button disabled={sending} className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-accent px-5 py-3 font-black text-black disabled:opacity-60">
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
          Antwort senden
        </button>
      </form>

      {(request.replies || []).length > 0 && (
        <div className="mt-6 space-y-3">
          <h3 className="text-lg font-black">Antwortverlauf</h3>
          {(request.replies || []).map((item) => (
            <div key={item.id} className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
              <p className="text-xs font-bold text-slate-500">{item.sentBy} · {new Date(item.sentAt).toLocaleString('de-CH')}</p>
              <div className="managed-page-content mt-2 text-slate-300" dangerouslySetInnerHTML={{ __html: item.message }} />
            </div>
          ))}
        </div>
      )}
    </article>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="admin-surface-soft min-w-36 p-4">
      <p className="text-xs font-black uppercase tracking-widest text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-black text-white">{value}</p>
    </div>
  )
}

function Info({ icon: Icon, label, value, href }: { icon: LucideIcon; label: string; value: string; href?: string }) {
  const content = (
    <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-4">
      <Icon className="h-5 w-5 text-accent" />
      <p className="mt-3 text-xs font-black uppercase tracking-widest text-slate-500">{label}</p>
      <p className="mt-1 break-words font-bold text-white">{value}</p>
    </div>
  )
  return href ? <a href={href}>{content}</a> : content
}

function formatKey(key: string) {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .replace(/^./, (value) => value.toUpperCase())
}
