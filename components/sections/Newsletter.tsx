'use client'

import { useState } from 'react'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { Mail } from 'lucide-react'

export function Newsletter() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800))

    setSubmitted(true)
    setEmail('')
    setIsLoading(false)

    // Reset after 3 seconds
    setTimeout(() => setSubmitted(false), 3000)
  }

  return (
    <section className="py-20 bg-gradient-to-b from-secondary/20 to-background">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="glass-effect-strong overflow-hidden border-accent/30">
          <div className="p-8 md:p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4">
              <Mail className="w-6 h-6 text-accent" />
            </div>

            <h2 className="prose-heading text-3xl md:text-4xl mb-3 text-balance">
              Stay Updated
            </h2>
            <p className="prose-body text-muted-foreground mb-8">
              Get exclusive access to new product launches, special offers, and industry insights delivered to your inbox.
            </p>

            {submitted ? (
              <div className="bg-accent/20 border border-accent/50 rounded-lg p-4 text-accent font-medium animate-slide-up">
                ✓ Thanks for subscribing! Check your email for confirmation.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1 px-4 py-3 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                />
                <Button
                  type="submit"
                  variant="accent"
                  isLoading={isLoading}
                  disabled={isLoading || !email}
                >
                  Subscribe
                </Button>
              </form>
            )}

            <p className="text-xs text-muted-foreground mt-4">
              We respect your privacy. Unsubscribe anytime.
            </p>
          </div>
        </Card>
      </div>
    </section>
  )
}
