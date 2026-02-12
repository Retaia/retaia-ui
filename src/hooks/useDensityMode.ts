import { useCallback, useState } from 'react'

const DENSITY_MODE_KEY = 'retaia_ui_density_mode'

export type DensityMode = 'COMFORTABLE' | 'COMPACT'

export function useDensityMode(initial: DensityMode = 'COMFORTABLE') {
  const [densityMode, setDensityMode] = useState<DensityMode>(() => {
    if (typeof window === 'undefined') {
      return initial
    }
    try {
      const saved = window.localStorage.getItem(DENSITY_MODE_KEY)
      if (saved === 'COMPACT' || saved === 'COMFORTABLE') {
        return saved
      }
    } catch {
      // Ignore storage access errors and keep default behavior.
    }
    return initial
  })

  const toggleDensityMode = useCallback(() => {
    setDensityMode((current) => {
      const next = current === 'COMPACT' ? 'COMFORTABLE' : 'COMPACT'
      try {
        window.localStorage.setItem(DENSITY_MODE_KEY, next)
      } catch {
        // Ignore storage access errors and keep default behavior.
      }
      return next
    })
  }, [])

  return { densityMode, toggleDensityMode } as const
}
