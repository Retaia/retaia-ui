import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import App from './App'

describe('App', () => {
  const getAssetsPanel = () => screen.getByLabelText('Liste des assets')
  const getDetailPanel = () => screen.getByLabelText("Détail de l'asset")

  it('renders a simple user review UI with assets', () => {
    render(<App />)

    expect(screen.getByRole('heading', { name: 'Retaia UI' })).toBeInTheDocument()
    expect(screen.getByText('Review simple pour décider KEEP ou REJECT')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Assets (3)' })).toBeInTheDocument()
    expect(within(getAssetsPanel()).getByText('interview-camera-a.mov')).toBeInTheDocument()
    expect(screen.getByLabelText('Résumé des assets')).toBeInTheDocument()
    expect(within(getDetailPanel()).getByText('Clique un asset pour ouvrir le détail.')).toBeInTheDocument()
  })

  it('filters assets by state', async () => {
    const user = userEvent.setup()

    render(<App />)

    await user.selectOptions(screen.getByLabelText('Filtrer par état'), 'DECISION_PENDING')

    expect(screen.getByRole('heading', { name: 'Assets (1)' })).toBeInTheDocument()
    expect(within(getAssetsPanel()).getByText('interview-camera-a.mov')).toBeInTheDocument()
    expect(within(getAssetsPanel()).queryByText('ambiance-plateau.wav')).not.toBeInTheDocument()
  })

  it('supports keep reject clear actions', async () => {
    const user = userEvent.setup()

    render(<App />)

    await user.click(screen.getAllByRole('button', { name: 'REJECT' })[0])
    expect(screen.getByText('A-001 - DECIDED_REJECT')).toBeInTheDocument()

    await user.click(screen.getAllByRole('button', { name: 'CLEAR' })[0])
    expect(screen.getByText('A-001 - DECISION_PENDING')).toBeInTheDocument()

    await user.click(screen.getAllByRole('button', { name: 'KEEP' })[0])
    expect(screen.getByText('A-001 - DECIDED_KEEP')).toBeInTheDocument()
  })

  it('opens detail panel on click', async () => {
    const user = userEvent.setup()

    render(<App />)

    await user.click(within(getAssetsPanel()).getByText('behind-the-scenes.jpg'))

    expect(within(getDetailPanel()).getByText('behind-the-scenes.jpg')).toBeInTheDocument()
    expect(within(getDetailPanel()).getByText('ID: A-003')).toBeInTheDocument()
  })

  it('filters assets with free-text search', async () => {
    const user = userEvent.setup()

    render(<App />)

    await user.type(screen.getByLabelText('Recherche'), 'behind')

    expect(screen.getByRole('heading', { name: 'Assets (1)' })).toBeInTheDocument()
    expect(within(getAssetsPanel()).getByText('behind-the-scenes.jpg')).toBeInTheDocument()
    expect(within(getAssetsPanel()).queryByText('interview-camera-a.mov')).not.toBeInTheDocument()
  })

  it('shows an empty state when filters match no asset', async () => {
    const user = userEvent.setup()

    render(<App />)

    await user.type(screen.getByLabelText('Recherche'), 'no-match')

    expect(screen.getByRole('heading', { name: 'Assets (0)' })).toBeInTheDocument()
    expect(screen.getByText('Aucun asset ne correspond aux filtres.')).toBeInTheDocument()
  })

  it('focuses pending assets using quick action', async () => {
    const user = userEvent.setup()

    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Voir à traiter' }))

    expect(screen.getByRole('heading', { name: 'Assets (1)' })).toBeInTheDocument()
    expect(screen.getByText('A-001 - DECISION_PENDING')).toBeInTheDocument()
  })

  it('adds assets to batch with shift+click and applies batch action', async () => {
    const user = userEvent.setup()

    render(<App />)

    await user.keyboard('{Shift>}')
    await user.click(within(getAssetsPanel()).getByText('interview-camera-a.mov'))
    await user.click(within(getAssetsPanel()).getByText('behind-the-scenes.jpg'))
    await user.keyboard('{/Shift}')

    expect(screen.getByText('Batch sélectionné: 2')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'KEEP batch' }))

    expect(screen.getByText('Batch sélectionné: 0')).toBeInTheDocument()
    expect(within(getAssetsPanel()).getByText('A-001 - DECIDED_KEEP')).toBeInTheDocument()
    expect(within(getAssetsPanel()).getByText('A-003 - DECIDED_KEEP')).toBeInTheDocument()
  })

  it('applies KEEP to all visible assets', async () => {
    const user = userEvent.setup()

    render(<App />)

    await user.click(screen.getByRole('button', { name: 'KEEP visibles' }))

    expect(screen.getByText('A-001 - DECIDED_KEEP')).toBeInTheDocument()
    expect(screen.getByText('A-002 - DECIDED_KEEP')).toBeInTheDocument()
    expect(screen.getByText('A-003 - DECIDED_KEEP')).toBeInTheDocument()
  })

  it('handles next pending asset actions', async () => {
    const user = userEvent.setup()

    render(<App />)

    expect(screen.getByRole('heading', { name: 'Prochain asset à traiter' })).toBeInTheDocument()
    expect(screen.getAllByText('interview-camera-a.mov')[0]).toBeInTheDocument()

    await user.click(screen.getAllByRole('button', { name: 'REJECT' })[0])

    expect(screen.getByText('Plus aucun asset en attente.')).toBeInTheDocument()
  })
})
