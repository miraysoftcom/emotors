import { shopifyFetch } from './client'
import {
  GET_PRODUCTS_QUERY,
  GET_PRODUCT_BY_HANDLE_QUERY,
  GET_COLLECTIONS_QUERY,
  GET_COLLECTION_PRODUCTS_QUERY,
  GET_CART_QUERY,
} from './queries'
import { CREATE_CART_MUTATION, ADD_TO_CART_MUTATION, UPDATE_CART_MUTATION } from './mutations'

export interface Product {
  id: string
  title: string
  handle: string
  description: string
  descriptionHtml: string
  priceRange: {
    minVariantPrice: { amount: string; currencyCode: string }
    maxVariantPrice: { amount: string; currencyCode: string }
  }
  images: Array<{
    src: string
    altText: string
  }>
  variants: Array<{
    id: string
    title: string
    availableForSale: boolean
    price: { amount: string; currencyCode: string }
    sku: string
  }>
}

export interface Collection {
  id: string
  title: string
  handle: string
  description: string
  image?: {
    src: string
    altText: string
  }
}

export async function getProducts(first: number = 12, after?: string) {
  try {
    const response = await shopifyFetch<{
      products: {
        pageInfo: { hasNextPage: boolean; endCursor: string }
        edges: Array<{ node: Product }>
      }
    }>(GET_PRODUCTS_QUERY, { first, after })

    return response.products
  } catch (error) {
    console.error('Error fetching products:', error)
    throw error
  }
}

export async function getProductByHandle(handle: string) {
  try {
    const response = await shopifyFetch<{
      productByHandle: Product
    }>(GET_PRODUCT_BY_HANDLE_QUERY, { handle })

    return response.productByHandle
  } catch (error) {
    console.error('Error fetching product:', error)
    throw error
  }
}

export async function getCollections(first: number = 10) {
  try {
    const response = await shopifyFetch<{
      collections: {
        edges: Array<{ node: Collection }>
      }
    }>(GET_COLLECTIONS_QUERY, { first })

    return response.collections.edges.map((edge) => edge.node)
  } catch (error) {
    console.error('Error fetching collections:', error)
    throw error
  }
}

export async function getCollectionProducts(
  handle: string,
  first: number = 12,
  after?: string,
  sortKey?: string
) {
  try {
    const response = await shopifyFetch<{
      collection: {
        id: string
        title: string
        description: string
        products: {
          pageInfo: { hasNextPage: boolean; endCursor: string }
          edges: Array<{ node: Product }>
        }
      }
    }>(GET_COLLECTION_PRODUCTS_QUERY, { handle, first, after, sortKey })

    return response.collection
  } catch (error) {
    console.error('Error fetching collection products:', error)
    throw error
  }
}

export async function createCart() {
  try {
    const response = await shopifyFetch<{
      cartCreate: {
        cart: {
          id: string
          checkoutUrl: string
        }
        userErrors: Array<{ field: string[]; message: string }>
      }
    }>(CREATE_CART_MUTATION, { input: {} })

    return response.cartCreate.cart
  } catch (error) {
    console.error('Error creating cart:', error)
    throw error
  }
}

export async function addToCart(cartId: string, lines: Array<{ merchandiseId: string; quantity: number }>) {
  try {
    const response = await shopifyFetch<{
      cartLinesAdd: {
        cart: {
          id: string
          checkoutUrl: string
        }
        userErrors: Array<{ field: string[]; message: string }>
      }
    }>(ADD_TO_CART_MUTATION, { cartId, lines })

    return response.cartLinesAdd.cart
  } catch (error) {
    console.error('Error adding to cart:', error)
    throw error
  }
}

export async function getCart(cartId: string) {
  try {
    const response = await shopifyFetch<{
      cart: {
        id: string
        checkoutUrl: string
        cost: {
          subtotalAmount: { amount: string; currencyCode: string }
          totalAmount: { amount: string; currencyCode: string }
          totalTaxAmount: { amount: string; currencyCode: string }
        }
        lines: {
          edges: Array<{
            node: {
              id: string
              quantity: number
              cost: { totalAmount: { amount: string; currencyCode: string } }
              merchandise: {
                id: string
                title: string
                price: { amount: string; currencyCode: string }
                product: {
                  id: string
                  title: string
                  handle: string
                  images: { edges: Array<{ node: { src: string; altText: string } }> }
                }
              }
            }
          }>
        }
      }
    }>(GET_CART_QUERY, { cartId })

    return response.cart
  } catch (error) {
    console.error('Error fetching cart:', error)
    throw error
  }
}
