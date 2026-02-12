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
        density="COMFORTABLE"
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
        density="COMFORTABLE"
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
        density="COMFORTABLE"
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

    const keepButtons = screen.getAllByRole('button', { name: 'KEEP' })
    const rejectButtons = screen.getAllByRole('button', { name: 'REJECT' })
    const clearButtons = screen.getAllByRole('button', { name: 'CLEAR' })
    const keepButton = keepButtons[0]
    const rejectButton = rejectButtons[0]
    const clearButton = clearButtons[1]
    if (!keepButton || !rejectButton || !clearButton) {
      throw new Error('expected action buttons were not found')
    }

    await user.click(keepButton)
    await user.click(rejectButton)
    await user.click(clearButton)

    expect(onDecision).toHaveBeenCalledWith('A-001', 'KEEP')
    expect(onDecision).toHaveBeenCalledWith('A-001', 'REJECT')
    expect(onDecision).toHaveBeenCalledWith('A-002', 'CLEAR')
  })

  it('exposes listbox active descendant and selected option semantics', () => {
    render(
      <AssetList
        assets={assets}
        selectedAssetId={'A-002'}
        batchIds={[]}
        density="COMFORTABLE"
        labels={labels}
        onDecision={vi.fn()}
        onAssetClick={vi.fn()}
      />,
    )

    const listbox = screen.getByRole('listbox')
    expect(listbox).toHaveAttribute('aria-activedescendant', 'asset-option-A-002')

    const option1 = screen.getByRole('option', { name: /interview-camera-a\.mov/i })
    const option2 = screen.getByRole('option', { name: /ambiance-plateau\.wav/i })
    expect(option1).toHaveAttribute('id', 'asset-option-A-001')
    expect(option2).toHaveAttribute('id', 'asset-option-A-002')
    expect(option2).toHaveAttribute('aria-selected', 'true')
    expect(option2).not.toHaveAttribute('aria-pressed')
  })

  it('renders compact density classes when mode is compact', () => {
    render(
      <AssetList
        assets={assets}
        selectedAssetId={'A-001'}
        batchIds={[]}
        density="COMPACT"
        labels={labels}
        onDecision={vi.fn()}
        onAssetClick={vi.fn()}
      />,
    )

    const option = screen.getByRole('option', { name: /interview-camera-a\.mov/i })
    expect(option).toHaveClass('py-2')
    expect(option.querySelector('strong')).toHaveClass('small')
  })
})
