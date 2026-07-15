import { Card, CardContent } from '@/components/common/Card'
import { Zap, Leaf, Shield, Smartphone } from 'lucide-react'

const features = [
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Up to 60 km/h with responsive acceleration and intelligent power management.',
  },
  {
    icon: Leaf,
    title: 'Eco-Friendly',
    description: 'Zero-emission operation contributes to a cleaner urban environment.',
  },
  {
    icon: Shield,
    title: 'Swiss Safety',
    description: 'Engineered to meet the highest international safety standards.',
  },
  {
    icon: Smartphone,
    title: 'Smart Control',
    description: 'Connected app for diagnostics, maintenance alerts, and ride tracking.',
  },
]

export function Features() {
  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <span className="text-accent font-medium text-sm">Why Choose MK</span>
          <h2 className="prose-heading text-4xl md:text-5xl mb-4 text-balance">
            Premium Engineering
          </h2>
          <p className="prose-body text-muted-foreground">
            Every MK vehicle is crafted with precision and innovation, combining Swiss engineering excellence with modern mobility solutions.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <Card key={feature.title} className="group hover:shadow-luxury-lg transition-all">
                <CardContent className="pt-8 flex flex-col items-center text-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                    <Icon className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm">{feature.description}</p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
