'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'hell' | 'dunkel'

interface ThemeContextType {
  theme: Theme
  resolvedTheme: 'hell' | 'dunkel'
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dunkel')
  const [resolvedTheme, setResolvedTheme] = useState<'hell' | 'dunkel'>('dunkel')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Load theme from localStorage first, then cookie. Default stays dunkel.
    const stored = (localStorage.getItem('theme') || getCookieTheme()) as Theme | null
    if (stored) {
      setThemeState(stored)
    }

    // Default theme is dunkel. Customer selection in localStorage wins.
    applyTheme(stored || 'dunkel')
  }, [])

  const applyTheme = (newTheme: Theme) => {
    const html = document.documentElement

    if (newTheme === 'dunkel') {
      html.classList.add('dark')
      html.classList.remove('light')
      setResolvedTheme('dunkel')
    } else {
      html.classList.remove('dark')
      html.classList.add('light')
      setResolvedTheme('hell')
    }
  }

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    localStorage.setItem('theme', newTheme)
    document.cookie = `theme=${newTheme}; path=/; max-age=31536000; samesite=lax`
    applyTheme(newTheme)
  }

  if (!mounted) {
    return <>{children}</>
  }

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    // Fallback for SSR/build time - return default values
    return {
      theme: 'dunkel' as const,
      resolvedTheme: 'dunkel' as const,
      setTheme: () => {},
    }
  }
  return context
}

function getCookieTheme() {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(/(?:^|;\s*)theme=(dunkel|hell)(?:;|$)/)
  return match?.[1] || null
}
