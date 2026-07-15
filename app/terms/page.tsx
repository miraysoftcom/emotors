import { LuxuryHeader } from '@/components/navigation/LuxuryHeader'
import { Footer } from '@/components/navigation/Footer'

export const metadata = {
  title: 'Terms of Service | MK-eMotors Dornach',
  description: 'Terms of service for MK-eMotors Dornach.',
}

export default function TermsPage() {
  return (
    <main className="w-full">
      <LuxuryHeader />

      <div className="pt-28 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="prose-heading text-4xl md:text-5xl mb-2">Terms of Service</h1>
          <p className="text-muted-foreground mb-8">Last updated: January 2024</p>

          <article className="prose-body space-y-6 text-muted-foreground">
            <section>
              <h2 className="prose-heading text-2xl mb-4 text-foreground">1. Agreement</h2>
              <p>
                By accessing and using this website and making purchases, you accept and agree to be bound by the terms and provision of this agreement.
              </p>
            </section>

            <section>
              <h2 className="prose-heading text-2xl mb-4 text-foreground">2. Use License</h2>
              <p>
                Permission is granted to temporarily download one copy of the materials (information or software) on MK-eMotors Dornach&apos;s website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.
              </p>
            </section>

            <section>
              <h2 className="prose-heading text-2xl mb-4 text-foreground">3. Product Information</h2>
              <p>
                We strive to provide accurate product descriptions and pricing. However, we do not warrant that product descriptions, pricing, or other content is accurate, complete, or error-free.
              </p>
            </section>

            <section>
              <h2 className="prose-heading text-2xl mb-4 text-foreground">4. Limitation of Liability</h2>
              <p>
                In no event shall MK-eMotors Dornach or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on MK-eMotors Dornach&apos;s website.
              </p>
            </section>

            <section>
              <h2 className="prose-heading text-2xl mb-4 text-foreground">5. Accuracy of Materials</h2>
              <p>
                The materials appearing on MK-eMotors Dornach&apos;s website could include technical, typographical, or photographic errors. MK-eMotors Dornach does not warrant that any of the materials on its website are accurate, complete, or current.
              </p>
            </section>

            <section>
              <h2 className="prose-heading text-2xl mb-4 text-foreground">6. Modifications</h2>
              <p>
                MK-eMotors Dornach may revise these terms of service for its website at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms of service.
              </p>
            </section>

            <section>
              <h2 className="prose-heading text-2xl mb-4 text-foreground">7. Governing Law</h2>
              <p>
                These terms and conditions are governed by and construed in accordance with the laws of Switzerland, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
              </p>
            </section>

            <section>
              <h2 className="prose-heading text-2xl mb-4 text-foreground">8. Contact</h2>
              <p>
                If you have any questions about these Terms, please contact us at:
              </p>
              <p className="text-foreground font-medium mt-4">
                Email: legal@mk-emotors.ch
              </p>
            </section>
          </article>
        </div>
      </div>

      <Footer />
    </main>
  )
}
