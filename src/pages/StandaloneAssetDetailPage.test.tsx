import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { setupApp } from '../test-utils/appTestUtils'

describe('StandaloneAssetDetailPage', () => {
  it('renders review standalone detail route', async () => {
    setupApp('/review/detail/A-001')

    expect(await screen.findByRole('button', { name: 'Retour review' })).toBeInTheDocument()
    expect(screen.getByTestId('standalone-detail-breadcrumb')).toHaveTextContent('Review')
    expect(screen.getByTestId('standalone-detail-breadcrumb')).toHaveTextContent('A-001')
    const detail = screen.getByLabelText("Détail de l'asset")
    expect(within(detail).getByText('interview-camera-a.mov')).toBeInTheDocument()
  })

  it('renders library breadcrumb with archived level', async () => {
    setupApp('/library/detail/A-002')

    expect(await screen.findByRole('button', { name: 'Retour library' })).toBeInTheDocument()
    expect(screen.getByTestId('standalone-detail-breadcrumb')).toHaveTextContent('Library')
    expect(screen.getByTestId('standalone-detail-breadcrumb')).toHaveTextContent('ARCHIVED')
    expect(screen.getByTestId('standalone-detail-breadcrumb')).toHaveTextContent('A-002')
  })

  it('renders not found state when asset does not exist', async () => {
    setupApp('/review/detail/UNKNOWN')

    expect(await screen.findByText('Asset introuvable pour cette route.')).toBeInTheDocument()
  })

  it('uses contextual back route when from query is provided', async () => {
    const { user } = setupApp('/review/detail/A-001?from=%2Factivity')

    expect(await screen.findByRole('button', { name: 'Retour activité' })).toBeInTheDocument()
    expect(await screen.findByTestId('standalone-detail-breadcrumb')).toHaveTextContent('Activité')
    await user.click(await screen.findByRole('button', { name: 'Retour activité' }))
    expect(window.location.pathname).toBe('/activity')
  })
})
