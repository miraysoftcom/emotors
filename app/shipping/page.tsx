import { LuxuryHeader } from '@/components/navigation/LuxuryHeader'
import { Footer } from '@/components/navigation/Footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/Card'
import { Truck, Package, Globe } from 'lucide-react'

export const metadata = {
  title: 'Shipping Information | MK-eMotors Dornach',
  description: 'Learn about shipping options, delivery times, and policies for MK-eMotors Dornach.',
}

export default function ShippingPage() {
  return (
    <main className="w-full">
      <LuxuryHeader />

      <div className="bg-primary text-primary-foreground pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="prose-heading text-5xl md:text-6xl mb-4">Shipping Information</h1>
          <p className="prose-body text-primary-foreground/80 max-w-2xl">
            Fast, reliable delivery to your doorstep.
          </p>
        </div>
      </div>

      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Shipping Options */}
          <div className="mb-16">
            <h2 className="prose-heading text-3xl md:text-4xl mb-8">Shipping Options</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                    <Truck className="w-6 h-6 text-accent" />
                  </div>
                  <CardTitle>Standard Shipping</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Delivery Time</p>
                    <p className="font-bold">3-5 Business Days</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Cost</p>
                    <p className="font-bold">Free on orders over CHF 100</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                    <Package className="w-6 h-6 text-accent" />
                  </div>
                  <CardTitle>Express Shipping</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Delivery Time</p>
                    <p className="font-bold">1-2 Business Days</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Cost</p>
                    <p className="font-bold">CHF 25</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                    <Globe className="w-6 h-6 text-accent" />
                  </div>
                  <CardTitle>International</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Delivery Time</p>
                    <p className="font-bold">5-10 Business Days</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Cost</p>
                    <p className="font-bold">Variable by region</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Packaging */}
          <div className="mb-16">
            <h2 className="prose-heading text-3xl md:text-4xl mb-8">Packaging & Safety</h2>
            <Card>
              <CardContent className="pt-8 space-y-4">
                <p>
                  All MK-eMotors Dornach vehicles are carefully packaged in eco-friendly, recyclable materials. Each vehicle is:
                </p>
                <ul className="space-y-2 list-disc list-inside">
                  <li>Professionally assembled and tested before shipment</li>
                  <li>Wrapped in protective padding and secured with straps</li>
                  <li>Shipped in a sturdy, weather-resistant box</li>
                  <li>Tracked via our logistics partner</li>
                  <li>Insured against damage during transit</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Returns & Exchanges */}
          <div>
            <h2 className="prose-heading text-3xl md:text-4xl mb-8">Returns & Exchanges</h2>
            <Card>
              <CardContent className="pt-8 space-y-4">
                <p>
                  We want you to be completely satisfied with your purchase. If you need to return or exchange your vehicle:
                </p>
                <ul className="space-y-2 list-disc list-inside">
                  <li>You have 30 days from delivery to request a return</li>
                  <li>Vehicle must be in original condition, unopened if possible</li>
                  <li>Free return shipping for defective items</li>
                  <li>Full refund within 14 days of receiving your return</li>
                  <li>Exchanges are processed within 5-7 business days</li>
                </ul>
                <p className="text-sm text-muted-foreground mt-4">
                  For return authorizations or questions, contact our customer service team at support@mk-emotors.ch
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
