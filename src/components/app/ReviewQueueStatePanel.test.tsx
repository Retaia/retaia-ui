import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ReviewQueueStatePanel, type ReviewQueueStateGroup } from './ReviewQueueStatePanel'

const translations: Record<string, string> = {
  'todo.region': 'Review queue tracking',
  'todo.title': 'Review queue states',
  'todo.body': 'Decisions stay distinct from applied moves.',
  'todo.blockedTitle': 'Blocked before decision',
  'todo.blockedEmpty': 'No blocked asset.',
  'todo.pendingTitle': 'Pending human decision',
  'todo.pendingEmpty': 'No asset waiting for a decision.',
  'todo.keepTitle': 'KEEP decided, move not applied',
  'todo.keepEmpty': 'No KEEP decision waiting for apply.',
  'todo.rejectTitle': 'REJECT decided, move not applied',
  'todo.rejectEmpty': 'No REJECT decision waiting for apply.',
}

const t = (key: string) => translations[key] ?? key

const groups: ReviewQueueStateGroup[] = [
  {
    key: 'qualificationBlocked',
    assets: [{ id: 'A-1', name: 'ready.mov' }],
  },
  {
    key: 'decisionPending',
    assets: [{ id: 'A-2', name: 'pending.wav' }],
  },
  {
    key: 'decidedKeep',
    assets: [{ id: 'A-3', name: 'keep.jpg' }],
  },
  {
    key: 'decidedReject',
    assets: [],
  },
]

describe('ReviewQueueStatePanel', () => {
  it('renders dedicated intermediate review state buckets', () => {
    render(<ReviewQueueStatePanel t={t} groups={groups} onOpenAsset={vi.fn()} />)

    expect(screen.getByRole('heading', { name: 'Review queue states' })).toBeInTheDocument()
    expect(screen.getByText('Decisions stay distinct from applied moves.')).toBeInTheDocument()
    expect(screen.getByText('Blocked before decision (1)')).toBeInTheDocument()
    expect(screen.getByText('Pending human decision (1)')).toBeInTheDocument()
    expect(screen.getByText('KEEP decided, move not applied (1)')).toBeInTheDocument()
    expect(screen.getByText('REJECT decided, move not applied (0)')).toBeInTheDocument()
    expect(screen.getByText('No REJECT decision waiting for apply.')).toBeInTheDocument()
  })

  it('opens the selected asset from any bucket', async () => {
    const user = userEvent.setup()
    const onOpenAsset = vi.fn()

    render(<ReviewQueueStatePanel t={t} groups={groups} onOpenAsset={onOpenAsset} />)

    await user.click(screen.getByRole('button', { name: /keep\.jpg/i }))
    expect(onOpenAsset).toHaveBeenCalledWith('A-3')
  })
})
