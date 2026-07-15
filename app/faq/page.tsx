import type { Metadata } from 'next'
import { Footer } from '@/components/navigation/Footer'
import { LuxuryHeader } from '@/components/navigation/LuxuryHeader'
import { FAQClient } from '@/components/faq/FAQClient'
import { getFAQCategories, listFAQs } from '@/lib/faq-store'

export const revalidate = 300

const pageTitle = 'FAQ zu E-Scootern, E-Bikes und E-Motorrädern'
const pageDescription = 'Professionelle Antworten zu Elektromobilität, E-Scootern, E-Bikes, E-Motorrädern, Akkus, Lieferung, Zahlung, Garantie, Wartung und Straßenzulassung.'

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  alternates: {
    canonical: '/faq',
    languages: {
      de: '/faq',
      'de-CH': '/faq',
      'x-default': '/faq',
    },
  },
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    type: 'website',
    locale: 'de_DE',
    url: '/faq',
  },
  twitter: {
    card: 'summary_large_image',
    title: pageTitle,
    description: pageDescription,
  },
}

export default function FAQPage() {
  const categories = getFAQCategories().filter((category) => category.active)
  const { faqs } = listFAQs({ status: 'active', limit: 500 })

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Startseite',
        item: '/',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'FAQ',
        item: '/faq',
      },
    ],
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <LuxuryHeader />
      <main className="flex-1">
        <FAQClient initialFaqs={faqs} categories={categories} />
      </main>
      <Footer />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </div>
  )
}
