'use client'

import { motion } from 'framer-motion'
import { Zap, Award, Heart, Headphones, DollarSign, Leaf } from 'lucide-react'

interface Feature {
  icon: React.ReactNode
  title: string
  description: string
}

interface WhyChooseUsProps {
  features?: Feature[]
}

const defaultIcons = {
  Zap,
  Award,
  Heart,
  Headphones,
  DollarSign,
  Leaf,
}

export function WhyChooseUs({
  features = [
    {
      icon: <Award className="w-12 h-12" />,
      title: 'Schweizer Qualität',
      description: 'Premium-Produkte mit höchsten Qualitätsstandards',
    },
    {
      icon: <Zap className="w-12 h-12" />,
      title: 'Innovative Technologie',
      description: 'Die neueste Elektromobilitätstechnologie',
    },
    {
      icon: <Headphones className="w-12 h-12" />,
      title: 'Premium Service',
      description: '24/7 Kundensupport und persönliche Betreuung',
    },
    {
      icon: <Heart className="w-12 h-12" />,
      title: 'Warranty & Garantie',
      description: 'Umfassender Schutz und Versicherungsoptionen',
    },
    {
      icon: <DollarSign className="w-12 h-12" />,
      title: 'Flexible Finanzierung',
      description: 'Massgeschneiderte Finanzierungslösungen',
    },
    {
      icon: <Leaf className="w-12 h-12" />,
      title: 'Nachhaltigkeit',
      description: 'Umweltfreundliche Lösungen für die Zukunft',
    },
  ],
}: WhyChooseUsProps) {
  return (
    <section className="py-24 md:py-32 bg-card dark:bg-card/50">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <p className="text-accent text-sm font-semibold uppercase tracking-widest mb-3">
            Vorteile
          </p>
          <h2 className="text-4xl md:text-5xl font-black mb-6">Warum MK-eMotors wählen?</h2>
          <p className="text-xl text-foreground/60 max-w-2xl mx-auto">
            Wir bieten eine kombinierte Lösung aus Premium-Qualität, innovativer Technologie und exzellentem Kundenservice
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group relative bg-background dark:bg-background border border-border rounded-2xl p-8 hover:border-accent transition-all duration-300 overflow-hidden"
            >
              {/* Background gradient on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />

              <div className="relative z-10">
                {/* Icon */}
                <motion.div
                  initial={{ scale: 1 }}
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                  className="w-16 h-16 bg-accent/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-accent/20 transition-all duration-300"
                >
                  <div className="text-accent">{feature.icon}</div>
                </motion.div>

                {/* Title */}
                <h3 className="text-2xl font-bold mb-3 group-hover:text-accent transition-colors duration-300">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-foreground/60 leading-relaxed">{feature.description}</p>

                {/* Bottom accent line */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-accent via-accent to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
