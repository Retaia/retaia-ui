import { describe, expect, it } from 'vitest'
import { resolveShortcutCommand } from './keyboardShortcutResolution'

function baseArgs() {
  return {
    key: '',
    code: '',
    ctrlKey: false,
    metaKey: false,
    shiftKey: false,
    isTypingContext: false,
    isSearchInputWithValue: false,
    hasPendingBatchExecution: false,
    hasVisibleAssets: true,
    hasSelectedAsset: true,
  }
}

describe('keyboardShortcutResolution', () => {
  it('handles typing context escape only for search input with value', () => {
    expect(
      resolveShortcutCommand({
        ...baseArgs(),
        key: 'Escape',
        isTypingContext: true,
        isSearchInputWithValue: true,
      }),
    ).toEqual({ type: 'clear_search' })

    expect(
      resolveShortcutCommand({
        ...baseArgs(),
        key: 'Escape',
        isTypingContext: true,
        isSearchInputWithValue: false,
      }),
    ).toBeNull()
  })

  it('resolves modifier shortcuts', () => {
    expect(
      resolveShortcutCommand({
        ...baseArgs(),
        key: 'a',
        ctrlKey: true,
      }),
    ).toEqual({ type: 'select_all_visible' })

    expect(
      resolveShortcutCommand({
        ...baseArgs(),
        key: 'Enter',
        shiftKey: true,
        hasPendingBatchExecution: true,
      }),
    ).toEqual({ type: 'confirm_pending_execute' })
  })

  it('resolves regular shortcuts', () => {
    expect(
      resolveShortcutCommand({
        ...baseArgs(),
        key: 'p',
      }),
    ).toEqual({ type: 'focus_pending' })

    expect(
      resolveShortcutCommand({
        ...baseArgs(),
        key: '/',
      }),
    ).toEqual({ type: 'focus_search' })

    expect(
      resolveShortcutCommand({
        ...baseArgs(),
        key: '?',
        shiftKey: true,
      }),
    ).toEqual({ type: 'toggle_shortcuts_help' })
  })

  it('resolves navigation commands', () => {
    expect(
      resolveShortcutCommand({
        ...baseArgs(),
        key: 'ArrowDown',
      }),
    ).toEqual({ type: 'move_selection', offset: 1, extendRange: false })

    expect(
      resolveShortcutCommand({
        ...baseArgs(),
        key: 'ArrowUp',
        shiftKey: true,
      }),
    ).toEqual({ type: 'move_selection', offset: -1, extendRange: true })

    expect(
      resolveShortcutCommand({
        ...baseArgs(),
        key: 'Enter',
        hasSelectedAsset: false,
        hasVisibleAssets: true,
      }),
    ).toEqual({ type: 'select_first_visible' })
  })
})
