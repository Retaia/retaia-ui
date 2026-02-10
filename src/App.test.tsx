import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import App from './App'

describe('App', () => {
  it('renders a simple user review UI with assets', () => {
    render(<App />)

    expect(screen.getByRole('heading', { name: 'Retaia UI' })).toBeInTheDocument()
    expect(screen.getByText('Interface simple de revue utilisateur')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Assets (3)' })).toBeInTheDocument()
    expect(screen.getByText('interview-camera-a.mov')).toBeInTheDocument()
  })

  it('filters assets by state', async () => {
    const user = userEvent.setup()

    render(<App />)

    await user.selectOptions(screen.getByLabelText('Filtrer par état'), 'DECISION_PENDING')

    expect(screen.getByRole('heading', { name: 'Assets (1)' })).toBeInTheDocument()
    expect(screen.getByText('interview-camera-a.mov')).toBeInTheDocument()
    expect(screen.queryByText('ambiance-plateau.wav')).not.toBeInTheDocument()
  })

  it('allows deciding keep and disables the action when already keep', async () => {
    const user = userEvent.setup()

    render(<App />)

    const actionButtons = screen.getAllByRole('button', { name: 'Décider KEEP' })
    await user.click(actionButtons[0])

    expect(screen.getByText('A-001 - DECIDED_KEEP')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Décider KEEP' })[0]).toBeDisabled()
  })
})
