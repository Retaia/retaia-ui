import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import {
  readInitialShortcutsHelpVisibility,
  SHORTCUTS_HELP_SEEN_KEY,
  useShortcutsHelpState,
} from './useShortcutsHelpState'

describe('useShortcutsHelpState', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('shows shortcuts help once and persists seen flag', () => {
    expect(readInitialShortcutsHelpVisibility()).toBe(true)
    expect(window.localStorage.getItem(SHORTCUTS_HELP_SEEN_KEY)).toBe('1')
    expect(readInitialShortcutsHelpVisibility()).toBe(false)
  })

  it('toggles visibility state', () => {
    const { result } = renderHook(() => useShortcutsHelpState())

    expect(result.current.showShortcutsHelp).toBe(true)

    act(() => {
      result.current.toggleShortcutsHelp()
    })
    expect(result.current.showShortcutsHelp).toBe(false)

    act(() => {
      result.current.toggleShortcutsHelp()
    })
    expect(result.current.showShortcutsHelp).toBe(true)
  })
})
