'use client'

import { createContext, useContext, useEffect, useLayoutEffect, useState } from 'react'

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

  useLayoutEffect(() => {
    setMounted(true)

    // Load theme from localStorage first, then cookie. Default stays dunkel.
    const stored = normalizeTheme(localStorage.getItem('theme') || getCookieTheme())
    setThemeState(stored)

    // Default theme is dunkel. Customer selection in localStorage wins.
    applyTheme(stored)
  }, [])

  const applyTheme = (newTheme: Theme) => {
    const html = document.documentElement
    html.dataset.theme = newTheme

    if (newTheme === 'dunkel') {
      html.classList.add('dark')
      html.classList.remove('light')
      html.style.colorScheme = 'dark'
      setResolvedTheme('dunkel')
    } else {
      html.classList.remove('dark')
      html.classList.add('light')
      html.style.colorScheme = 'light'
      setResolvedTheme('hell')
    }
  }

  const setTheme = (newTheme: Theme) => {
    const nextTheme = normalizeTheme(newTheme)
    setThemeState(nextTheme)
    localStorage.setItem('theme', nextTheme)
    document.cookie = `theme=${nextTheme}; path=/; max-age=31536000; samesite=lax`
    applyTheme(nextTheme)
  }

  if (!mounted) {
    return (
      <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
        {children}
      </ThemeContext.Provider>
    )
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

function normalizeTheme(value?: string | null): Theme {
  return value === 'hell' ? 'hell' : 'dunkel'
}
