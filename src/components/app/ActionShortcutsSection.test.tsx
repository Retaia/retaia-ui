import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ActionShortcutsSection } from './ActionShortcutsSection'

const t = (key: string) => key

describe('ActionShortcutsSection', () => {
  it('hides overlay when shortcuts help is disabled', () => {
    render(
      <ActionShortcutsSection
        t={t}
        showShortcutsHelp={false}
        onToggleShortcutsHelp={vi.fn()}
        onFocusPending={vi.fn()}
        onToggleBatchOnly={vi.fn()}
        onOpenNextPending={vi.fn()}
      />,
    )

    expect(screen.queryByTestId('shortcuts-overlay')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'actions.shortcutsToggleShow' })).toBeInTheDocument()
  })

  it('shows overlay and forwards callbacks', async () => {
    const user = userEvent.setup()
    const onToggleShortcutsHelp = vi.fn()
    const onFocusPending = vi.fn()
    const onToggleBatchOnly = vi.fn()
    const onOpenNextPending = vi.fn()

    render(
      <ActionShortcutsSection
        t={t}
        showShortcutsHelp
        onToggleShortcutsHelp={onToggleShortcutsHelp}
        onFocusPending={onFocusPending}
        onToggleBatchOnly={onToggleBatchOnly}
        onOpenNextPending={onOpenNextPending}
      />,
    )

    expect(screen.getByTestId('shortcuts-overlay')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'actions.shortcutsToggleHide' }))
    expect(onToggleShortcutsHelp).toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: 'actions.shortcutsActionPending' }))
    expect(onFocusPending).toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: 'actions.shortcutsActionBatch' }))
    expect(onToggleBatchOnly).toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: 'actions.shortcutsActionNext' }))
    expect(onOpenNextPending).toHaveBeenCalled()
  })
})
