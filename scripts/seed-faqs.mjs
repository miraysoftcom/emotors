import fs from 'fs'
import path from 'path'

const root = process.cwd()
const dataDir = path.join(root, '.data')
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true })

const categoryPlan = [
  ['Allgemein', 'allgemein', 20, ['Firma', 'Produkte', 'Marken', 'Bestellung', 'Kundenkonto', 'Sicherheit', 'Kontakt', 'Showroom']],
  ['E-Scooter', 'e-scooter', 35, ['Reichweite', 'Motorleistung', 'Geschwindigkeit', 'Akku', 'Laden', 'Steigungen', 'Reifen', 'Federung', 'Bremsen', 'IP-Schutz', 'Pflege', 'Winterbetrieb', 'Sommerbetrieb']],
  ['E-Bikes', 'e-bikes', 35, ['Mittelmotor', 'Heckmotor', 'Akku', 'Laden', 'Reichweite', 'Schaltung', 'Rahmen', 'Rahmengröße', 'Reifen', 'Wartung', 'Pendeln']],
  ['E-Motorräder', 'e-motorraeder', 35, ['Leistung', 'Akku', 'Ladezeit', 'Reichweite', 'Führerschein', 'Versicherung', 'Zulassung', 'Kennzeichen', 'Service', 'Garantie', 'Fahrmodi', 'ABS', 'CBS']],
  ['Akkus & Laden', 'akkus-laden', 20, ['Lebensdauer', 'Ladezeit', 'Schnellladen', 'Winterladen', 'Lagerung', 'Sicherheit', 'Akkutausch', 'Pflege']],
  ['Lieferung', 'lieferung', 20, ['Versand', 'Sendungsverfolgung', 'Paket', 'Transportschaden', 'Lieferzeit', 'Schweiz', 'Deutschland', 'Österreich', 'Ausland']],
  ['Zahlung', 'zahlung', 15, ['TWINT', 'PayPal', 'Kreditkarte', 'Apple Pay', 'Google Pay', 'Klarna', 'Vorkasse', 'Ratenzahlung', 'Rechnung']],
  ['Garantie', 'garantie', 20, ['Garantieumfang', 'Akkugarantie', 'Motorgarantie', 'Herstellergarantie', 'Service', 'Reparatur', 'Ersatzteile']],
  ['Rückgabe', 'rueckgabe', 15, ['Rückgabe', 'Stornierung', 'Widerruf', 'Beschädigung', 'Fehlteile', 'Umtausch']],
  ['Wartung', 'wartung', 20, ['Service', 'Reifen', 'Bremsen', 'Akku', 'Software', 'Firmware', 'Wartungsintervalle']],
  ['Ersatzteile', 'ersatzteile', 15, ['Originalteile', 'Lagerbestand', 'Kompatibilität', 'Verschleißteile', 'Zubehör']],
  ['Rechtliches', 'rechtliches', 20, ['Straßenzulassung', 'Versicherung', 'Helmpflicht', 'Kennzeichen', 'Führerschein', 'Schweiz', 'Deutschland', 'EU']],
  ['Unternehmen', 'unternehmen', 10, ['Firma', 'Support', 'B2B', 'Großbestellung', 'Partnerschaft']],
  ['Nachhaltigkeit', 'nachhaltigkeit', 10, ['Umwelt', 'Recycling', 'Akku-Recycling', 'Energieverbrauch', 'Lebensdauer']],
  ['Sicherheit', 'sicherheit', 20, ['Helm', 'Schutzausrüstung', 'Akkusicherheit', 'Brandvermeidung', 'Ladesicherheit', 'Kinder']],
]

const productPhrases = {
  'Allgemein': 'elektrische Mobilitätsprodukte',
  'E-Scooter': 'E-Scooter',
  'E-Bikes': 'E-Bikes',
  'E-Motorräder': 'E-Motorräder',
  'Akkus & Laden': 'Akkus und Ladesysteme',
  'Lieferung': 'die Lieferung',
  'Zahlung': 'die Zahlung',
  'Garantie': 'Garantie und Service',
  'Rückgabe': 'Rückgabe und Widerruf',
  'Wartung': 'Wartung und Pflege',
  'Ersatzteile': 'Ersatzteile und Zubehör',
  'Rechtliches': 'rechtliche Vorgaben',
  'Unternehmen': 'MK E-Motors',
  'Nachhaltigkeit': 'nachhaltige Elektromobilität',
  'Sicherheit': 'sichere Elektromobilität',
}

