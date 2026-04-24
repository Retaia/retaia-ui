import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ActionShortcutsSection } from './ActionShortcutsSection'

describe('ActionShortcutsSection', () => {
  const t = vi.fn((key: string) => key)

  it('renders collapsed by default and expands on toggle', () => {
    render(<ActionShortcutsSection t={t} />)

    expect(screen.queryByTestId('shortcuts-panel')).not.toBeInTheDocument()

    fireEvent.click(screen.getByTestId('shortcuts-toggle'))

    expect(screen.getByTestId('shortcuts-panel')).toBeInTheDocument()
    expect(screen.getByText('actions.shortcutsNavTitle')).toBeInTheDocument()
    expect(screen.getByText('actions.shortcutsBatchTitle')).toBeInTheDocument()
    expect(screen.getByText('actions.shortcutsFlowTitle')).toBeInTheDocument()
  })
})
