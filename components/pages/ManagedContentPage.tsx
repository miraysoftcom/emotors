import { notFound } from 'next/navigation'
import { LuxuryHeader } from '@/components/navigation/LuxuryHeader'
import { Footer } from '@/components/navigation/Footer'
import { getManagedPageBySlug } from '@/lib/pages-store'

export function ManagedContentPage({ slug }: { slug: string }) {
  const page = getManagedPageBySlug(slug)
  if (!page) notFound()

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background-secondary to-background">
      <LuxuryHeader />
      <div className="pt-32 pb-20">
        <div className="mx-auto max-w-4xl px-6">
          <article className="theme-card p-8">
            <p className="mb-3 text-xs font-black uppercase tracking-[0.28em] text-accent">MK-eMotors Dornach</p>
            <h1 className="mb-8 text-4xl font-black text-primary md:text-5xl">{page.title}</h1>
            <div
              className="managed-page-content"
              dangerouslySetInnerHTML={{ __html: page.content }}
            />
          </article>
        </div>
      </div>
      <Footer />
    </main>
  )
}
