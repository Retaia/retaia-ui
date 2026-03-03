/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

type ThemeMode = 'light' | 'dark' | 'system'
type ResolvedTheme = 'light' | 'dark'

type TailadminThemeContextValue = {
  mode: ThemeMode
  resolvedTheme: ResolvedTheme
  setMode: (mode: ThemeMode) => void
  toggleMode: () => void
}

const STORAGE_KEY = 'retaia_ui_theme_mode'

const fallbackContext: TailadminThemeContextValue = {
  mode: 'system',
  resolvedTheme: 'light',
  setMode: () => {},
  toggleMode: () => {},
}

const TailadminThemeContext = createContext<TailadminThemeContextValue>(fallbackContext)

function readStoredMode(): ThemeMode {
  if (typeof window === 'undefined') {
    return 'system'
  }
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (raw === 'light' || raw === 'dark' || raw === 'system') {
    return raw
  }
  return 'system'
}

export function TailadminThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(() => readStoredMode())
  const [prefersDark, setPrefersDark] = useState<boolean>(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return false
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  const resolvedTheme = useMemo<ResolvedTheme>(
    () => (mode === 'light' ? 'light' : mode === 'dark' ? 'dark' : prefersDark ? 'dark' : 'light'),
    [mode, prefersDark],
  )

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', resolvedTheme === 'dark')
    }
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, mode)
    }
  }, [mode, resolvedTheme])

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return
    }
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => {
      setPrefersDark(media.matches)
    }
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  const value = useMemo<TailadminThemeContextValue>(
    () => ({
      mode,
      resolvedTheme,
      setMode: setModeState,
      toggleMode: () => {
        setModeState((current) => {
          const base = current === 'system' ? resolvedTheme : current
          return base === 'dark' ? 'light' : 'dark'
        })
      },
    }),
    [mode, resolvedTheme],
  )

  return <TailadminThemeContext.Provider value={value}>{children}</TailadminThemeContext.Provider>
}

export function useTailadminTheme() {
  return useContext(TailadminThemeContext)
}
