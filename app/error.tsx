'use client'

import { BrandLogo } from '@/components/navigation/BrandLogo'

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
      <div className="max-w-md text-center">
        <div className="mb-8 flex justify-center">
          <BrandLogo scrolled slogan />
        </div>
        <p className="text-sm font-bold uppercase tracking-widest text-accent">Fehler</p>
        <h1 className="mt-3 text-3xl font-black">Etwas ist schiefgelaufen</h1>
        <p className="mt-3 text-muted-foreground">
          Bitte versuchen Sie es erneut.
        </p>
        <button onClick={reset} className="mt-8 rounded bg-accent px-5 py-3 text-sm font-black uppercase tracking-widest text-primary">
          Erneut versuchen
        </button>
      </div>
    </main>
  )
}
