import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import ActivityPage from './ActivityPage'
import { appendActivityLogEntry } from '../services/activityLogPersistence'

describe('ActivityPage', () => {
  it('renders persisted journal entries with explicit asset links', () => {
    appendActivityLogEntry({ label: 'Decision A-001', assetId: 'A-001' })

    render(
      <MemoryRouter>
        <ActivityPage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'Activité' })).toBeInTheDocument()
    expect(screen.getByText('Decision A-001')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ouvrir asset' })).toHaveAttribute(
      'href',
      '/review/asset/A-001?from=%2Factivity',
    )
  })

  it('clears the journal from the activity workspace', async () => {
    const user = userEvent.setup()
    appendActivityLogEntry({ label: 'Decision A-001', assetId: 'A-001' })

    render(
      <MemoryRouter>
        <ActivityPage />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: "Vider journal" }))

    expect(screen.getByText('Aucune activité récente')).toBeInTheDocument()
  })
})
