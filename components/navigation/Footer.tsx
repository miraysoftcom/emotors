'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Mail, Phone, MapPin } from 'lucide-react'
import { LiveSalesCarousel } from '@/components/sections/LiveSalesCarousel'
import { BrandLogo } from '@/components/navigation/BrandLogo'

type FooterSettings = {
  brandTitle: string
  brandDescription: string
  logoText: string
  showLiveSales: boolean
  liveSalesTitle: string
  contactEmail: string
  contactPhone: string
  contactLocation: string
  copyrightText: string
  columns: Array<{ title: string; links: Array<{ label: string; href: string }> }>
  socialLinks: Array<{ label: string; href: string }>
}

const fallbackFooter: FooterSettings = {
  brandTitle: 'MK-eMotors Dornach',
  brandDescription: 'Premium Swiss-engineered electric mobility solutions.',
  logoText: 'MK',
  showLiveSales: true,
  liveSalesTitle: 'Gerade verkauft',
  contactEmail: 'info@mk-emotors.ch',
  contactPhone: '+41 (0) 800 000 0000',
  contactLocation: 'Zurich, Switzerland',
  copyrightText: 'MK-eMotors Dornach. All rights reserved.',
  columns: [
    {
      title: 'Shop',
      links: [
        { label: 'Alle Produkte', href: '/produkte' },
        { label: 'Ohne Führerschein', href: '/produkte?license=ohne' },
        { label: 'Mit Führerschein', href: '/produkte?license=mit' },
        { label: 'eScooter', href: '/produkte?category=escooter' },
      ],
    },
    {
      title: 'Unternehmen',
      links: [
        { label: 'Über uns', href: '/ueber-uns' },
        { label: 'FAQ', href: '/faq' },
        { label: 'Kontakt', href: '/contact' },
        { label: 'Finanzierung', href: '/finanzierungsrechner' },
      ],
    },
    {
      title: 'Rechtliches',
      links: [
        { label: 'AGB', href: '/agb' },
        { label: 'Datenschutz', href: '/datenschutz' },
        { label: 'Impressum', href: '/impressum' },
        { label: 'Ratenzahlung', href: '/ratenzahlung' },
      ],
    },
  ],
  socialLinks: [
    { label: 'Instagram', href: '#' },
    { label: 'LinkedIn', href: '#' },
    { label: 'Twitter', href: '#' },
  ],
}

export function Footer() {
  const currentYear = new Date().getFullYear()
  const [footer, setFooter] = useState<FooterSettings>(fallbackFooter)
  const contactPhoneHref = footer.contactPhone.replace(/[^\d+]/g, '')

  useEffect(() => {
    fetch('/api/shop/settings')
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (data?.footer) setFooter({ ...fallbackFooter, ...data.footer })
      })
      .catch(() => setFooter(fallbackFooter))
  }, [])

  return (
    <footer className="border-t border-border bg-card text-card-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="flex flex-col gap-4">
            <BrandLogo scrolled slogan context="footer" />
            <p className="text-sm text-muted-foreground">
              {footer.brandDescription}
            </p>
          </div>

          {footer.columns.map((column) => (
            <div key={column.title}>
              <h3 className="font-bold mb-4">{column.title}</h3>
              <ul className="space-y-2 text-sm">
                {column.links.map((link) => (
                  <li key={`${column.title}-${link.href}-${link.label}`}>
                    <Link href={link.href} className="hover:text-accent transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Gerade Verkauft Section */}
        {footer.showLiveSales && (
          <div className="py-12 border-t border-border mb-8">
            <h3 className="font-bold text-lg mb-6">{footer.liveSalesTitle}</h3>
            <LiveSalesCarousel />
          </div>
        )}

        {/* Contact Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-8 border-t border-border mb-8">
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-accent" />
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <a href={`mailto:${footer.contactEmail}`} className="hover:text-accent transition-colors">
                {footer.contactEmail}
              </a>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="w-5 h-5 text-accent" />
            <div>
              <p className="text-xs text-muted-foreground">Phone</p>
              <a href={`tel:${contactPhoneHref}`} className="hover:text-accent transition-colors">
                {footer.contactPhone}
              </a>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-accent" />
            <div>
              <p className="text-xs text-muted-foreground">Location</p>
              <p>{footer.contactLocation}</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>&copy; {currentYear} {footer.copyrightText}</p>
          <div className="flex gap-6">
            {footer.socialLinks.map((link) => (
              <a key={`${link.label}-${link.href}`} href={link.href} className="hover:text-accent transition-colors">
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
