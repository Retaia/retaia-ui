import { useCallback, useState } from 'react'

export type DisplayType = 'TABLE' | 'CARDS'

export function useDisplayType(storageKey: string, initial: DisplayType = 'TABLE') {
  const [displayType, setDisplayTypeState] = useState<DisplayType>(() => {
    if (typeof window === 'undefined') {
      return initial
    }
    try {
      const saved = window.localStorage.getItem(storageKey)
      if (saved === 'TABLE' || saved === 'CARDS') {
        return saved
      }
    } catch {
      // Ignore storage access errors and keep default behavior.
    }
    return initial
  })

  const setDisplayType = useCallback((next: DisplayType) => {
    setDisplayTypeState(next)
    try {
      window.localStorage.setItem(storageKey, next)
    } catch {
      // Ignore storage access errors and keep default behavior.
    }
  }, [storageKey])

  return { displayType, setDisplayType } as const
}