const questionTemplates = [
  'Was muss ich vor dem Kauf zum Thema {topic} wissen?',
  'Worauf sollte ich beim Thema {topic} besonders achten?',
  'Welche Unterschiede sind beim Thema {topic} wirklich wichtig?',
  'Welche Rolle spielt das Thema {topic} für Sicherheit, Komfort und laufende Kosten?',
  'Welche Angaben zum Thema {topic} sollte ich beim Modellvergleich prüfen?',
  'Welche typischen Fehler passieren beim Thema {topic} besonders häufig?',
  'Wann ist eine persönliche Beratung zum Thema {topic} sinnvoll?',
  'Wie bewerte ich das Thema {topic} für Pendelstrecke, Stadtverkehr und Freizeit?',
  'Welche Vorteile bietet eine professionelle Lösung für das Thema {topic}?',
  'Welche Dokumente oder technischen Daten sind zum Thema {topic} wichtig?',
]

const serviceQuestionTemplates = [
  'Was muss ich zum Thema {topic} vor der Bestellung wissen?',
  'Welche Informationen sind für {topic} erforderlich?',
  'Was passiert, wenn es beim Thema {topic} Rückfragen oder Probleme gibt?',
  'Welche Fristen gelten beim Thema {topic}?',
  'Welche Vorteile bietet ein transparenter Ablauf beim Thema {topic}?',
  'Worauf sollte ich beim Thema {topic} vor dem Kauf achten?',
  'Wie unterstützt mich der Kundenservice beim Thema {topic}?',
  'Welche Kosten oder Nachweise können bei {topic} entstehen?',
  'Wie kann ich den Status zu {topic} nachvollziehen?',
  'Was ist bei {topic} für Schweiz, Deutschland und Österreich wichtig?',
]

