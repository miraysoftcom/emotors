'use client'

import { LuxuryHeader } from '@/components/navigation/LuxuryHeader'
import { Footer } from '@/components/navigation/Footer'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function RatenzahlungPage() {
  const plans = [
    { months: 6, monthlyRate: 2.99, description: '6 Zahlungen' },
    { months: 12, monthlyRate: 1.99, description: '12 Zahlungen' },
    { months: 24, monthlyRate: 0.99, description: '24 Zahlungen' },
  ]

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background-secondary to-background">
      <LuxuryHeader />
      
      <div className="pt-32 pb-20">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl font-bold text-primary mb-4">Flexible Ratenzahlung</h1>
            <p className="text-xl text-muted-foreground">
              Finanzieren Sie Ihren Kauf flexibel und ohne versteckte Gebühren
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {plans.map((plan, idx) => (
              <motion.div
                key={plan.months}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className="theme-card p-8 transition-shadow hover:shadow-lg"
              >
                <h3 className="text-2xl font-bold text-primary mb-2">{plan.months} Monate</h3>
                <p className="text-muted-foreground mb-4">{plan.description}</p>
                <div className="text-3xl font-bold text-accent mb-6">
                  {plan.monthlyRate}%<span className="text-sm text-muted-foreground">/Monat</span>
                </div>
                <Link
                  href="/finanzierungsrechner"
                  className="block w-full bg-accent text-accent-foreground text-center py-3 rounded-lg hover:bg-accent/90 transition-colors"
                >
                  Berechnen
                </Link>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="theme-card p-8 mb-16"
          >
            <h2 className="text-3xl font-bold text-primary mb-6">So funktioniert's</h2>
            
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-accent rounded-lg flex items-center justify-center text-white font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Produkt wählen</h3>
                  <p className="text-muted-foreground">
                    Wählen Sie das gewünschte E-Moped oder E-Motorrad aus unserem Shop
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-accent rounded-lg flex items-center justify-center text-white font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Ratenzahlung berechnen</h3>
                  <p className="text-muted-foreground">
                    Nutzen Sie unseren Finanzierungsrechner, um die beste Zahlungsplan für Sie zu finden
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-accent rounded-lg flex items-center justify-center text-white font-bold">
                  3
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Bestellung bestätigen</h3>
                  <p className="text-muted-foreground">
                    Bestätigen Sie Ihre Bestellung und wählen Sie Ihre bevorzugte Zahlungsmethode
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-accent rounded-lg flex items-center justify-center text-white font-bold">
                  4
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Versand & Zahlung</h3>
                  <p className="text-muted-foreground">
                    Ihr Produkt wird versandt und Sie zahlen in praktischen Raten
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="rounded-2xl border border-accent/25 bg-gradient-to-r from-accent/25 to-surface-active p-8 text-foreground"
          >
            <h2 className="text-2xl font-bold mb-4">Häufig gestellte Fragen</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-bold mb-2">Gibt es versteckte Gebühren?</h3>
                <p>Nein, alle Zinsen und Gebühren werden transparent vor der Bestätigung angezeigt.</p>
              </div>
              
              <div>
                <h3 className="font-bold mb-2">Brauche ich eine Kreditprüfung?</h3>
                <p>Für unsere Ratenzahlungspläne wird eine Bonitätsprüfung durchgeführt.</p>
              </div>

              <div>
                <h3 className="font-bold mb-2">Kann ich vorzeitig bezahlen?</h3>
                <p>Ja, Sie können jederzeit vorzeitig zahlen, ohne zusätzliche Kosten zu haben.</p>
              </div>

              <div>
                <h3 className="font-bold mb-2">Welche Zahlungsmethoden werden akzeptiert?</h3>
                <p>Wir akzeptieren Kreditkarten, Banktransfers und TWINT für Ratenzahlungen.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
