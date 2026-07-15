import Link from 'next/link'
import { BrandLogo } from '@/components/navigation/BrandLogo'

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
      <div className="max-w-md text-center">
        <div className="mb-8 flex justify-center">
          <BrandLogo scrolled slogan />
        </div>
        <p className="text-sm font-bold uppercase tracking-widest text-accent">404</p>
        <h1 className="mt-3 text-3xl font-black">Seite nicht gefunden</h1>
        <p className="mt-3 text-muted-foreground">
          Die gewünschte Seite ist nicht verfügbar.
        </p>
        <Link href="/" className="mt-8 inline-flex rounded bg-accent px-5 py-3 text-sm font-black uppercase tracking-widest text-primary">
          Zur Startseite
        </Link>
      </div>
    </main>
  )
}
