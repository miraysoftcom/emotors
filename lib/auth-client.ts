import { createAuthClient } from 'better-auth/react'

const baseURL = typeof window !== 'undefined'
  ? window.location.origin
  : process.env.NEXT_PUBLIC_APP_URL

export const { signIn, signUp, useSession, signOut } = createAuthClient({
  baseURL,
})
