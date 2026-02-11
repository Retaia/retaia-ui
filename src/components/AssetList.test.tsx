import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { AssetList } from './AssetList'

const assets = [
  { id: 'A-001', name: 'interview-camera-a.mov', state: 'DECISION_PENDING' as const },
  { id: 'A-002', name: 'ambiance-plateau.wav', state: 'DECIDED_KEEP' as const },
]

const labels = {
  empty: 'Aucun asset ne correspond aux filtres.',
  batch: 'Batch',
  keep: 'KEEP',
  reject: 'REJECT',
  clear: 'CLEAR',
}

describe('AssetList', () => {
  it('renders empty state when no assets', () => {
    render(
      <AssetList
        assets={[]}
        selectedAssetId={null}
        batchIds={[]}
        labels={labels}
        onDecision={vi.fn()}
        onAssetClick={vi.fn()}
      />, 
    )

    expect(screen.getByText('Aucun asset ne correspond aux filtres.')).toBeInTheDocument()
  })

  it('opens detail on click and supports shift+click batch', async () => {
    const user = userEvent.setup()
    const onAssetClick = vi.fn()

    render(
      <AssetList
        assets={assets}
        selectedAssetId={null}
        batchIds={[]}
        labels={labels}
        onDecision={vi.fn()}
        onAssetClick={onAssetClick}
      />,
    )

    await user.click(screen.getByText('interview-camera-a.mov'))
    expect(onAssetClick).toHaveBeenCalledWith('A-001', false)

    await user.keyboard('{Shift>}')
    await user.click(screen.getByText('ambiance-plateau.wav'))
    await user.keyboard('{/Shift}')
    expect(onAssetClick).toHaveBeenCalledWith('A-002', true)
  })

  it('handles keyboard activation and decision buttons', async () => {
    const user = userEvent.setup()
    const onAssetClick = vi.fn()
    const onDecision = vi.fn()

    render(
      <AssetList
        assets={assets}
        selectedAssetId={'A-001'}
        batchIds={['A-002']}
        labels={labels}
        onDecision={onDecision}
        onAssetClick={onAssetClick}
      />,
    )

    const row = screen.getByText('interview-camera-a.mov').closest('li')
    if (!row) {
      throw new Error('row not found')
    }
    fireEvent.keyDown(row, { key: 'Enter' })
    expect(onAssetClick).toHaveBeenCalledWith('A-001', false)

    await user.click(screen.getAllByRole('button', { name: 'KEEP' })[0])
    await user.click(screen.getAllByRole('button', { name: 'REJECT' })[0])
    await user.click(screen.getAllByRole('button', { name: 'CLEAR' })[1])

    expect(onDecision).toHaveBeenCalledWith('A-001', 'KEEP')
    expect(onDecision).toHaveBeenCalledWith('A-001', 'REJECT')
    expect(onDecision).toHaveBeenCalledWith('A-002', 'CLEAR')
  })
})
