'use client'

import { motion } from 'framer-motion'

interface TimelineEvent {
  year: number
  title: string
  description: string
}

interface TimelineProps {
  events?: TimelineEvent[]
}

export function UeberUnsTimeline({
  events = [
    {
      year: 2009,
      title: 'Unternehmensgrü ndung',
      description: 'MK-eMotors wurde mit einer Leidenschaft für Elektromobilität gegründet',
    },
    {
      year: 2013,
      title: 'Erste Expansion',
      description: 'Eröffnung zusätzlicher Standorte in der Schweiz',
    },
    {
      year: 2018,
      title: 'Technologie-Upgrade',
      description: 'Investition in modernste Technologie und Infrastruktur',
    },
    {
      year: 2023,
      title: 'Premium-Linie gestartet',
      description: 'Launch der exklusiven Premium-Elektromobilität Serie',
    },
    {
      year: 2025,
      title: 'Globale Vision',
      description: 'Expansion auf europäische Märkte geplant',
    },
  ],
}: TimelineProps) {
  return (
    <section className="py-24 md:py-32 bg-background dark:bg-background">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <p className="text-accent text-sm font-semibold uppercase tracking-widest mb-3">
            Unser Weg
          </p>
          <h2 className="text-4xl md:text-5xl font-black">Zeitleiste der Innovation</h2>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-1/2 -translate-x-1/2 w-1 h-full bg-gradient-to-b from-accent via-accent to-transparent" />

          {/* Events */}
          <div className="space-y-12">
            {events.map((event, index) => (
              <motion.div
                key={event.year}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}
              >
                {/* Content */}
                <div className={`w-1/2 ${index % 2 === 0 ? 'pr-12 text-right' : 'pl-12 text-left'}`}>
                  <div className="bg-card dark:bg-card border border-border rounded-2xl p-8 shadow-luxury-md hover:shadow-luxury-lg transition-all duration-300">
                    <div className="text-5xl font-black text-accent mb-2">{event.year}</div>
                    <h3 className="text-2xl font-bold mb-3">{event.title}</h3>
                    <p className="text-foreground/60">{event.description}</p>
                  </div>
                </div>

                {/* Center Dot */}
                <div className="w-0 flex justify-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="w-6 h-6 bg-accent rounded-full border-4 border-background dark:border-background relative z-10"
                  />
                </div>

                {/* Empty Space */}
                <div className="w-1/2" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
