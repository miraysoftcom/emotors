'use client'

import { useRouter } from 'next/navigation'
import { signOut, useSession } from '@/lib/auth-client'

type SessionHookState = ReturnType<typeof useSession> & {
  isPending?: boolean
  isLoading?: boolean
  isRefetching?: boolean
  error?: unknown
}

export function useAuthStatus() {
  const router = useRouter()
  const sessionState = useSession() as SessionHookState
  const session = sessionState.data || null
  const sessionLoading = Boolean(sessionState.isPending || sessionState.isLoading || sessionState.isRefetching)
  const authenticatedUser = session?.user || null

  async function logout(redirectTo = '/') {
    await signOut().catch(() => null)
    router.push(redirectTo)
    router.refresh()
  }

  return {
    session,
    sessionLoading,
    authenticatedUser,
    isAuthenticated: Boolean(authenticatedUser),
    logout,
  }
}
