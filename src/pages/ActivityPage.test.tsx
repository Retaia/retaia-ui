import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import ActivityPage from './ActivityPage'
import { appendActivityLogEntry, clearActivityLog } from '../services/activityLogPersistence'

describe('ActivityPage', () => {
  beforeEach(() => {
    clearActivityLog()
    window.history.replaceState({}, '', '/activity')
  })

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

  it('filters the journal with query-backed local controls', async () => {
    const user = userEvent.setup()
    appendActivityLogEntry({ label: 'Decision A-001', assetId: 'A-001' })
    appendActivityLogEntry({ label: 'Retag A-002', assetId: 'A-002', scope: 'library' })
    appendActivityLogEntry({ label: 'Purge preview', scope: 'rejects' })

    render(
      <MemoryRouter>
        <ActivityPage />
      </MemoryRouter>,
    )

    await user.selectOptions(screen.getByRole('combobox'), 'library')
    expect(screen.getByText('Retag A-002')).toBeInTheDocument()
    expect(screen.queryByText('Decision A-001')).not.toBeInTheDocument()
    expect(new URLSearchParams(window.location.search).get('scope')).toBe('library')

    await user.type(screen.getByRole('searchbox'), 'A-002')
    expect(new URLSearchParams(window.location.search).get('q')).toBe('A-002')

    await user.click(screen.getByRole('checkbox', { name: 'Assets liés uniquement' }))
    expect(new URLSearchParams(window.location.search).get('linked')).toBe('1')
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
