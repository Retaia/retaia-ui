import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import App from './App'

describe('App', () => {
  const getAssetsPanel = () => screen.getByLabelText('Liste des assets')

  it('renders a simple user review UI with assets', () => {
    render(<App />)

    expect(screen.getByRole('heading', { name: 'Retaia UI' })).toBeInTheDocument()
    expect(screen.getByText('Review simple pour décider KEEP ou REJECT')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Assets (3)' })).toBeInTheDocument()
    expect(within(getAssetsPanel()).getByText('interview-camera-a.mov')).toBeInTheDocument()
    expect(screen.getByLabelText('Résumé des assets')).toBeInTheDocument()
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
