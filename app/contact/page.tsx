'use client'

import { LuxuryHeader } from '@/components/navigation/LuxuryHeader'
import { Footer } from '@/components/navigation/Footer'
import { PremiumContactForm } from '@/components/sections/PremiumContactForm'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function ContactPage() {
  const contactInfo = [
    {
      icon: '📍',
      label: 'Adresse',
      value: 'MK-eMotors Dornach',
      details: 'Rümelinstrasse 123, 4143 Dornach, SO',
      link: 'https://maps.google.com/?q=mk+emotors+dornach',
    },
    {
      icon: '📞',
      label: 'Telefon',
      value: '+41 61 701 50 50',
      details: 'Mo-Fr 09:00-17:00, Sa 10:00-14:00',
      link: 'tel:+41617015050',
    },
    {
      icon: '✉️',
      label: 'E-Mail',
      value: 'info@mk-emotorsdornach.ch',
      details: 'Schnelle Antwortzeiten garantiert',
      link: 'mailto:info@mk-emotorsdornach.ch',
    },
    {
      icon: '💬',
      label: 'WhatsApp',
      value: '+41 61 701 50 50',
      details: 'Direkter Chat mit unserem Team',
      link: 'https://wa.me/41617015050',
    },
  ]

  const socialLinks = [
    { icon: '💬', label: 'WhatsApp', link: 'https://wa.me/41617015050' },
    { icon: '📍', label: 'Google Maps', link: 'https://maps.google.com/?q=mk+emotors' },
    { icon: '📘', label: 'Instagram', link: 'https://instagram.com' },
  ]

  return (
    <main className="w-full bg-background">
      <LuxuryHeader />

      {/* Hero Section */}
      <section className="relative pt-32 pb-12 px-4 md:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter mb-6">
              Kontakt
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Wir freuen uns auf Ihre Anfrage. Kontaktieren Sie uns direkt per Telefon,
              E-Mail oder über das Kontaktformular.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left Side - Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-4xl font-black mb-4">
                  Wir freuen uns auf Ihre Anfrage
                </h2>
                <p className="text-lg text-muted-foreground">
                  Unser Team steht Ihnen gerne zur Verfügung. Schreiben Sie uns eine
                  Nachricht oder rufen Sie uns an.
                </p>
              </div>

              {/* Contact Cards */}
              <div className="space-y-4">
                {contactInfo.map((info, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="group"
                  >
                    {info.link ? (
                      <a
                        href={info.link}
                        target={info.link.startsWith('http') ? '_blank' : '_self'}
                        rel={info.link.startsWith('http') ? 'noopener noreferrer' : ''}
                      >
                        <motion.div
                          whileHover={{ scale: 1.02, x: 8 }}
                          className="p-6 bg-card/50 border border-border rounded-2xl cursor-pointer transition-all hover:bg-card hover:shadow-lg hover:border-accent/30"
                        >
                          <div className="flex items-start gap-4">
                            <motion.span
                              whileHover={{ scale: 1.1, rotate: 5 }}
                              className="text-4xl"
                            >
                              {info.icon}
                            </motion.span>
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg mb-1">
                                {info.label}
                              </h3>
                              <p className="text-foreground font-medium mb-1">
                                {info.value}
                              </p>
                              {'details' in info && info.details && (
                                <p className="text-muted-foreground text-sm">
                                  {info.details}
                                </p>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      </a>
                    ) : (
                      <motion.div
                        whileHover={{ scale: 1.02, x: 8 }}
                        className="p-6 bg-card/50 border border-border rounded-2xl transition-all hover:bg-card hover:shadow-lg hover:border-accent/30"
                      >
                        <div className="flex items-start gap-4">
                          <span className="text-4xl">{info.icon}</span>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-1">
                              {info.label}
                            </h3>
                            <p className="text-foreground font-medium mb-1">
                              {info.value}
                            </p>
                            {'details' in info && info.details && (
                              <p className="text-muted-foreground text-sm">
                                {info.details}
                              </p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Social Links */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Verbinden Sie sich mit uns</h3>
                <div className="flex gap-4">
                  {socialLinks.map((social, index) => (
                    <motion.a
                      key={index}
                      href={social.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      whileHover={{ scale: 1.15, rotate: 8 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-14 h-14 bg-gradient-to-br from-accent/20 to-accent/10 border border-accent/20 rounded-full flex items-center justify-center text-2xl hover:bg-accent hover:text-accent-foreground hover:border-accent transition-all shadow-sm hover:shadow-md"
                      title={social.label}
                    >
                      {social.icon}
                    </motion.a>
                  ))}
                </div>
              </div>

              {/* Google Map */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="w-full h-96 rounded-2xl overflow-hidden border border-border shadow-lg"
              >
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2688.2841827449903!2d7.588600000000001!3d47.51960000000001!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4791b5c5c5c5c5c5%3A0x0!2sMK%20E-Motors%20Dornach!5e0!3m2!1sde!2sch!4v1234567890"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </motion.div>
            </motion.div>

            {/* Right Side - Contact Form */}
            <PremiumContactForm recaptchaSiteKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ''} />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 md:px-8 bg-secondary">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-black mb-6">
              Noch Fragen?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Besuchen Sie unsere FAQ oder entdecken Sie unsere Produkte.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/faq"
                className="px-8 py-4 bg-accent text-accent-foreground font-semibold rounded-xl hover:shadow-lg transition-all hover:scale-105 inline-block"
              >
                FAQ ansehen
              </Link>
              <Link
                href="/produkte"
                className="px-8 py-4 border-2 border-primary text-primary font-semibold rounded-xl hover:bg-primary/5 transition-all inline-block"
              >
                Zu den Produkten
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
