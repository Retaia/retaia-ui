import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ActionJournalSection } from './ActionJournalSection'

const t = (key: string) => key

describe('ActionJournalSection', () => {
  it('renders empty state and disabled clear button', () => {
    render(
      <ActionJournalSection
        t={t}
        activityLog={[]}
        onClearActivityLog={vi.fn()}
      />,
    )

    expect(screen.getByText('actions.journalEmpty')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'actions.journalClear' })).toBeDisabled()
  })

  it('renders entries and clears journal', async () => {
    const user = userEvent.setup()
    const onClearActivityLog = vi.fn()
    render(
      <ActionJournalSection
        t={t}
        activityLog={[
          { id: 1, label: 'entry-1' },
          { id: 2, label: 'entry-2' },
        ]}
        onClearActivityLog={onClearActivityLog}
      />,
    )

    expect(screen.getByText('entry-1')).toBeInTheDocument()
    expect(screen.getByText('entry-2')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'actions.journalClear' }))
    expect(onClearActivityLog).toHaveBeenCalled()
  })
})
