import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { setupApp } from '../test-utils/appTestUtils'

describe('LibraryPage', () => {
  it('renders archived assets library and filters by search', async () => {
    const { user } = setupApp('/library')

    expect(await screen.findByRole('heading', { name: 'Library ARCHIVED (1)' })).toBeInTheDocument()
    expect(screen.getByText('ambiance-plateau.wav')).toBeInTheDocument()

    await user.type(screen.getByTestId('library-search-input'), 'unknown')
    expect(screen.getByText("Aucun asset archivé pour les filtres en cours.")).toBeInTheDocument()
  })

  it('opens detail in panel after selecting an asset from list', async () => {
    const { user } = setupApp('/library')

    await user.click(await screen.findByText('ambiance-plateau.wav'))

    const detail = await screen.findByLabelText("Détail de l'asset")
    expect(within(detail).getByText('ambiance-plateau.wav')).toBeInTheDocument()
    expect(within(detail).getByText('ID: A-002')).toBeInTheDocument()
  })

  it('navigates to standalone detail page from detail panel action', async () => {
    const { user } = setupApp('/library')

    await user.click(await screen.findByText('ambiance-plateau.wav'))

    await user.click(await screen.findByTestId('asset-open-standalone'))
    expect(window.location.pathname).toBe('/library/detail/A-002')
    expect(decodeURIComponent(window.location.search)).toContain('from=/library')
  })

  it('persists library search across remount', async () => {
    const firstMount = setupApp('/library')
    const user = firstMount.user
    await user.type(screen.getByTestId('library-search-input'), 'ambiance')
    firstMount.unmount()

    setupApp('/library')

    expect(screen.getByTestId('library-search-input')).toHaveValue('ambiance')
  })

  it('initializes and syncs library search from query params', async () => {
    const { user } = setupApp('/library?q=ambiance')

    expect(screen.getByTestId('library-search-input')).toHaveValue('ambiance')

    await user.clear(screen.getByTestId('library-search-input'))
    await user.type(screen.getByTestId('library-search-input'), 'archive')
    expect(window.location.search).toContain('q=archive')
  })
})
