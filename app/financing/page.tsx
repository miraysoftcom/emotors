'use client'

import { LuxuryHeader } from '@/components/navigation/LuxuryHeader'
import { Footer } from '@/components/navigation/Footer'
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

export default function FinancingPage() {
  const [amount, setAmount] = useState(5000)
  const [term, setTerm] = useState(24)
  const [interestRate] = useState(0)

  const monthlyPayment = term > 0 ? Math.round((amount / term) * 100) / 100 : 0
  const totalCost = monthlyPayment * term

  return (
    <main className="w-full bg-background">
      <LuxuryHeader />

      {/* Hero */}
      <div className="bg-accent text-accent-foreground py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-black tracking-tighter mb-4">Flexible Finanzierung</h1>
          <p className="text-lg opacity-90">
            0% Zinsen auf alle Ratenzahlungen • Flexible Laufzeiten • Schnelle Genehmigung
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Calculator */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold mb-8">Finanzierungsrechner</h2>

              {/* Amount Slider */}
              <div className="space-y-4 mb-8">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Finanzierungsbetrag
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="1000"
                      max="50000"
                      step="500"
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      className="flex-1 h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="text-2xl font-bold text-accent min-w-fit">CHF {amount.toLocaleString()}</span>
                  </div>
                  <input
                    type="number"
                    min="1000"
                    max="50000"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="mt-2 w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground"
                  />
                </div>

                {/* Term Select */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Laufzeit (Monate)
                  </label>
                  <select
                    value={term}
                    onChange={(e) => setTerm(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground"
                  >
                    <option value={12}>12 Monate</option>
                    <option value={24}>24 Monate</option>
                    <option value={36}>36 Monate</option>
                    <option value={48}>48 Monate</option>
                  </select>
                </div>
              </div>

              {/* Results */}
              <div className="bg-secondary rounded-lg p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Monatliche Rate</p>
                    <p className="text-3xl font-bold text-accent">CHF {monthlyPayment}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Gesamtbetrag</p>
                    <p className="text-3xl font-bold text-foreground">CHF {totalCost.toLocaleString()}</p>
                  </div>
                </div>
                <div className="pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    Zinssatz: <span className="font-semibold text-foreground">{interestRate}%</span>
                  </p>
                </div>
              </div>

              {/* CTA */}
              <button className="w-full mt-8 py-3 px-4 bg-accent text-accent-foreground rounded-lg font-semibold hover:shadow-lg transition-all duration-300">
                Jetzt Beantragen
              </button>
            </div>
          </div>

          {/* Benefits */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold mb-6">Warum MOBILTY Finanzierung?</h2>

              <div className="space-y-4">
                {[
                  {
                    title: '0% Zinsen',
                    description: 'Zahlen Sie den Kaufpreis zinslos in flexiblen Raten.',
                  },
                  {
                    title: 'Schnelle Genehmigung',
                    description: 'Sofortige Online-Genehmigung für bis zu CHF 50\'000.',
                  },
                  {
                    title: 'Flexible Laufzeiten',
                    description: 'Wählen Sie zwischen 12 und 48 Monaten.',
                  },
                  {
                    title: 'Keine versteckten Gebühren',
                    description: 'Vollständige Transparenz mit allen Kosten im Voraus.',
                  },
                  {
                    title: '2 Jahre Garantie',
                    description: 'Volle Garantie auf Ihr finanziertes Produkt.',
                  },
                  {
                    title: 'Gratis Lieferung',
                    description: 'Kostenloser Versand mit Finanzierung.',
                  },
                ].map((benefit, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="text-2xl text-accent">✓</div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">{benefit.title}</h3>
                      <p className="text-sm text-muted-foreground">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* FAQ */}
            <div>
              <h3 className="text-lg font-bold mb-4">Häufig gestellte Fragen</h3>
              <div className="space-y-2">
                {[
                  {
                    q: 'Wie schnell wird mein Antrag genehmigt?',
                    a: 'Die meisten Anträge werden sofort online genehmigt.',
                  },
                  {
                    q: 'Kann ich meine Laufzeit ändern?',
                    a: 'Ja, Sie können die Laufzeit jederzeit mit unserer Kundenbetreuung anpassen.',
                  },
                  {
                    q: 'Gibt es Versicherungsoptionen?',
                    a: 'Ja, wir bieten optionale Versicherungspakete an.',
                  },
                ].map((item, idx) => (
                  <details key={idx} className="group p-3 bg-secondary rounded-lg cursor-pointer">
                    <summary className="font-semibold flex items-center justify-between">
                      {item.q}
                      <ChevronDown size={18} className="group-open:rotate-180 transition-transform" />
                    </summary>
                    <p className="mt-3 text-sm text-muted-foreground">{item.a}</p>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
