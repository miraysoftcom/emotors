import { LuxuryHeader } from '@/components/navigation/LuxuryHeader'
import { Footer } from '@/components/navigation/Footer'

export const metadata = {
  title: 'Privacy Policy | MK-eMotors Dornach',
  description: 'Privacy policy for MK-eMotors Dornach.',
}

export default function PrivacyPage() {
  return (
    <main className="w-full">
      <LuxuryHeader />

      <div className="pt-28 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="prose-heading text-4xl md:text-5xl mb-2">Privacy Policy</h1>
          <p className="text-muted-foreground mb-8">Last updated: January 2024</p>

          <article className="prose-body space-y-6 text-muted-foreground">
            <section>
              <h2 className="prose-heading text-2xl mb-4 text-foreground">1. Introduction</h2>
              <p>
                MK-eMotors Dornach (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) operates the mk-emotors.ch website. This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our service.
              </p>
            </section>

            <section>
              <h2 className="prose-heading text-2xl mb-4 text-foreground">2. Data Collection</h2>
              <p>
                We collect various types of information in connection with the services we provide, including:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Contact information (name, email, phone)</li>
                <li>Billing and shipping addresses</li>
                <li>Payment information</li>
                <li>Usage data and analytics</li>
              </ul>
            </section>

            <section>
              <h2 className="prose-heading text-2xl mb-4 text-foreground">3. Use of Data</h2>
              <p>
                We use the collected data for various purposes:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>To provide and maintain our services</li>
                <li>To process transactions</li>
                <li>To send marketing communications</li>
                <li>To improve customer experience</li>
                <li>To comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="prose-heading text-2xl mb-4 text-foreground">4. Data Protection</h2>
              <p>
                The security of your personal data is important to us but remember that no method of transmission over the Internet is 100% secure. We use industry-standard security measures to protect your information.
              </p>
            </section>

            <section>
              <h2 className="prose-heading text-2xl mb-4 text-foreground">5. Your Rights</h2>
              <p>
                You have the right to access, correct, or delete your personal data. To exercise any of these rights, please contact us using the information provided below.
              </p>
            </section>

            <section>
              <h2 className="prose-heading text-2xl mb-4 text-foreground">6. Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us at:
              </p>
              <p className="text-foreground font-medium mt-4">
                Email: privacy@mk-emotors.ch
              </p>
            </section>
          </article>
        </div>
      </div>

      <Footer />
    </main>
  )
}
