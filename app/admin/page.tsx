'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function AdminPage() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    // Check for admin session cookie by attempting to fetch a protected resource
    const checkSession = async () => {
      try {
        const response = await fetch('/api/admin/settings', {
          method: 'GET',
          credentials: 'include',
        })

        if (response.ok) {
          // Session is valid, redirect to dashboard
          router.push('/admin/dashboard')
          return
        }
      } catch {
        // Error checking session
      }

      // No valid session, redirect to login
      router.push('/admin/login')
      setChecking(false)
    }

    checkSession()
  }, [router])

  // Show loading state while checking authentication
  if (checking) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin">
            <div className="h-12 w-12 border-4 border-blue-600 border-t-white rounded-full" />
          </div>
          <p className="text-white mt-4">Wird geladen...</p>
        </div>
      </div>
    )
  }

  return null
}
