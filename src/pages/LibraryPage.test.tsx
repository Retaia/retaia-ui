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

  it('opens detail from deep-link route', async () => {
    setupApp('/library/A-002')

    const detail = await screen.findByLabelText("Détail de l'asset")
    expect(within(detail).getByText('ambiance-plateau.wav')).toBeInTheDocument()
    expect(within(detail).getByText('ID: A-002')).toBeInTheDocument()
  })

  it('navigates to standalone detail page from detail panel action', async () => {
    const { user } = setupApp('/library/A-002')

    await user.click(await screen.findByTestId('asset-open-standalone'))
    expect(window.location.pathname).toBe('/library/detail/A-002')
  })
})
