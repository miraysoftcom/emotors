'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Wrench, Shield, Battery, Car, Settings, Headset } from 'lucide-react'
import Link from 'next/link'
import { TestDriveModal } from '@/components/modals/TestDriveModal'
import { SplitTitle } from '@/components/common/SplitTitle'

interface Service {
  id: number
  title: string
  description: string
  icon: string
  cta_text?: string
  cta_link?: string
  order: number
}

interface PremiumServiceProps {
  services?: Service[]
  title?: string
  description?: string
}

const defaultServices: Service[] = [
  {
    id: 1,
    title: 'Werkstatt & Reparatur',
    description: 'Professioneller Service für Elektrofahrzeuge und schnelle Lösungen bei Problemen.',
    icon: 'wrench',
    cta_text: 'Mehr erfahren',
    cta_link: '/contact',
    order: 1,
  },
  {
    id: 2,
    title: 'Wartung & Inspektion',
    description: 'Regelmässige Kontrolle und Pflege für maximale Lebensdauer.',
    icon: 'shield',
    cta_text: 'Mehr erfahren',
    cta_link: '/contact',
    order: 2,
  },
  {
    id: 3,
    title: 'Ersatzteile',
    description: 'Original Ersatzteile und Zubehör für unsere Fahrzeuge.',
    icon: 'battery',
    cta_text: 'Mehr erfahren',
    cta_link: '/produkte',
    order: 3,
  },
  {
    id: 4,
    title: 'Finanzierung & Beratung',
    description: 'Individuelle Beratung und flexible Finanzierungsmöglichkeiten.',
    icon: 'car',
    cta_text: 'Mehr erfahren',
    cta_link: '/financing',
    order: 4,
  },
  {
    id: 5,
    title: 'Probefahrt',
    description: 'Erleben Sie unsere Fahrzeuge persönlich bei einer Probefahrt.',
    icon: 'settings',
    cta_text: 'Jetzt buchen',
    cta_link: '/contact',
    order: 5,
  },
  {
    id: 6,
    title: 'Kunden Support',
    description: 'Schnelle Hilfe und persönliche Betreuung.',
    icon: 'headset',
    cta_text: 'Support kontaktieren',
    cta_link: '/contact',
    order: 6,
  },
]

const iconMap = {
  wrench: Wrench,
  shield: Shield,
  battery: Battery,
  car: Car,
  settings: Settings,
  headset: Headset,
}

export function PremiumService({
  services = defaultServices,
  title = 'Unser Service',
  description = 'Premium Service für Ihre Mobilität',
}: PremiumServiceProps) {
  const [testDriveOpen, setTestDriveOpen] = useState(false)

  return (
    <section className="relative w-full py-32 overflow-hidden">
      {/* Premium Dark Background */}
      <div className="absolute inset-0 bg-background dark:bg-gradient-to-br dark:from-[#0f0f0f] dark:to-[#1a1a1a]">
        {/* Subtle gradient overlays */}
        <motion.div
          animate={{ 
            opacity: [0.05, 0.15, 0.05],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-0 left-0 w-[500px] h-[500px] bg-accent/20 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{ 
            opacity: [0.08, 0.12, 0.08],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-accent/15 rounded-full blur-[140px]"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
          className="text-center mb-24"
        >
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter mb-6 leading-tight">
            <SplitTitle title={title} />
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto font-light">
            {description}
          </p>
        </motion.div>

        {/* Service Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {services.map((service, index) => {
            const IconComponent = iconMap[service.icon as keyof typeof iconMap] || Wrench
            const isTestDrive = service.title.toLowerCase().includes('probefahrt')

            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className="group"
              >
                <div className="relative h-full">
                  {/* Glass morphism card */}
                  <div className="absolute -inset-0.5 bg-gradient-to-br from-accent/20 to-accent/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur" />
                  
                  <div className="relative h-full p-8 bg-card/60 dark:bg-card/40 backdrop-blur-md border border-accent/10 dark:border-accent/20 rounded-2xl transition-all duration-500 group-hover:bg-card/80 dark:group-hover:bg-card/60">
                    {/* Glow effect on hover */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                      style={{
                        background: 'radial-gradient(circle at 50% 50%, rgba(199, 155, 82, 0.1), transparent 70%)',
                      }}
                    />

                    {/* Icon */}
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ duration: 0.3 }}
                      className="mb-6"
                    >
                      <div className="w-16 h-16 bg-accent/10 dark:bg-accent/20 rounded-xl flex items-center justify-center group-hover:bg-accent/20 dark:group-hover:bg-accent/30 transition-colors duration-300">
                        <IconComponent className="w-8 h-8 text-accent" />
                      </div>
                    </motion.div>

                    {/* Content */}
                    <div className="relative z-10">
                      <h3 className="text-2xl font-black mb-3 leading-tight">
                        {service.title}
                      </h3>
                      <div
                        className="managed-page-content mb-6 text-base font-light leading-relaxed text-muted-foreground"
                        dangerouslySetInnerHTML={{ __html: service.description }}
                      />

                      {/* CTA Button */}
                      {service.cta_link && isTestDrive ? (
                        <button
                          type="button"
                          onClick={() => setTestDriveOpen(true)}
                          className="inline-flex items-center gap-2 px-6 py-3 bg-accent/10 dark:bg-accent/20 text-accent font-semibold rounded-xl hover:bg-accent hover:text-accent-foreground transition-all duration-300 group/btn"
                        >
                          {service.cta_text || 'Mehr erfahren'}
                          <motion.span
                            className="inline-block"
                            whileHover={{ x: 4 }}
                            transition={{ type: 'spring', stiffness: 400 }}
                          >
                            →
                          </motion.span>
                        </button>
                      ) : service.cta_link ? (
                        <Link
                          href={service.cta_link}
                          className="inline-flex items-center gap-2 px-6 py-3 bg-accent/10 dark:bg-accent/20 text-accent font-semibold rounded-xl hover:bg-accent hover:text-accent-foreground transition-all duration-300 group/btn"
                        >
                          {service.cta_text || 'Mehr erfahren'}
                          <motion.span
                            className="inline-block"
                            whileHover={{ x: 4 }}
                            transition={{ type: 'spring', stiffness: 400 }}
                          >
                            →
                          </motion.span>
                        </Link>
                      ) : null}
                    </div>

                    {/* Bottom accent line */}
                    <motion.div
                      initial={{ width: 0 }}
                      whileHover={{ width: '100%' }}
                      transition={{ duration: 0.5 }}
                      className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-accent via-accent to-transparent rounded-b-2xl"
                    />
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center mt-24"
        >
          <p className="text-lg text-muted-foreground mb-8 font-light">
            Haben Sie weitere Fragen? Kontaktieren Sie uns gerne.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-3 px-8 py-4 bg-accent text-accent-foreground font-semibold rounded-xl hover:shadow-lg hover:shadow-accent/30 transition-all duration-300 hover:scale-105"
          >
            Jetzt Kontakt aufnehmen
            <span className="inline-block">→</span>
          </Link>
        </motion.div>
      </div>
      <TestDriveModal isOpen={testDriveOpen} onClose={() => setTestDriveOpen(false)} />
    </section>
  )
}
