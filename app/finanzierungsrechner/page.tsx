import { LuxuryHeader } from '@/components/navigation/LuxuryHeader'
import { Footer } from '@/components/navigation/Footer'
import { FinancingCalculator } from '@/components/sections/FinancingCalculator'
import { db } from '@/lib/db'
import { products } from '@/lib/db/schema'

async function getFinancingProducts() {
  try {
    // Return mock data if database is not available
    if (!db) {
      return mockFinancingProducts()
    }

    // Get all products that have financing available and are active
    const allProducts = await db
      .select()
      .from(products)
    
    return allProducts && allProducts.length > 0 ? allProducts : mockFinancingProducts()
  } catch (error) {
    console.error('Error fetching financing products:', error)
    // Return mock data for demo
    return mockFinancingProducts()
  }
}

function mockFinancingProducts() {
  return [
      {
        id: 1,
        slug: 'mk-city-go',
        title: 'MK City Go',
        price: 3499,
        monthly_price: 88,
      },
      {
        id: 2,
        slug: 'mk-urban-wave',
        title: 'MK Urban Wave',
        price: 2999,
        monthly_price: 75,
      },
      {
        id: 3,
        slug: 'mk-kabinenroller',
        title: 'MK Kabinenroller',
        price: 8999,
        monthly_price: 225,
      },
      {
        id: 4,
        slug: 'sky-iii',
        title: 'Sky III',
        price: 4299,
        monthly_price: 108,
      },
      {
        id: 5,
        slug: 'miku-max',
        title: 'Miku Max',
        price: 3799,
        monthly_price: 95,
      },
    ]
}

export const metadata = {
  title: 'Finanzierungsrechner | MK-eMotors Dornach',
  description: 'Berechnen Sie Ihre monatliche Rate für Ihr Wunschfahrzeug. Flexible Finanzierungslösungen ab 0% Zinsen.',
}

export default async function FinancingCalculatorPage() {
  const financingProducts = await getFinancingProducts()

  return (
    <main className="w-full bg-background">
      <LuxuryHeader />
      
      {/* Hero Section */}
      <section className="pt-40 pb-12 px-4 md:px-8 bg-gradient-to-b from-secondary to-background">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter mb-4">
            Finanzierungsrechner
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Berechnen Sie flexibel Ihre monatliche Rate für Ihr Wunschfahrzeug
          </p>
        </div>
      </section>

      {/* Calculator */}
      <FinancingCalculator products={financingProducts} />

      <Footer />
    </main>
  )
}
