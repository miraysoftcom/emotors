'use client'

import { motion } from 'framer-motion'

interface AboutCompanyProps {
  image?: string
  story?: string
  mission?: string
  vision?: string
  values?: Array<{ title: string; description: string }>
}

export function AboutCompany({
  image = 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=800&fit=crop',
  story = 'MK-E Motors wurde 2009 gegründet mit einer klaren Vision: Die Mobilität in der Schweiz zu revolutionieren. Mit jahrelanger Erfahrung und tiefem Verständnis für die Bedürfnisse unserer Kunden haben wir uns zum führenden Anbieter von Premium-Elektromobilität entwickelt.',
  mission = 'Wir bieten nachhaltige, innovative Elektromobilitätslösungen, die nicht nur die Umwelt schützen, sondern auch ein aussergewöhnliches Fahrerlebnis bieten.',
  vision = 'Bis 2030 wollen wir die erste Wahl für umweltbewusste und technologieorientierte Fahrer in der ganzen Schweiz sein.',
  values = [
    { title: 'Qualität', description: 'Premium-Produkte mit perfekter Verarbeitung' },
    { title: 'Innovation', description: 'Neueste Technologie und ständige Verbesserungen' },
    { title: 'Nachhaltigkeit', description: 'Umweltfreundliche Lösungen für die Zukunft' },
    { title: 'Kundenservice', description: 'Persönliche Betreuung und schnelle Hilfe' },
  ],
}: AboutCompanyProps) {
  return (
    <section className="py-24 md:py-32 bg-background dark:bg-background">
      <div className="max-w-7xl mx-auto px-6">
        {/* Story Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-24">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative"
          >
            <img
              src={image}
              alt="MK-eMotors"
              className="w-full h-[500px] object-cover rounded-2xl shadow-luxury-2xl"
            />
            <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-accent/10 rounded-full blur-3xl" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div>
              <p className="text-accent text-sm font-semibold uppercase tracking-widest mb-3">
                Unsere Geschichte
              </p>
              <h2 className="text-4xl md:text-5xl font-black mb-6">
                Von Leidenschaft zu Innovation
              </h2>
              <p className="text-lg text-foreground/70 leading-relaxed">{story}</p>
            </div>

            {/* Mission */}
            <div className="pt-8 border-t border-border">
              <p className="text-accent text-sm font-semibold uppercase tracking-widest mb-3">
                Mission
              </p>
              <p className="text-xl font-semibold text-foreground">{mission}</p>
            </div>

            {/* Vision */}
            <div className="pt-8 border-t border-border">
              <p className="text-accent text-sm font-semibold uppercase tracking-widest mb-3">
                Vision
              </p>
              <p className="text-xl font-semibold text-foreground">{vision}</p>
            </div>
          </motion.div>
        </div>

        {/* Values Grid */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-accent text-sm font-semibold uppercase tracking-widest mb-3">
              Unsere Werte
            </p>
            <h2 className="text-4xl md:text-5xl font-black">Was uns antreibt</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="p-8 bg-card dark:bg-card border border-border rounded-2xl shadow-luxury-md hover:shadow-luxury-lg transition-all duration-300"
              >
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mb-6">
                  <div className="w-3 h-3 bg-accent rounded-full" />
                </div>
                <h3 className="text-xl font-bold mb-3">{value.title}</h3>
                <p className="text-foreground/60">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
