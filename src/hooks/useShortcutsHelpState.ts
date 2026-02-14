import { useCallback, useState } from 'react'

export const SHORTCUTS_HELP_SEEN_KEY = 'retaia_ui_shortcuts_help_seen'

export function readInitialShortcutsHelpVisibility() {
  if (typeof window === 'undefined') {
    return false
  }
  try {
    const seen = window.localStorage.getItem(SHORTCUTS_HELP_SEEN_KEY)
    if (seen) {
      return false
    }
    window.localStorage.setItem(SHORTCUTS_HELP_SEEN_KEY, '1')
    return true
  } catch {
    return false
  }
}

export function useShortcutsHelpState() {
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(readInitialShortcutsHelpVisibility)
  const toggleShortcutsHelp = useCallback(() => {
    setShowShortcutsHelp((current) => !current)
  }, [])

  return {
    showShortcutsHelp,
    toggleShortcutsHelp,
  }
}
