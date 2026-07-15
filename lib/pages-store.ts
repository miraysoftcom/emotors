import fs from 'fs'
import path from 'path'

const STORE_FILE = path.join(process.cwd(), '.data', 'pages.json')

export interface ManagedPage {
  id: number
  title: string
  slug: string
  language: string
  content: string
  seoTitle?: string
  seoDescription?: string
  active: boolean
  visible: boolean
  createdAt: string
  updatedAt: string
}

const defaultPageSeeds = [
  {
    id: 1,
    title: 'Über uns',
    slug: 'ueber-uns',
    language: 'de',
    content: `
<section>
  <h2>MK-eMotors Dornach</h2>
  <p>MK-eMotors Dornach steht für moderne Elektromobilität, persönliche Beratung und zuverlässigen Service in der Schweiz. Unser Ziel ist es, hochwertige E-Scooter, E-Mopeds und E-Motorräder verständlich, sicher und alltagstauglich anzubieten.</p>
</section>
<section>
  <h2>Unsere Mission</h2>
  <p>Wir verbinden Schweizer Qualitätsanspruch mit urbaner Mobilität. Kunden sollen bei uns nicht nur ein Fahrzeug kaufen, sondern eine komplette Lösung erhalten: Beratung, Probefahrt, Finanzierung, Zubehör, Ersatzteile, Garantie und Service.</p>
</section>
<section>
  <h2>Beratung und Service</h2>
  <p>Vor dem Kauf unterstützen wir bei Führerscheinfragen, Reichweite, Akku, Nutzung im Alltag und Finanzierung. Nach dem Kauf bleiben wir Ansprechpartner für Wartung, Garantie, Ersatzteile und technische Fragen.</p>
</section>
<section>
  <h2>Unsere Werte</h2>
  <ul>
    <li>Transparente Beratung ohne Druck</li>
    <li>Hochwertige Produkte für Schweizer Strassen</li>
    <li>Zuverlässiger Kundendienst und klare Abläufe</li>
    <li>Nachhaltige Mobilität für Alltag, Arbeit und Freizeit</li>
  </ul>
</section>`,
    active: true,
    visible: true,
  },
  {
    id: 2,
    title: 'Allgemeine Geschäftsbedingungen (AGB)',
    slug: 'agb',
    language: 'de',
    content: `
<section>
  <h2>1. Geltungsbereich</h2>
  <p>Diese Allgemeinen Geschäftsbedingungen gelten für alle Bestellungen, Kaufverträge, Serviceleistungen und Angebote zwischen MK-eMotors Dornach und Kundinnen sowie Kunden über diesen Online-Shop oder direkte Verkaufskanäle.</p>
</section>
<section>
  <h2>2. Vertragsabschluss</h2>
  <p>Die Darstellung der Produkte im Shop stellt kein rechtlich bindendes Angebot dar. Ein Vertrag kommt zustande, sobald die Bestellung durch MK-eMotors Dornach bestätigt oder die Ware ausgeliefert wird.</p>
</section>
<section>
  <h2>3. Preise und Zahlung</h2>
  <p>Alle Preise werden in Schweizer Franken (CHF) angezeigt. Je nach Einstellung im Shop verstehen sich Preise inklusive oder exklusive Mehrwertsteuer. Akzeptierte Zahlungsarten werden im Checkout angezeigt.</p>
</section>
<section>
  <h2>4. Lieferung und Abholung</h2>
  <p>Lieferfristen werden nach Verfügbarkeit angegeben. Verzögerungen durch Hersteller, Versanddienstleister oder höhere Gewalt berechtigen nicht automatisch zu Schadenersatzansprüchen.</p>
</section>
<section>
  <h2>5. Probefahrt, Zulassung und Nutzung</h2>
  <p>Kundinnen und Kunden sind selbst verantwortlich, vor der Nutzung die geltenden Vorschriften zu Führerausweis, Versicherung, Helm, Zulassung und Strassenverkehr einzuhalten.</p>
</section>
<section>
  <h2>6. Garantie und Gewährleistung</h2>
  <p>Garantieansprüche richten sich nach Produkt, Herstellerbedingungen und den Angaben auf Rechnung oder Garantienachweis. Verschleissteile, unsachgemässe Nutzung und nicht autorisierte Änderungen können ausgeschlossen sein.</p>
</section>
<section>
  <h2>7. Rückgabe und Stornierung</h2>
  <p>Rückgaben, Stornierungen oder Umtausch werden individuell geprüft. Bereits zugelassene, benutzte oder speziell bestellte Fahrzeuge können vom Rückgaberecht ausgeschlossen sein.</p>
</section>
<section>
  <h2>8. Haftung</h2>
  <p>MK-eMotors Dornach haftet nur für direkte Schäden, die nachweislich durch eigenes Verschulden entstanden sind. Eine Haftung für indirekte Schäden, Folgeschäden oder unsachgemässe Verwendung ist ausgeschlossen, soweit gesetzlich zulässig.</p>
</section>
<section>
  <h2>9. Anwendbares Recht</h2>
  <p>Es gilt Schweizer Recht. Gerichtsstand ist, soweit zulässig, der Sitz von MK-eMotors Dornach.</p>
</section>`,
    active: true,
    visible: true,
  },
  {
    id: 3,
    title: 'Datenschutzerklärung',
    slug: 'datenschutz',
    language: 'de',
    content: `
<section>
  <h2>1. Verantwortliche Stelle</h2>
  <p>Verantwortlich für die Bearbeitung personenbezogener Daten ist MK-eMotors Dornach. Kontakt: info@mk-emotorsdornach.ch.</p>
</section>
<section>
  <h2>2. Bearbeitete Daten</h2>
  <p>Wir bearbeiten Daten, die für Bestellung, Kundenkonto, Probefahrt, Service, Garantie, Support, Zahlung, Lieferung und Kommunikation erforderlich sind. Dazu gehören Name, Adresse, E-Mail, Telefon, Bestelldaten, Zahlungsstatus und technische Nutzungsdaten.</p>
</section>
<section>
  <h2>3. Zweck der Datenbearbeitung</h2>
  <ul>
    <li>Abwicklung von Bestellungen und Zahlungen</li>
    <li>Bereitstellung des Kundenkontos</li>
    <li>Bearbeitung von Service-, Garantie- und Supportanfragen</li>
    <li>Kommunikation zu Bestellungen, Terminen und Angeboten</li>
    <li>Verbesserung von Sicherheit, Shop-Funktionen und Benutzererlebnis</li>
  </ul>
</section>
<section>
  <h2>4. Weitergabe an Dritte</h2>
  <p>Daten werden nur weitergegeben, wenn dies für Zahlungsabwicklung, Versand, technische Infrastruktur, gesetzliche Pflichten oder Kundenservice notwendig ist.</p>
</section>
<section>
  <h2>5. Cookies und Tracking</h2>
  <p>Der Shop kann Cookies und Analyse-Technologien verwenden, um Funktionen bereitzustellen, Warenkorb und Login zu ermöglichen und die Website zu verbessern. Tracking-Integrationen werden gemäss Shop-Einstellungen verwendet.</p>
</section>
<section>
  <h2>6. Speicherdauer</h2>
  <p>Personendaten werden nur so lange gespeichert, wie es für die genannten Zwecke, gesetzliche Aufbewahrungspflichten oder berechtigte Interessen erforderlich ist.</p>
</section>
<section>
  <h2>7. Rechte der betroffenen Personen</h2>
  <p>Sie können Auskunft, Berichtigung, Löschung, Einschränkung oder Herausgabe Ihrer Daten verlangen, soweit keine gesetzlichen Pflichten entgegenstehen.</p>
</section>`,
    active: true,
    visible: true,
  },
  {
    id: 4,
    title: 'Impressum',
    slug: 'impressum',
    language: 'de',
    content: `
<section>
  <h2>Unternehmen</h2>
  <p><strong>MK-eMotors Dornach</strong><br>Bruggweg 15<br>4143 Dornach<br>Schweiz</p>
</section>
<section>
  <h2>Kontakt</h2>
  <p>E-Mail: info@mk-emotorsdornach.ch<br>Website: www.mk-emotorsdornach.ch</p>
</section>
<section>
  <h2>UID / MWST</h2>
  <p>UID / MWST-Nummer: CHE-338.677.589</p>
</section>
<section>
  <h2>Haftung für Inhalte</h2>
  <p>Die Inhalte dieser Website werden sorgfältig erstellt. Für Vollständigkeit, Aktualität und Richtigkeit kann jedoch keine Gewähr übernommen werden.</p>
</section>
<section>
  <h2>Haftung für Links</h2>
  <p>Diese Website kann Links zu externen Seiten enthalten. Für deren Inhalte sind ausschliesslich die jeweiligen Betreiber verantwortlich.</p>
</section>
<section>
  <h2>Urheberrecht</h2>
  <p>Texte, Bilder, Layouts und Inhalte dieser Website sind urheberrechtlich geschützt. Eine Verwendung ohne Zustimmung ist nicht gestattet.</p>
</section>`,
    active: true,
    visible: true,
  },
  { id: 5, title: 'Ratenzahlung', slug: 'ratenzahlung', language: 'de', content: '<section><h2>Ratenzahlung</h2><p>Informationen zu Finanzierung, Ratenzahlung und Zahlungsoptionen können hier im Admin Panel gepflegt werden.</p></section>', active: true, visible: true },
]

