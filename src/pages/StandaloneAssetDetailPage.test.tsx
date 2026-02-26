import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { setupApp } from '../test-utils/appTestUtils'

describe('StandaloneAssetDetailPage', () => {
  it('renders review standalone detail route', async () => {
    setupApp('/review/detail/A-001')

    expect(await screen.findByRole('button', { name: 'Retour review' })).toBeInTheDocument()
    const detail = screen.getByLabelText("Détail de l'asset")
    expect(within(detail).getByText('interview-camera-a.mov')).toBeInTheDocument()
  })

  it('renders not found state when asset does not exist', async () => {
    setupApp('/review/detail/UNKNOWN')

    expect(await screen.findByText('Asset introuvable pour cette route.')).toBeInTheDocument()
  })
})
