import { act, screen, waitFor, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { getAssetsPanel, getDetailPanel, setupApp } from './test-utils/appTestUtils'

describe('App keyboard shortcuts', () => {
  it('opens next pending asset with n shortcut', async () => {
    const { user } = setupApp()

    await user.keyboard('n')

    expect(within(getDetailPanel()).getByText('ID: A-001')).toBeInTheDocument()
  })

  it('opens first visible asset with Enter shortcut', async () => {
    const { user } = setupApp()

    await user.keyboard('{Enter}')

    expect(within(getDetailPanel()).getByText('ID: A-001')).toBeInTheDocument()
  })

  it('navigates visible assets with j and k shortcuts', async () => {
    const { user } = setupApp()

    await user.keyboard('j')
    await user.keyboard('j')
    expect(within(getDetailPanel()).getByText('ID: A-002')).toBeInTheDocument()

    await user.keyboard('k')
    expect(within(getDetailPanel()).getByText('ID: A-001')).toBeInTheDocument()
  })

  it('jumps to first and last visible asset with Home and End', async () => {
    const { user } = setupApp()

    await user.keyboard('{End}')
    expect(within(getDetailPanel()).getByText('ID: A-003')).toBeInTheDocument()

    await user.keyboard('{Home}')
    expect(within(getDetailPanel()).getByText('ID: A-001')).toBeInTheDocument()
  })

  it('toggles selected asset in batch with Shift+Space', async () => {
    const { user } = setupApp()

    await user.keyboard('{Enter}')
    await user.keyboard('{Shift>}{Space}{/Shift}')

    expect(
      screen.getByText((_, element) => element?.textContent === 'Batch sélectionné: 1'),
    ).toBeInTheDocument()
  })

  it('adds all visible assets to batch with Ctrl+A', async () => {
    const { user } = setupApp()

    await user.keyboard('{Control>}a{/Control}')

    expect(screen.getByText('Batch sélectionné: 3')).toBeInTheDocument()
  })

  it('clears current selection with Escape shortcut', async () => {
    const { user } = setupApp()

    await user.keyboard('{Enter}')
    expect(within(getDetailPanel()).getByText('ID: A-001')).toBeInTheDocument()

    await user.keyboard('{Escape}')
    expect(within(getDetailPanel()).getByText('Clique un asset pour ouvrir le détail.')).toBeInTheDocument()
  })

  it('focuses search input with slash shortcut', async () => {
    const { user } = setupApp()
    const searchInput = screen.getByLabelText('Recherche')

    await user.keyboard('/')

    expect(searchInput).toHaveFocus()
  })

  it('supports browser history back for selected asset detail', async () => {
    const { user } = setupApp()

    await user.click(within(getAssetsPanel()).getByText('interview-camera-a.mov'))
    await user.click(within(getAssetsPanel()).getByText('behind-the-scenes.jpg'))
    expect(within(getDetailPanel()).getByText('ID: A-003')).toBeInTheDocument()

    act(() => {
      window.history.back()
    })

    await waitFor(() => {
      expect(within(getDetailPanel()).getByText('ID: A-001')).toBeInTheDocument()
    })
  })
})
