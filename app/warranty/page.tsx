import { LuxuryHeader } from '@/components/navigation/LuxuryHeader'
import { Footer } from '@/components/navigation/Footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/Card'
import { Shield, CheckCircle } from 'lucide-react'

export const metadata = {
  title: 'Warranty | MK-eMotors Dornach',
  description: 'Learn about MK-eMotors Dornach product warranty and coverage.',
}

export default function WarrantyPage() {
  return (
    <main className="w-full">
      <LuxuryHeader />

      <div className="bg-primary text-primary-foreground pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="prose-heading text-5xl md:text-6xl mb-4">Warranty</h1>
          <p className="prose-body text-primary-foreground/80 max-w-2xl">
            We stand behind our products with comprehensive warranty coverage.
          </p>
        </div>
      </div>

      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Warranty Overview */}
          <div className="mb-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="prose-heading text-3xl md:text-4xl mb-6">MK Warranty Promise</h2>
                <p className="prose-body text-muted-foreground mb-6">
                  Every MK-eMotors Dornach vehicle is backed by our comprehensive 2-year manufacturer warranty. We take pride in our engineering and stand behind every product we make.
                </p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-accent flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Manufacturing Defects</p>
                      <p className="text-sm text-muted-foreground">Full coverage for defects in materials and workmanship</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-accent flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Free Repairs</p>
                      <p className="text-sm text-muted-foreground">Warranty repairs performed free of charge</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-accent flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">No Hidden Fees</p>
                      <p className="text-sm text-muted-foreground">Transparent coverage with no surprises</p>
                    </div>
                  </div>
                </div>
              </div>

              <Card className="glass-effect">
                <CardContent className="pt-8 text-center space-y-6">
                  <div>
                    <Shield className="w-16 h-16 text-accent mx-auto mb-4" />
                    <h3 className="prose-heading text-2xl mb-2">2-Year</h3>
                    <p className="text-muted-foreground">Comprehensive Warranty</p>
                  </div>
                  <div className="border-t border-border pt-6">
                    <p className="text-sm text-muted-foreground">
                      Covers all manufacturing defects from the date of purchase
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* What&apos;s Covered */}
          <div className="mb-16">
            <h2 className="prose-heading text-3xl md:text-4xl mb-8">What&apos;s Covered</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Covered Components</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <span className="text-accent">✓</span> Frame and chassis
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-accent">✓</span> Motor and drive system
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-accent">✓</span> Battery (first 1 year)
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-accent">✓</span> Electronics and controls
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-accent">✓</span> Brakes and suspension
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-accent">✓</span> Lights and signals
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Not Covered</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <span>✗</span> Damage from accidents or misuse
                    </li>
                    <li className="flex items-center gap-2">
                      <span>✗</span> Normal wear and tear
                    </li>
                    <li className="flex items-center gap-2">
                      <span>✗</span> Unauthorized repairs or modifications
                    </li>
                    <li className="flex items-center gap-2">
                      <span>✗</span> Cosmetic damage
                    </li>
                    <li className="flex items-center gap-2">
                      <span>✗</span> Water damage (unless sealed models)
                    </li>
                    <li className="flex items-center gap-2">
                      <span>✗</span> Battery degradation from normal use
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Warranty Claim */}
          <div>
            <h2 className="prose-heading text-3xl md:text-4xl mb-8">How to Claim</h2>
            <Card>
              <CardContent className="pt-8">
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center flex-shrink-0 font-bold">
                      1
                    </div>
                    <div>
                      <h3 className="font-bold mb-2">Contact Support</h3>
                      <p className="text-muted-foreground text-sm">
                        Email support@mk-emotors.ch with your purchase proof and issue description
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center flex-shrink-0 font-bold">
                      2
                    </div>
                    <div>
                      <h3 className="font-bold mb-2">Assessment</h3>
                      <p className="text-muted-foreground text-sm">
                        Our technical team will review your case and determine coverage eligibility
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center flex-shrink-0 font-bold">
                      3
                    </div>
                    <div>
                      <h3 className="font-bold mb-2">Service Authorization</h3>
                      <p className="text-muted-foreground text-sm">
                        If approved, you&apos;ll receive a RMA number and shipping instructions
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center flex-shrink-0 font-bold">
                      4
                    </div>
                    <div>
                      <h3 className="font-bold mb-2">Repair or Replacement</h3>
                      <p className="text-muted-foreground text-sm">
                        Your vehicle will be repaired or replaced and shipped back to you
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 p-4 bg-accent/10 rounded-lg border border-accent/20">
                  <p className="text-sm">
                    <span className="font-bold">Note:</span> Warranty claims should be submitted within 30 days of discovering a defect. Keep your proof of purchase and warranty documentation for faster processing.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
