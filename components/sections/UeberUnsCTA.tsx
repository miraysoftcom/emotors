'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

interface CTAButton {
  text: string
  link: string
  style?: 'primary' | 'secondary'
}

interface UeberUnsCtaProps {
  headline?: string
  description?: string
  buttons?: CTAButton[]
  backgroundImage?: string
}

export function UeberUnsCTA({
  headline = 'Bereit für die Zukunft der Mobilität?',
  description = 'Lassen Sie sich von unseren Experten beraten und finden Sie die perfekte Lösung für Ihre Bedürfnisse.',
  buttons = [
    { text: 'Jetzt Kaufen', link: '/produkte', style: 'primary' as const },
    { text: 'Probefahrt vereinbaren', link: '/contact', style: 'secondary' as const },
  ],
  backgroundImage = 'https://images.unsplash.com/photo-1609408143e18f718b6416bd995c96b02e347f66?w=1920&h=600&fit=crop',
}: UeberUnsCtaProps) {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* Background Image with Overlay */}
      {backgroundImage && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${backgroundImage})`,
          }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/80 dark:from-black/90 dark:via-black/70 dark:to-black/90" />

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-6xl font-black text-white mb-6">{headline}</h2>
          <p className="text-xl text-gray-200 mb-12">{description}</p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            {buttons.map((button, index) => (
              <motion.div
                key={button.text}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <Link
                  href={button.link}
                  className={`inline-block px-8 py-4 font-bold rounded-lg transition-all duration-300 ${
                    button.style === 'primary'
                      ? 'bg-accent text-accent-foreground hover:bg-accent/90 hover:scale-105 hover:shadow-lg'
                      : 'border-2 border-white text-white hover:bg-white/10 hover:scale-105'
                  }`}
                >
                  {button.text}
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Decorative Elements */}
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity }}
        className="absolute top-10 right-10 w-40 h-40 bg-accent/5 rounded-full blur-3xl"
      />
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 5, repeat: Infinity }}
        className="absolute bottom-10 left-10 w-40 h-40 bg-accent/5 rounded-full blur-3xl"
      />
    </section>
  )
}
