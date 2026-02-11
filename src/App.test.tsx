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

  it('opens first visible asset with Enter shortcut', async () => {
    const user = userEvent.setup()

    render(<App />)

    await user.keyboard('{Enter}')

    expect(within(getDetailPanel()).getByText('ID: A-001')).toBeInTheDocument()
  })

  it('navigates visible assets with j and k shortcuts', async () => {
    const user = userEvent.setup()

    render(<App />)

    await user.keyboard('j')
    await user.keyboard('j')
    expect(within(getDetailPanel()).getByText('ID: A-002')).toBeInTheDocument()

    await user.keyboard('k')
    expect(within(getDetailPanel()).getByText('ID: A-001')).toBeInTheDocument()
  })

  it('toggles selected asset in batch with Shift+Space', async () => {
    const user = userEvent.setup()

    render(<App />)

    await user.keyboard('{Enter}')
    await user.keyboard('{Shift>}{Space}{/Shift}')

    expect(
      screen.getByText((_, element) => element?.textContent === 'Batch sélectionné: 1'),
    ).toBeInTheDocument()
  })

  it('adds all visible assets to batch with Ctrl+A', async () => {
    const user = userEvent.setup()

    render(<App />)

    await user.keyboard('{Control>}a{/Control}')

    expect(screen.getByText('Batch sélectionné: 3')).toBeInTheDocument()
  })

  it('logs actions and allows undo with the dedicated button', async () => {
    const user = userEvent.setup()

    render(<App />)

    await user.click(screen.getByRole('button', { name: 'KEEP visibles' }))

    const activityPanel = screen.getByLabelText("Journal d'actions")
    expect(within(activityPanel).getByText('KEEP visibles (3)')).toBeInTheDocument()
    expect(screen.getByText('A-001 - DECIDED_KEEP')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Annuler dernière action' }))

    expect(within(activityPanel).getByText('Annulation')).toBeInTheDocument()
    expect(screen.getByText('A-001 - DECISION_PENDING')).toBeInTheDocument()
  })

  it('supports undo with Ctrl+Z shortcut', async () => {
    const user = userEvent.setup()

    render(<App />)

    await user.click(screen.getAllByRole('button', { name: 'REJECT' })[0])
    expect(screen.getByText('A-001 - DECIDED_REJECT')).toBeInTheDocument()

    await user.keyboard('{Control>}z{/Control}')
    expect(screen.getByText('A-001 - DECISION_PENDING')).toBeInTheDocument()
  })
})
