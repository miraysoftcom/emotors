'use client'

import { UeberUnsHero } from './UeberUnsHero'
import { AboutCompany } from './AboutCompany'
import { UeberUnsTimeline } from './UeberUnsTimeline'
import { WhyChooseUs } from './WhyChooseUs'
import { UeberUnsStatistics } from './UeberUnsStatistics'
import { UeberUnsCTA } from './UeberUnsCTA'

export function UeberUnsPremiumSections() {
  return (
    <>
      {/* Hero Section */}
      <UeberUnsHero
        headline="Über MK-eMotors Dornach"
        subtitle="Premium Elektromobilität aus der Schweiz"
        description="Entdecken Sie unsere Leidenschaft für nachhaltige, innovative und zukunftsweisende Mobilität"
        backgroundImage="https://images.unsplash.com/photo-1602073644580-a2f1e80c9f17?w=1920&h=1080&fit=crop"
        ctaText="Unsere Produkte erkunden"
        ctaLink="/produkte"
      />

      {/* About Company Section */}
      <AboutCompany
        image="https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=800&fit=crop"
        story="MK-eMotors wurde 2009 gegründet mit einer klaren Vision: Die Mobilität in der Schweiz zu revolutionieren. Mit jahrelanger Erfahrung und tiefem Verständnis für die Bedürfnisse unserer Kunden haben wir uns zum führenden Anbieter von Premium-Elektromobilität entwickelt. Wir glauben, dass Innovation und Nachhaltigkeit Hand in Hand gehen."
        mission="Wir bieten nachhaltige, innovative Elektromobilitätslösungen, die nicht nur die Umwelt schützen, sondern auch ein aussergewöhnliches Fahrerlebnis bieten."
        vision="Bis 2030 wollen wir die erste Wahl für umweltbewusste und technologieorientierte Fahrer in der ganzen Schweiz und darüber hinaus sein."
        values={[
          { title: 'Schweizer Qualität', description: 'Premium-Produkte mit perfekter Verarbeitung und Langlebigkeit' },
          { title: 'Innovation', description: 'Neueste Technologie und ständige Verbesserungen' },
          { title: 'Nachhaltigkeit', description: 'Umweltfreundliche Lösungen für eine bessere Zukunft' },
          { title: 'Kundenservice', description: 'Persönliche Betreuung und schnelle, freundliche Hilfe' },
        ]}
      />

      {/* Timeline Section */}
      <UeberUnsTimeline />

      {/* Why Choose Us */}
      <WhyChooseUs />

      {/* Statistics */}
      <UeberUnsStatistics
        title="Durch die Zahlen"
        subtitle="Unsere Erfolgsgeschichte"
        statistics={[
          { label: 'Zufriedene Kunden', value: 2500, suffix: '+' },
          { label: 'Jahre Erfahrung', value: 15, suffix: '+' },
          { label: 'Produkte im Katalog', value: 150, suffix: '+' },
          { label: 'Länder beliefert', value: 5, suffix: '' },
        ]}
      />

      {/* CTA Section */}
      <UeberUnsCTA
        headline="Bereit für die Zukunft der Mobilität?"
        description="Lassen Sie sich von unseren Experten beraten und finden Sie die perfekte Lösung für Ihre Bedürfnisse."
        buttons={[
          { text: 'Jetzt Kaufen', link: '/produkte', style: 'primary' },
          { text: 'Probefahrt vereinbaren', link: '/contact', style: 'secondary' },
        ]}
      />
    </>
  )
}
