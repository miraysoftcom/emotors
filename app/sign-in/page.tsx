'use client'

import { signIn, signUp } from '@/lib/auth-client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/common/Button'
import { BrandLogo } from '@/components/navigation/BrandLogo'
import { Eye, EyeOff } from 'lucide-react'
import { useAuthStatus } from '@/lib/use-auth-status'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false)
  const router = useRouter()
  const { isAuthenticated, sessionLoading } = useAuthStatus()

  useEffect(() => {
    if (!sessionLoading && isAuthenticated) {
      router.replace('/account')
      router.refresh()
    }
  }, [isAuthenticated, sessionLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (isSignUp) {
        if (password !== confirmPassword) {
          setError('Die Passwörter stimmen nicht überein.')
          setLoading(false)
          return
        }
        if (password.length < 8) {
          setError('Das Passwort muss mindestens 8 Zeichen lang sein.')
          setLoading(false)
          return
        }
        if (!acceptedTerms || !acceptedPrivacy) {
          setError('Bitte akzeptieren Sie AGB und Datenschutz.')
          setLoading(false)
          return
        }
        const availability = await fetch('/api/auth/register-check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, phone }),
        })
        const availabilityData = await availability.json()
        if (!availability.ok) {
          setError(availabilityData.error || 'Diese Daten sind bereits in unserem System registriert.')
          setLoading(false)
          return
        }
        const result = await signUp.email({
          email,
          password,
          name: `${firstName} ${lastName}`.trim() || email.split('@')[0],
        })

        if (result.error) {
          const message = result.error.message || ''
          setError(
            /already|exist|registered|duplicate|unique/i.test(message)
              ? 'Diese E-Mail-Adresse ist bereits in unserem System registriert.'
              : message || 'Registrierung fehlgeschlagen'
          )
        } else {
          if (phone) {
            await fetch(`/api/account?email=${encodeURIComponent(email)}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({ firstName, lastName, phone }),
            }).catch(() => null)
          }
          router.push('/account')
          router.refresh()
        }
      } else {
        const result = await signIn.email({
          email,
          password,
        })

        if (result.error) {
          setError(result.error.message || 'Anmeldung fehlgeschlagen')
        } else {
          router.push('/account')
          router.refresh()
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-full max-w-lg">
        <div className="bg-card border border-border rounded p-8 space-y-6">
          <div className="space-y-4">
            <BrandLogo scrolled slogan />
            <div>
              <h1 className="text-3xl font-black text-foreground mb-2">
                {isSignUp ? 'Konto erstellen' : 'Anmelden'}
              </h1>
              <p className="text-muted-foreground">Ihr MK-eMotors Dornach Kundenkonto</p>
            </div>
          </div>

          {sessionLoading || isAuthenticated ? (
            <div className="space-y-4" aria-label={isAuthenticated ? 'Weiterleitung zum Kundenkonto' : 'Anmeldestatus wird geladen'}>
              <div className="h-12 animate-pulse rounded bg-secondary" />
              <div className="h-12 animate-pulse rounded bg-secondary" />
              <div className="h-12 animate-pulse rounded bg-secondary" />
            </div>
          ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Vorname"
                  className="w-full px-4 py-3 bg-secondary border border-border rounded text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                  required
                />
                <input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Nachname"
                  className="w-full px-4 py-3 bg-secondary border border-border rounded text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                  required
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-bold uppercase tracking-widest mb-2">E-Mail-Adresse</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="info@mk-emotorsdornach.ch"
                className="w-full px-4 py-3 bg-secondary border border-border rounded text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                required
              />
            </div>

            {isSignUp && (
              <div>
                <label className="block text-sm font-bold uppercase tracking-widest mb-2">Telefonnummer optional</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+41 79 123 45 67"
                  className="w-full px-4 py-3 bg-secondary border border-border rounded text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-bold uppercase tracking-widest mb-2">Passwort</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mindestens 8 Zeichen"
                  className="w-full px-4 py-3 pr-12 bg-secondary border border-border rounded text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {isSignUp && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Stärke: {password.length >= 12 ? 'stark' : password.length >= 8 ? 'mittel' : 'zu kurz'}
                </p>
              )}
            </div>

            {isSignUp && (
              <>
                <div>
                  <label className="block text-sm font-bold uppercase tracking-widest mb-2">Passwort bestätigen</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Passwort wiederholen"
                    className="w-full px-4 py-3 bg-secondary border border-border rounded text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                    required
                  />
                </div>
                <label className="flex gap-3 text-sm text-muted-foreground">
                  <input type="checkbox" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} className="mt-1" />
                  <span>
                    Ich akzeptiere die{' '}
                    <Link href="/agb" target="_blank" className="font-bold text-accent underline underline-offset-4">
                      AGB
                    </Link>
                    .
                  </span>
                </label>
                <label className="flex gap-3 text-sm text-muted-foreground">
                  <input type="checkbox" checked={acceptedPrivacy} onChange={(e) => setAcceptedPrivacy(e.target.checked)} className="mt-1" />
                  <span>
                    Ich akzeptiere die{' '}
                    <Link href="/datenschutz" target="_blank" className="font-bold text-accent underline underline-offset-4">
                      Datenschutzbestimmungen
                    </Link>
                    .
                  </span>
                </label>
              </>
            )}

            {error && (
              <div className="p-4 bg-destructive/10 border border-destructive/50 rounded text-destructive text-sm font-bold">
                {error}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={loading}
            >
              {loading ? (isSignUp ? 'KONTO WIRD ERSTELLT...' : 'ANMELDUNG...') : (isSignUp ? 'KONTO ERSTELLEN' : 'ANMELDEN')}
            </Button>
          </form>
          )}

          {!sessionLoading && !isAuthenticated && (
            <div className="pt-4 border-t border-border">
              <p className="text-center text-sm text-muted-foreground mb-3">
                {isSignUp ? 'Sie haben bereits ein Konto?' : 'Noch kein Konto?'}
              </p>
              <Button
                type="button"
                variant="outline"
                size="md"
                className="w-full"
                onClick={() => {
                  setIsSignUp(!isSignUp)
                  setError('')
                  setEmail('')
                  setPassword('')
                }}
              >
                {isSignUp ? 'ANMELDEN' : 'REGISTRIEREN'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