const defaultPages: ManagedPage[] = defaultPageSeeds.map((page) => ({
  ...page,
  seoTitle: page.title,
  seoDescription: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}))

function ensureStore() {
  const dir = path.dirname(STORE_FILE)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  if (!fs.existsSync(STORE_FILE)) fs.writeFileSync(STORE_FILE, JSON.stringify(defaultPages, null, 2))
}

export function getManagedPages() {
  ensureStore()
  try {
    return mergeDefaultPages(JSON.parse(fs.readFileSync(STORE_FILE, 'utf-8')) as ManagedPage[])
  } catch {
    return mergeDefaultPages(defaultPages)
  }
}

export function getManagedPageBySlug(slug: string) {
  return getManagedPages().find((page) => page.slug === slug && page.active)
}

function savePages(pages: ManagedPage[]) {
  ensureStore()
  fs.writeFileSync(STORE_FILE, JSON.stringify(pages, null, 2))
}

function mergeDefaultPages(pages: ManagedPage[]) {
  let changed = false
  const now = new Date().toISOString()
  const next = [...pages]

  defaultPages.forEach((defaultPage) => {
    const existingIndex = next.findIndex((page) => page.slug === defaultPage.slug)
    if (existingIndex === -1) {
      next.push({ ...defaultPage, createdAt: now, updatedAt: now })
      changed = true
      return
    }

    const existing = next[existingIndex]
    if (!String(existing.content || '').trim()) {
      next[existingIndex] = {
        ...defaultPage,
        ...existing,
        title: existing.title || defaultPage.title,
        seoTitle: existing.seoTitle || defaultPage.seoTitle,
        seoDescription: existing.seoDescription || defaultPage.seoDescription,
        content: defaultPage.content,
        active: existing.active !== false,
        visible: existing.visible !== false,
        updatedAt: now,
      }
      changed = true
    }
  })

  if (changed) savePages(next)
  return next
}

export function upsertManagedPage(data: Partial<ManagedPage>) {
  const pages = getManagedPages()
  const now = new Date().toISOString()
  if (data.id) {
    const existing = pages.find((page) => page.id === data.id)
    if (!existing) return null
    const updated = { ...existing, ...data, updatedAt: now } as ManagedPage
    savePages(pages.map((page) => page.id === data.id ? updated : page))
    return updated
  }
  const page: ManagedPage = {
    id: Math.max(0, ...pages.map((item) => item.id)) + 1,
    title: data.title || 'Neue Seite',
    slug: data.slug || `seite-${Date.now()}`,
    language: data.language || 'de',
    content: data.content || '',
    seoTitle: data.seoTitle || data.title || '',
    seoDescription: data.seoDescription || '',
    active: data.active !== false,
    visible: data.visible !== false,
    createdAt: now,
    updatedAt: now,
  }
  savePages([...pages, page])
  return page
}

export function deleteManagedPage(id: number) {
  const pages = getManagedPages()
  const next = pages.filter((page) => page.id !== id)
  if (next.length === pages.length) return false
  savePages(next)
  return true
}
