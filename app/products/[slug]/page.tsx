import { redirect } from 'next/navigation'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function ProductDetailAliasPage({ params }: PageProps) {
  const { slug } = await params
  redirect(`/produkte/${slug}`)
}
