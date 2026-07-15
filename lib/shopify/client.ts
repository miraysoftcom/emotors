const SHOPIFY_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN
const SHOPIFY_STOREFRONT_ACCESS_TOKEN = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN

if (!SHOPIFY_DOMAIN || !SHOPIFY_STOREFRONT_ACCESS_TOKEN) {
  console.warn('Shopify environment variables not configured')
}

const SHOPIFY_GRAPHQL_ENDPOINT = `https://${SHOPIFY_DOMAIN}/api/2024-10/graphql.json`

export async function shopifyFetch<T>({
  query,
  variables,
  revalidate = 3600,
}: {
  query: string
  variables?: Record<string, any>
  revalidate?: number
}): Promise<T> {
  try {
    const response = await fetch(SHOPIFY_GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_ACCESS_TOKEN!,
      },
      body: JSON.stringify({ query, variables }),
      next: { revalidate },
    })

    const data = await response.json()

    if (data.errors) {
      throw new Error(`Shopify API Error: ${JSON.stringify(data.errors)}`)
    }

    return data.data as T
  } catch (error) {
    console.error('[Shopify API Error]', error)
    throw error
  }
}