function slugify(value) {
  return value
    .toLowerCase()
    .replaceAll('ä', 'ae')
    .replaceAll('ö', 'oe')
    .replaceAll('ü', 'ue')
    .replaceAll('ß', 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function questionFor(category, topic, index) {
  const serviceCategories = ['Lieferung', 'Zahlung', 'Garantie', 'Rückgabe', 'Unternehmen']
  const templates = serviceCategories.includes(category) ? serviceQuestionTemplates : questionTemplates
  const product = productPhrases[category] || category
  return templates[index % templates.length]
    .replaceAll('{topic}', topic)
    .replaceAll('{product}', product)
}

function answer(category, topic, index) {
  const product = productPhrases[category] || category
  const isService = ['Lieferung', 'Zahlung', 'Garantie', 'Rückgabe', 'Unternehmen'].includes(category)
  const intro = isService
    ? `${topic} sollte bei ${product} klar, nachvollziehbar und kundenfreundlich geregelt sein. Gerade bei hochwertigen E-Scootern, E-Bikes, E-Motorrädern und urbanen E-Mobility Produkten ist ein transparenter Ablauf wichtig, weil Kaufentscheidung, Lieferung, Zahlung, Service und spätere Betreuung zusammengehören. Gute FAQ-Antworten helfen dabei, Erwartungen realistisch einzuordnen und unnötige Rückfragen vor der Bestellung zu vermeiden.`
    : `${topic} ist ein entscheidender Faktor, wenn Sie ${product} nicht nur nach Preis, sondern nach Alltagstauglichkeit auswählen möchten. Wichtig ist, wie das Fahrzeug tatsächlich genutzt wird: täglicher Arbeitsweg, kurze Stadtstrecken, Steigungen, Zuladung, Wetter, Abstellort und verfügbare Lademöglichkeiten. Erst im Zusammenspiel dieser Punkte zeigt sich, ob ein Modell langfristig komfortabel, sicher und wirtschaftlich passt.`
  const middle = `Achten Sie auf nachvollziehbare technische Daten, saubere Herstellerangaben, passende Garantiebedingungen und eine verlässliche Ersatzteilversorgung. Bei Elektromobilität sollten Akku, Ladegerät, Motor, Bremsen, Reifen, Softwarestand und rechtliche Zulassung gemeinsam betrachtet werden. Ein vermeintlich günstiges Angebot ist nur dann sinnvoll, wenn Beratung, Service und Qualität ebenfalls stimmen.`
  const practical = isService
    ? `Für Kunden ist besonders hilfreich, wenn Fristen, Kosten, notwendige Unterlagen und Ansprechpartner vorab klar kommuniziert werden. Bewahren Sie Bestellbestätigung, Zahlungsbeleg, Seriennummern und Fotos vom Lieferzustand auf. So lassen sich Rückfragen schneller klären und Servicefälle professionell bearbeiten.`
    : `Praktisch ist ein kurzer Check vor dem Kauf: Welche Strecke fahren Sie regelmäßig? Wie viel Reserve benötigen Sie bei Reichweite und Leistung? Gibt es gesetzliche Vorgaben zu Versicherung, Führerschein oder Straßenzulassung? Wenn diese Fragen beantwortet sind, lässt sich das passende Fahrzeug deutlich sicherer auswählen.`
  const closing = index % 3 === 0
    ? `Unsere Empfehlung: Vergleichen Sie ${topic} immer im Kontext von Fahrprofil, Budget, Wartung und Einsatzort. So vermeiden Sie Fehlkäufe und erhalten eine elektrische Mobilitätslösung, die nicht nur im Datenblatt überzeugt, sondern im Alltag zuverlässig funktioniert.`
    : `Wenn Sie unsicher sind, lohnt sich eine persönliche Beratung. Viele Unterschiede zwischen E-Scooter, E-Bike, E-Motorrad, E-Moped und Zubehör werden erst im direkten Vergleich sichtbar und können für Sicherheit, Komfort und Betriebskosten entscheidend sein.`
  return `${intro}\n\n${middle}\n\n${practical}\n\n${closing}`
}

const categories = categoryPlan.map(([name, slug, count], index) => ({
  id: index + 1,
  name,
  slug,
  description: `Häufige Fragen rund um ${name} im Bereich elektrischer Mobilität.`,
  order: index + 1,
  active: true,
  seoTitle: `${name} FAQ | MK E-Motors Dornach`,
  seoDescription: `Antworten auf wichtige Fragen zu ${name}, Kaufberatung, Service, Sicherheit und rechtlichen Themen.`,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}))

let id = 1
const faqs = []

for (const [category, categorySlug, count, topics] of categoryPlan) {
  for (let i = 0; i < count; i += 1) {
    const topic = topics[i % topics.length]
    const question = questionFor(category, topic, i)
    const slug = slugify(`${category}-${topic}-${i + 1}-${question}`)
    const keywords = [
      category,
      topic,
      'Elektromobilität',
      'E-Scooter',
      'E-Bike',
      'E-Motorrad',
      'Kaufberatung',
    ]
    faqs.push({
      id,
      slug,
      category,
      categorySlug,
      question,
      title: question,
      answer: answer(category, topic, i + 1),
      keywords,
      searchTerms: [...keywords, question, `${topic} ${category}`, `FAQ ${category}`],
      seoTitle: `${question} | MK E-Motors FAQ`,
      seoDescription: `Ausführliche Antwort zu ${topic} bei ${category}: Kaufberatung, Sicherheit, Service und Alltagspraxis verständlich erklärt.`,
      canonicalUrl: `/faq#${slug}`,
      popular: i < 3,
      featured: i < 2,
      showOnHomepage: i < 2,
      showInFooter: i === 0,
      showOnCategoryPage: true,
      showOnProductPage: i < 4,
      showOnBlog: i % 7 === 0,
      status: 'active',
      order: id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    id += 1
  }
}

fs.writeFileSync(path.join(dataDir, 'faq-categories.json'), JSON.stringify(categories, null, 2))
fs.writeFileSync(path.join(dataDir, 'faqs.json'), JSON.stringify(faqs, null, 2))
console.log(`Seeded ${categories.length} FAQ categories and ${faqs.length} FAQs.`)
